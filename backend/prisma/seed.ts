import {
  ActivityType,
  ColoringCategory,
  Difficulty,
  GameCategory,
  Prisma,
  PrismaClient,
  Role,
  StoryCategory
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

const coloringPages: Array<{
  id: string;
  title: string;
  description: string;
  category: ColoringCategory;
  ageGroup: string;
  difficulty: Difficulty;
}> = [
  { id: 'cp_lion', title: 'Smiling Lion Cub', description: 'A friendly lion cub sitting in the grass.', category: ColoringCategory.ANIMALS, ageGroup: '4-6', difficulty: Difficulty.EASY },
  { id: 'cp_elephant', title: 'Baby Elephant Splash', description: 'A baby elephant playing with water.', category: ColoringCategory.ANIMALS, ageGroup: '4-6', difficulty: Difficulty.EASY },
  { id: 'cp_trex', title: 'T-Rex at the Volcano', description: 'A gentle T-Rex near a friendly volcano.', category: ColoringCategory.DINOSAURS, ageGroup: '6-8', difficulty: Difficulty.MEDIUM },
  { id: 'cp_bronto', title: 'Friendly Brontosaurus', description: 'A long-necked dinosaur in a green valley.', category: ColoringCategory.DINOSAURS, ageGroup: '4-6', difficulty: Difficulty.EASY },
  { id: 'cp_rocket', title: 'Rocket to the Stars', description: 'A cheerful rocket flying past planets.', category: ColoringCategory.SPACE, ageGroup: '6-8', difficulty: Difficulty.MEDIUM },
  { id: 'cp_astronaut', title: 'Astronaut Kitten', description: 'A cute kitten astronaut on the moon.', category: ColoringCategory.SPACE, ageGroup: '6-8', difficulty: Difficulty.MEDIUM },
  { id: 'cp_dolphin', title: 'Dolphin Reef', description: 'A smiling dolphin among coral and fish.', category: ColoringCategory.UNDER_THE_SEA, ageGroup: '4-6', difficulty: Difficulty.EASY },
  { id: 'cp_castle', title: 'Fairy Tale Castle', description: 'A magical castle on a sunny hill.', category: ColoringCategory.FANTASY, ageGroup: '8-10', difficulty: Difficulty.HARD },
  { id: 'cp_car', title: 'Happy Little Car', description: 'A round friendly car on a country road.', category: ColoringCategory.VEHICLES, ageGroup: '3-5', difficulty: Difficulty.EASY },
  { id: 'cp_autumn', title: 'Autumn Leaf Friends', description: 'Falling leaves and a smiling squirrel.', category: ColoringCategory.SEASONS, ageGroup: '4-6', difficulty: Difficulty.EASY }
];

const games: Array<{
  title: string;
  slug: string;
  description: string;
  category: GameCategory;
  difficulty: Difficulty;
  ageGroup: string;
  instructions: string;
  config: Record<string, unknown>;
}> = [
  { title: 'Memory Match', slug: 'memory-match', description: 'Flip cards and match friendly animal pairs.', category: GameCategory.MEMORY, difficulty: Difficulty.EASY, ageGroup: '4-6', instructions: 'Tap two cards to find a matching pair.', config: { pairs: 6, theme: 'animals' } },
  { title: 'Math Adventure', slug: 'math-adventure', description: 'Help Captain Leo count star crystals.', category: GameCategory.MATH, difficulty: Difficulty.EASY, ageGroup: '6-8', instructions: 'Choose the correct answer to power the rocket.', config: { operations: ['add'], maxNumber: 20, rounds: 10 } },
  { title: 'Color Match', slug: 'color-match', description: 'Match colors to cheerful objects.', category: GameCategory.COLORS, difficulty: Difficulty.EASY, ageGroup: '3-5', instructions: 'Drag each object to its matching color.', config: { palette: ['red', 'blue', 'yellow', 'green'] } },
  { title: 'Shape Puzzle', slug: 'shape-puzzle', description: 'Fit shapes into their cozy homes.', category: GameCategory.SHAPES, difficulty: Difficulty.EASY, ageGroup: '4-6', instructions: 'Drag each shape into the matching slot.', config: { shapes: ['circle', 'square', 'triangle', 'star'] } },
  { title: 'Animal Quiz', slug: 'animal-quiz', description: 'Guess the animal from fun facts.', category: GameCategory.SCIENCE, difficulty: Difficulty.MEDIUM, ageGroup: '6-8', instructions: 'Pick the animal that matches the clue.', config: { rounds: 10 } },
  { title: 'Word Builder', slug: 'word-builder', description: 'Build simple words from letters.', category: GameCategory.READING, difficulty: Difficulty.MEDIUM, ageGroup: '6-8', instructions: 'Arrange the letters to spell the picture.', config: { words: ['cat', 'sun', 'hat', 'dog'] } },
  { title: 'Number Challenge', slug: 'number-challenge', description: 'Count and compare numbers quickly.', category: GameCategory.MATH, difficulty: Difficulty.MEDIUM, ageGroup: '8-10', instructions: 'Pick the bigger number before time runs out.', config: { rounds: 12, maxNumber: 100 } },
  { title: 'Space Explorer', slug: 'space-explorer', description: 'Pilot a rocket through friendly asteroids.', category: GameCategory.SCIENCE, difficulty: Difficulty.MEDIUM, ageGroup: '8-10', instructions: 'Steer the rocket and collect stars.', config: { speed: 'gentle', collectibles: 20 } },
  { title: 'Pattern Master', slug: 'pattern-master', description: 'Continue the colorful patterns.', category: GameCategory.PUZZLE, difficulty: Difficulty.MEDIUM, ageGroup: '6-8', instructions: 'Choose the shape that finishes the pattern.', config: { rounds: 10, maxLength: 6 } },
  { title: 'Vocabulary Quest', slug: 'vocabulary-quest', description: 'Match words to their pictures.', category: GameCategory.VOCABULARY, difficulty: Difficulty.HARD, ageGroup: '8-10', instructions: 'Pick the correct word for each picture.', config: { rounds: 15 } }
];

const achievements = [
  { code: 'FIRST_ADVENTURE', title: 'First Adventure', description: 'Complete your very first activity.', icon: 'explore', criteria: { metric: 'total_completed', count: 1 }, xpReward: 20, starReward: 5 },
  { code: 'CREATIVE_ARTIST', title: 'Creative Artist', description: 'Complete 3 coloring pages.', icon: 'palette', criteria: { metric: 'coloring_completed', count: 3 }, xpReward: 40, starReward: 10 },
  { code: 'BOOK_EXPLORER', title: 'Book Explorer', description: 'Finish 3 stories.', icon: 'menu_book', criteria: { metric: 'stories_completed', count: 3 }, xpReward: 40, starReward: 10 },
  { code: 'PUZZLE_MASTER', title: 'Puzzle Master', description: 'Complete 5 games.', icon: 'extension', criteria: { metric: 'games_completed', count: 5 }, xpReward: 60, starReward: 15 },
  { code: 'MATH_EXPLORER', title: 'Math Explorer', description: 'Complete 3 games.', icon: 'calculate', criteria: { metric: 'games_completed', count: 3 }, xpReward: 40, starReward: 10 },
  { code: 'READING_STAR', title: 'Reading Star', description: 'Finish your first story.', icon: 'auto_stories', criteria: { metric: 'stories_completed', count: 1 }, xpReward: 25, starReward: 8 },
  { code: 'GAME_HERO', title: 'Game Hero', description: 'Complete 10 games.', icon: 'sports_esports', criteria: { metric: 'games_completed', count: 10 }, xpReward: 100, starReward: 25 },
  { code: 'STAR_COLLECTOR', title: 'Star Collector', description: 'Collect 100 stars.', icon: 'star', criteria: { metric: 'total_stars', count: 100 }, xpReward: 80, starReward: 20 },
  { code: 'LEVEL_UP_5', title: 'Rising Explorer', description: 'Reach level 5.', icon: 'military_tech', criteria: { metric: 'level', count: 5 }, xpReward: 120, starReward: 30 },
  { code: 'WONDER_CHAMPION', title: 'Wonder Champion', description: 'Complete 25 activities in total.', icon: 'emoji_events', criteria: { metric: 'total_completed', count: 25 }, xpReward: 200, starReward: 50 }
];

const stories: Array<{
  id: string;
  title: string;
  description: string;
  category: StoryCategory;
  ageGroup: string;
  readingTimeMinutes: number;
  difficulty: Difficulty;
  pages: string[];
}> = [
  { id: 'st_forest_fox', title: 'The Whispering Forest & The Lost Fox', description: 'Pip the fox follows a glowing path home.', category: StoryCategory.ADVENTURE, ageGroup: '4-6', readingTimeMinutes: 4, difficulty: Difficulty.EASY, pages: ['Pip the little ginger fox stepped softly onto the velvet pine needles.', 'The ancient oak trees began to whisper secrets in the twilight breeze.', 'A constellation of fireflies lit a glowing path toward the waterfall.', 'At the waterfall, Pip found his family waiting with warm smiles.'] },
  { id: 'st_space_odyssey', title: 'Mia and the Space Odyssey', description: 'Mia visits the moon and makes a new friend.', category: StoryCategory.SCIENCE, ageGroup: '6-8', readingTimeMinutes: 6, difficulty: Difficulty.MEDIUM, pages: ['Mia zipped up her silver space suit and waved goodbye.', 'Her rocket soared past twinkling planets and sleepy comets.', 'On the moon she met a friendly robot named Bolt.', 'Together they planted a tiny glowing flag of friendship.'] },
  { id: 'st_brave_little_seed', title: 'The Brave Little Seed', description: 'A seed learns patience and grows into a tree.', category: StoryCategory.NATURE, ageGroup: '4-6', readingTimeMinutes: 5, difficulty: Difficulty.EASY, pages: ['A tiny seed sat under the warm brown soil.', 'Rain came, and the seed drank until it was round and happy.', 'Slowly a green sprout pushed up toward the sun.', 'Years later, the seed had become a tall, shady tree.'] },
  { id: 'st_dragon_kindness', title: 'The Dragon Who Shared', description: 'A dragon learns that sharing makes friends.', category: StoryCategory.FANTASY, ageGroup: '4-6', readingTimeMinutes: 5, difficulty: Difficulty.EASY, pages: ['Ember the dragon had a mountain of shiny berries.', 'But Ember never shared, and the village stayed away.', 'One rainy day a hungry rabbit knocked at the cave.', 'Ember shared a basket, and the whole village cheered.'] },
  { id: 'st_ocean_friends', title: 'Friends of the Coral Reef', description: 'A dolphin helps a lost sea turtle.', category: StoryCategory.ANIMALS, ageGroup: '4-6', readingTimeMinutes: 4, difficulty: Difficulty.EASY, pages: ['Dolly the dolphin loved to race the waves.', 'She found a small turtle tangled in seaweed.', 'Dolly gently nudged the turtle free.', 'They swam home together as best friends.'] },
  { id: 'st_rocket_race', title: 'The Great Rocket Race', description: 'Two friends race to the candy nebula.', category: StoryCategory.SCIENCE, ageGroup: '8-10', readingTimeMinutes: 7, difficulty: Difficulty.HARD, pages: ['Zed and Lila built rockets from cardboard and dreams.', 'Their race began at the count of three.', 'Lila zoomed ahead but stopped to help Zed.', 'They crossed the candy nebula together, laughing.'] },
  { id: 'st_bedtime_stars', title: 'Goodnight, Little Stars', description: 'A gentle bedtime story about the night sky.', category: StoryCategory.BEDTIME, ageGroup: '3-5', readingTimeMinutes: 3, difficulty: Difficulty.EASY, pages: ['The sun tucked itself behind the hills.', 'One by one, the little stars turned on.', 'The moon wrapped the world in a soft blanket.', 'Goodnight, little stars. Goodnight, sleepy child.'] },
  { id: 'st_kindness_garden', title: 'The Garden of Kindness', description: 'Kind words make flowers bloom.', category: StoryCategory.FRIENDSHIP, ageGroup: '6-8', readingTimeMinutes: 5, difficulty: Difficulty.MEDIUM, pages: ['Nora planted a garden with seeds of kind words.', 'Every time she said thank you, a flower appeared.', 'Her friend Ben added please and you are welcome.', 'Soon the whole town smelled of kindness.'] },
  { id: 'st_curious_caterpillar', title: 'The Curious Caterpillar', description: 'A caterpillar explores the meadow.', category: StoryCategory.NATURE, ageGroup: '4-6', readingTimeMinutes: 4, difficulty: Difficulty.EASY, pages: ['Carl the caterpillar crawled onto a leaf.', 'He counted seven spots on a ladybug.', 'He watched a butterfly stretch its wings.', 'One day, Carl would fly too.'] },
  { id: 'st_puzzle_island', title: 'Mystery of Puzzle Island', description: 'Solve clues to find the golden shell.', category: StoryCategory.ADVENTURE, ageGroup: '8-10', readingTimeMinutes: 8, difficulty: Difficulty.HARD, pages: ['The map showed three clues on Puzzle Island.', 'The first clue hid under a spiral shell.', 'The second was drawn in the sand.', 'The golden shell glowed as the friends solved the last riddle.'] }
];

async function seedUsers() {
  const adminHash = await bcrypt.hash('Admin123!', BCRYPT_ROUNDS);
  const parentHash = await bcrypt.hash('Parent123!', BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wonderkids.test' },
    update: {},
    create: { email: 'admin@wonderkids.test', name: 'WonderKids Admin', passwordHash: adminHash, role: Role.ADMIN }
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@wonderkids.test' },
    update: {},
    create: { email: 'parent@wonderkids.test', name: 'Sam Rivera', passwordHash: parentHash, role: Role.PARENT }
  });

  const child = await prisma.child.upsert({
    where: { id: 'child_leo' },
    update: {},
    create: {
      id: 'child_leo',
      displayName: 'Leo',
      avatar: '🦁',
      ageGroup: '6-8',
      level: 2,
      stars: 45,
      xp: 320
    }
  });

  const childTwo = await prisma.child.upsert({
    where: { id: 'child_maya' },
    update: {},
    create: {
      id: 'child_maya',
      displayName: 'Maya',
      avatar: '👧🏽',
      ageGroup: '8-10',
      level: 4,
      stars: 180,
      xp: 850
    }
  });

  await prisma.parentChild.upsert({
    where: { parentId_childId: { parentId: parent.id, childId: child.id } },
    update: {},
    create: { parentId: parent.id, childId: child.id, relationship: 'mother' }
  });
  await prisma.parentChild.upsert({
    where: { parentId_childId: { parentId: parent.id, childId: childTwo.id } },
    update: {},
    create: { parentId: parent.id, childId: childTwo.id, relationship: 'mother' }
  });

  return { admin, parent, child, childTwo };
}

async function seedColoring(adminId: string) {
  for (const page of coloringPages) {
    await prisma.coloringPage.upsert({
      where: { id: page.id },
      update: { ...page, isPublished: true },
      create: {
        ...page,
        lineArtUrl: `/uploads/seed/${page.id}.png`,
        thumbnailUrl: `/uploads/seed/${page.id}-thumb.png`,
        isPublished: true,
        isAiGenerated: false,
        createdById: adminId
      }
    });
  }
}

async function seedStories(adminId: string) {
  for (const story of stories) {
    const { pages, ...storyData } = story;
    await prisma.story.upsert({
      where: { id: story.id },
      update: { ...storyData, isPublished: true },
      create: {
        ...storyData,
        coverImageUrl: `/uploads/seed/${story.id}-cover.png`,
        isPublished: true,
        createdById: adminId
      }
    });
    await prisma.storyPage.deleteMany({ where: { storyId: story.id } });
    await prisma.storyPage.createMany({
      data: pages.map((text, index) => ({
        storyId: story.id,
        pageNumber: index + 1,
        text,
        illustrationUrl: `/uploads/seed/${story.id}-p${index + 1}.png`,
        audioUrl: `/uploads/seed/${story.id}-p${index + 1}.mp3`
      }))
    });
  }
}

async function seedGames(adminId: string) {
  for (const game of games) {
    const config = game.config as Prisma.InputJsonValue;
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: { ...game, config, isActive: true },
      create: {
        ...game,
        config,
        thumbnailUrl: `/uploads/seed/game-${game.slug}.png`,
        isActive: true,
        createdById: adminId
      }
    });
  }
}

async function seedAchievements() {
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: { ...achievement, criteria: achievement.criteria as never },
      create: { ...achievement, criteria: achievement.criteria as never }
    });
  }
}

async function seedSampleProgress(childId: string) {
  const existing = await prisma.activityProgress.count({ where: { childId } });
  if (existing > 0) return;

  await prisma.activityProgress.createMany({
    data: [
      {
        childId,
        type: ActivityType.COLORING,
        referenceId: 'cp_lion',
        status: 'COMPLETED',
        progress: 100,
        xpEarned: 25,
        starsEarned: 10
      },
      {
        childId,
        type: ActivityType.STORY,
        referenceId: 'st_forest_fox',
        status: 'IN_PROGRESS',
        progress: 50,
        xpEarned: 0,
        starsEarned: 0,
        metadata: { currentPage: 2 }
      }
    ]
  });
}

async function main() {
  const { admin, child } = await seedUsers();
  await seedColoring(admin.id);
  await seedStories(admin.id);
  await seedGames(admin.id);
  await seedAchievements();
  await seedSampleProgress(child.id);

  console.log('Seed complete:');
  console.log(`  coloring pages: ${coloringPages.length}`);
  console.log(`  stories: ${stories.length}`);
  console.log(`  games: ${games.length}`);
  console.log(`  achievements: ${achievements.length}`);
  console.log('  admin login:  admin@wonderkids.test / Admin123!');
  console.log('  parent login: parent@wonderkids.test / Parent123!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
