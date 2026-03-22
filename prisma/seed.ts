/**
 * Main Prisma Seed File
 *
 * Orchestrates seeding of all database tables in dependency order.
 * Total: 251 rows across 15 models
 */

/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import { seedTier0 } from './seeders/tier0.seeder';
import { seedTier1 } from './seeders/tier1.seeder';
import { seedTier2 } from './seeders/tier2.seeder';

// Safety check: prevent seeding production database
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cannot seed production database!');
  console.error(
    '   Use seed:dev or seed:test for non-production environments.'
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');

  // Delete in reverse dependency order (Tier 2 -> Tier 1 -> Tier 0)
  await prisma.volunteer_role_project.deleteMany({});
  await prisma.volunteer_history.deleteMany({});
  await prisma.volunteer_assignment.deleteMany({});
  await prisma.sponsor_chapter.deleteMany({});
  await prisma.nonprofit_chapter_project.deleteMany({});

  await prisma.volunteers.deleteMany({});
  await prisma.sponsors.deleteMany({});
  await prisma.nonprofits.deleteMany({});
  await prisma.companies.deleteMany({});
  await prisma.chapters.deleteMany({});

  await prisma.roles.deleteMany({});
  await prisma.projects.deleteMany({});
  await prisma.operations_branches.deleteMany({});
  await prisma.contacts.deleteMany({});
  await prisma.locations.deleteMany({});

  console.log('  ✓ Database cleaned');
}

async function main() {
  console.log('🚀 Starting database seed...\n');

  try {
    // Clean existing data
    await cleanDatabase();
    console.log('');

    // Seed Tier 0: Foundation tables
    const tier0Data = await seedTier0();
    console.log('');

    // Seed Tier 1: Dependent tables
    const tier1Data = await seedTier1(tier0Data);
    console.log('');

    // Seed Tier 2: Association tables
    await seedTier2(tier0Data, tier1Data);
    console.log('');

    // Summary
    console.log('✅ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log('  Tier 0 (Foundation):');
    console.log('    - Locations: 15');
    console.log('    - Contacts: 25');
    console.log('    - Operations Branches: 6');
    console.log('    - Projects: 12');
    console.log('    - Roles: 10');
    console.log('  Tier 1 (Dependent):');
    console.log('    - Chapters: 10');
    console.log('    - Companies: 8');
    console.log('    - Nonprofits: 10');
    console.log('    - Sponsors: 12');
    console.log('    - Volunteers: 20');
    console.log('  Tier 2 (Associations):');
    console.log('    - Nonprofit Chapter Projects: 15');
    console.log('    - Sponsor Chapters: 18');
    console.log('    - Volunteer Assignments: 25');
    console.log('    - Volunteer History: 30');
    console.log('    - Volunteer Role Projects: 35');
    console.log('  ');
    console.log('  Total Records: 251');
    console.log('');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
