import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user (will be auto-created on first login, but pre-create for convenience)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ssaandco.com' },
    update: {},
    create: {
      email: 'admin@ssaandco.com',
      name: 'System Administrator',
      role: Role.ADMIN,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create committee user
  const committee = await prisma.user.upsert({
    where: { email: 'committee@ssaandco.com' },
    update: {},
    create: {
      email: 'committee@ssaandco.com',
      name: 'Committee Member',
      role: Role.COMMITTEE,
    },
  });
  console.log('Created committee user:', committee.email);

  // Create submitter user
  const submitter = await prisma.user.upsert({
    where: { email: 'submitter@ssaandco.com' },
    update: {},
    create: {
      email: 'submitter@ssaandco.com',
      name: 'Regular User',
      role: Role.SUBMITTER,
    },
  });
  console.log('Created submitter user:', submitter.email);

  // Seed AI tools
  const tools = [
    'Swiss Army Knife Meeting Insight Generator',
    'Slide Architect',
    'Prompt-to-GPT Builder',
    'Prompt Librarian',
    'Deliverable Evaluation Claude Skill',
    'AI Data Prep',
    'Simple Data Masking Utility',
    'Fuzzy Matching',
    'Digital Data Analyst',
    'Digital Organizational Analyst',
    'Digital Financial Analyst',
    'Digital Issue Analyst',
    'Digital Cost Benchmarking Analyst',
    'Complex Program Management Agent',
    'SmartSheet Builder',
    'Project Initiation Starter',
    'Network Diagram Analyzer',
    'Forecasting Tool',
    'Load Balancing Tool',
    'Control Tower - Algorithm Library',
    'Control Tower Documentation Builder',
    'Candidate Interview Guide Builder',
    'Candidate Interview Transcript Evaluator',
    'SSA Market Intelligence (SSAMI)',
    'Case Study Generator',
  ];

  for (const name of tools) {
    await prisma.tool.upsert({
      where: { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      update: {},
      create: {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
      },
    });
  }
  console.log(`Seeded ${tools.length} AI tools`);

  // Create a sample group
  const group = await prisma.group.upsert({
    where: { slug: 'general' },
    update: {},
    create: {
      name: 'General',
      slug: 'general',
    },
  });
  console.log('Created group:', group.name);

  // Add users to the group
  await prisma.groupMembership.upsert({
    where: { userId_groupId: { userId: admin.id, groupId: group.id } },
    update: {},
    create: {
      userId: admin.id,
      groupId: group.id,
    },
  });

  await prisma.groupMembership.upsert({
    where: { userId_groupId: { userId: committee.id, groupId: group.id } },
    update: {},
    create: {
      userId: committee.id,
      groupId: group.id,
    },
  });

  await prisma.groupMembership.upsert({
    where: { userId_groupId: { userId: submitter.id, groupId: group.id } },
    update: {},
    create: {
      userId: submitter.id,
      groupId: group.id,
    },
  });

  console.log('Added users to group');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
