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
