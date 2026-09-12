import { Child, Role } from '@prisma/client';
import { childRepository, CreateChildData } from '../repositories/child.repository';
import { accessService, AuthUser } from './access.service';
import { AppError } from '../utils/AppError';

export const childService = {
  async create(user: AuthUser, data: CreateChildData): Promise<Child> {
    return childRepository.createForParent(user.id, data);
  },

  async list(user: AuthUser): Promise<Child[]> {
    if (user.role === Role.ADMIN) {
      return childRepository.listForParent(user.id);
    }
    return childRepository.listForParent(user.id);
  },

  async get(user: AuthUser, childId: string): Promise<Child> {
    await accessService.assertChildAccess(user, childId);
    const child = await childRepository.findById(childId);
    if (!child) throw AppError.notFound('Child not found');
    return child;
  },

  async update(user: AuthUser, childId: string, data: Partial<CreateChildData>): Promise<Child> {
    await accessService.assertChildAccess(user, childId);
    return childRepository.update(childId, {
      ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
      ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      ...(data.ageGroup !== undefined ? { ageGroup: data.ageGroup } : {})
    });
  },

  async remove(user: AuthUser, childId: string): Promise<void> {
    await accessService.assertChildAccess(user, childId);
    await childRepository.delete(childId);
  }
};
