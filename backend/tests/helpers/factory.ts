import { Child, Role, User } from '@prisma/client';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';
import { signAccessToken } from '../../src/utils/jwt';

let counter = 0;
function uniqueEmail(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}@example.test`;
}

export async function createUser(options: Partial<{ role: Role; email: string; password: string; name: string }> = {}): Promise<{ user: User; password: string; token: string; authHeader: string }> {
  const password = options.password ?? 'Passw0rd!';
  const user = await prisma.user.create({
    data: {
      email: options.email ?? uniqueEmail(options.role === Role.ADMIN ? 'admin' : 'parent'),
      name: options.name ?? 'Test User',
      passwordHash: await hashPassword(password),
      role: options.role ?? Role.PARENT
    }
  });
  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { user, password, token, authHeader: `Bearer ${token}` };
}

export async function createChild(parentId: string, overrides: Partial<Child> = {}): Promise<Child> {
  return prisma.child.create({
    data: {
      displayName: overrides.displayName ?? 'Test Kid',
      avatar: overrides.avatar ?? '🦊',
      ageGroup: overrides.ageGroup ?? '6-8',
      parents: { create: { parentId } },
      ...(overrides.xp !== undefined ? { xp: overrides.xp } : {}),
      ...(overrides.stars !== undefined ? { stars: overrides.stars } : {}),
      ...(overrides.level !== undefined ? { level: overrides.level } : {})
    }
  });
}

export async function createColoringPage(createdById?: string) {
  return prisma.coloringPage.create({
    data: {
      title: 'Test Page',
      description: 'A test coloring page',
      category: 'ANIMALS',
      ageGroup: '6-8',
      difficulty: 'EASY',
      lineArtUrl: '/uploads/seed/test.png',
      isPublished: true,
      ...(createdById ? { createdById } : {})
    }
  });
}

export async function createGame(overrides: Partial<{ slug: string; title: string }> = {}) {
  return prisma.game.create({
    data: {
      title: overrides.title ?? 'Test Game',
      slug: overrides.slug ?? `test-game-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      description: 'A test game',
      category: 'MATH',
      difficulty: 'EASY',
      ageGroup: '6-8',
      instructions: 'Just play',
      config: { rounds: 1 },
      isActive: true
    }
  });
}

export async function createStory(isPublished = true) {
  return prisma.story.create({
    data: {
      title: 'Test Story',
      description: 'A test story',
      category: 'ADVENTURE',
      ageGroup: '6-8',
      readingTimeMinutes: 3,
      difficulty: 'EASY',
      isPublished,
      pages: {
        create: [
          { pageNumber: 1, text: 'Once upon a time.' },
          { pageNumber: 2, text: 'The end.' }
        ]
      }
    }
  });
}
