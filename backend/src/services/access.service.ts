import { Role } from '@prisma/client';
import { childRepository } from '../repositories/child.repository';
import { AppError } from '../utils/AppError';

export interface AuthUser {
  id: string;
  role: Role;
}

export const accessService = {
  async assertChildAccess(user: AuthUser, childId: string): Promise<void> {
    const child = await childRepository.findById(childId);
    if (!child) throw AppError.notFound('Child not found');

    if (user.role === Role.ADMIN) return;

    const allowed = await childRepository.isParentOfChild(user.id, childId);
    if (!allowed) {
      throw AppError.forbidden('You can only access your own children');
    }
  }
};
