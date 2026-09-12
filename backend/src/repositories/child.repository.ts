import { Child, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface CreateChildData {
  displayName: string;
  avatar?: string | null;
  ageGroup: string;
}

export const childRepository = {
  createForParent(parentId: string, data: CreateChildData): Promise<Child> {
    return prisma.child.create({
      data: {
        displayName: data.displayName,
        avatar: data.avatar ?? null,
        ageGroup: data.ageGroup,
        parents: { create: { parentId } }
      }
    });
  },

  listForParent(parentId: string): Promise<Child[]> {
    return prisma.child.findMany({
      where: { parents: { some: { parentId } } },
      orderBy: { createdAt: 'asc' }
    });
  },

  findById(id: string): Promise<Child | null> {
    return prisma.child.findUnique({ where: { id } });
  },

  findForParent(childId: string, parentId: string): Promise<Child | null> {
    return prisma.child.findFirst({
      where: { id: childId, parents: { some: { parentId } } }
    });
  },

  update(id: string, data: Prisma.ChildUpdateInput): Promise<Child> {
    return prisma.child.update({ where: { id }, data });
  },

  delete(id: string): Promise<Child> {
    return prisma.child.delete({ where: { id } });
  },

  async isParentOfChild(parentId: string, childId: string): Promise<boolean> {
    const link = await prisma.parentChild.findUnique({
      where: { parentId_childId: { parentId, childId } },
      select: { id: true }
    });
    return Boolean(link);
  },

  countForParent(parentId: string): Promise<number> {
    return prisma.parentChild.count({ where: { parentId } });
  },

  addParent(childId: string, parentId: string, relationship?: string) {
    return prisma.parentChild.create({ data: { childId, parentId, relationship } });
  }
};

export const childAdminRepository = {
  count(): Promise<number> {
    return prisma.child.count();
  }
};
