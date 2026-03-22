/**
 * Tier 2 Seeder - Association/Junction tables
 */

import { PrismaClient } from '@prisma/client';
import { Tier0Data } from './tier0.seeder';
import { Tier1Data } from './tier1.seeder';
import {
  randomBoolean,
  randomDate,
  randomElement,
  randomInt,
  shuffleArray,
} from './data-generators';

const prisma = new PrismaClient();

export async function seedTier2(
  tier0: Tier0Data,
  tier1: Tier1Data
): Promise<void> {
  console.log('🌱 Seeding Tier 2: Association tables...');

  // Seed nonprofit_chapter_project (15 total)
  // Ensure project_contact_id ≠ collab_contact_id
  const ncpData = [];
  for (let i = 0; i < 15; i++) {
    const projectContactIdx = i % tier0.contactIds.length;
    let collabContactIdx =
      (i + randomInt(1, tier0.contactIds.length - 1)) % tier0.contactIds.length;

    // Ensure different contacts
    while (collabContactIdx === projectContactIdx) {
      collabContactIdx = (collabContactIdx + 1) % tier0.contactIds.length;
    }

    const isActive = randomBoolean(0.73);
    const hasEndDate = randomBoolean(0.4);
    const startDate = randomDate(
      new Date('2020-01-01'),
      new Date('2024-01-01')
    );
    const endDate = hasEndDate
      ? randomDate(startDate, new Date('2024-12-31'))
      : null;

    ncpData.push({
      nonprofit_id: tier1.nonprofitIds[i % tier1.nonprofitIds.length],
      chapter_id: randomBoolean(0.8) ? randomElement(tier1.chapterIds) : null,
      project_id: tier0.projectIds[i % tier0.projectIds.length],
      project_contact_id: tier0.contactIds[projectContactIdx],
      collab_contact_id: tier0.contactIds[collabContactIdx],
      project_status: isActive ? ('ACTIVE' as const) : ('INACTIVE' as const),
      start_date: startDate,
      end_date: endDate,
    });
  }

  await Promise.all(
    ncpData.map((ncp) =>
      prisma.nonprofit_chapter_project.create({
        data: ncp,
      })
    )
  );

  console.log(
    `  ✓ Created ${ncpData.length} nonprofit_chapter_project entries`
  );

  // Seed sponsor_chapter (18 total)
  // Include multi-year sponsorships (same sponsor, different years)
  const scData = [];

  // Create some multi-year sponsorships
  for (let i = 0; i < 6; i++) {
    const sponsorId = tier1.sponsorIds[i % tier1.sponsorIds.length];
    const chapterId = randomBoolean(0.83)
      ? randomElement(tier1.chapterIds)
      : null;

    // Create 2-3 year sponsorship
    const numYears = randomInt(2, 3);
    const startYear = randomInt(2020, 2023);

    for (let year = 0; year < numYears; year++) {
      scData.push({
        sponsor_id: sponsorId,
        chapter_id: chapterId,
        year_sponsored: new Date(`${startYear + year}-01-01`),
      });
    }
  }

  await Promise.all(
    scData.map((sc) =>
      prisma.sponsor_chapter.create({
        data: sc,
      })
    )
  );

  console.log(`  ✓ Created ${scData.length} sponsor_chapter entries`);

  // Seed volunteer_assignment (25 total: 80% ACTIVE)
  const vaData = [];
  const shuffledVolunteers = shuffleArray(tier1.volunteerIds);

  for (let i = 0; i < 25; i++) {
    const volunteerId = shuffledVolunteers[i % shuffledVolunteers.length];
    const roleId = tier0.roleIds[i % tier0.roleIds.length];
    const isActive = randomBoolean(0.8);
    const hasBranch = randomBoolean(0.6);
    const startDate = randomDate(
      new Date('2020-01-01'),
      new Date('2024-01-01')
    );
    const endDate = isActive
      ? randomDate(new Date('2024-06-01'), new Date('2025-12-31'))
      : randomDate(startDate, new Date('2024-05-31'));

    vaData.push({
      volunteer_id: volunteerId,
      role_id: roleId,
      branch_id: hasBranch ? randomElement(tier0.branchIds) : null,
      status: isActive ? ('ACTIVE' as const) : ('INACTIVE' as const),
      start_date: startDate,
      end_date: endDate,
    });
  }

  await Promise.all(
    vaData.map((va) =>
      prisma.volunteer_assignment.create({
        data: va,
      })
    )
  );

  console.log(`  ✓ Created ${vaData.length} volunteer_assignment entries`);

  // Seed volunteer_history (30 total: 67% JOINED, 20% LEFT, 13% ON_HIATUS)
  const vhData = [];
  const actionTypes: Array<'JOINED' | 'LEFT' | 'ON_HIATUS'> = [
    ...Array(20).fill('JOINED'),
    ...Array(6).fill('LEFT'),
    ...Array(4).fill('ON_HIATUS'),
  ] as Array<'JOINED' | 'LEFT' | 'ON_HIATUS'>;

  for (let i = 0; i < 30; i++) {
    const volunteerId = tier1.volunteerIds[i % tier1.volunteerIds.length];
    const actionType = actionTypes[i];
    let reason = null;

    if (actionType === 'LEFT') {
      const reasons = [
        'Graduated and moved',
        'Time constraints',
        'Career change',
        'Personal reasons',
      ];
      reason = randomElement(reasons);
    } else if (actionType === 'ON_HIATUS') {
      const reasons = [
        'Study abroad',
        'Internship',
        'Family matters',
        'Health reasons',
      ];
      reason = randomElement(reasons);
    }

    vhData.push({
      volunteer_id: volunteerId,
      action_type: actionType,
      action_date: randomDate(new Date('2020-01-01'), new Date('2024-12-31')),
      reason: reason,
    });
  }

  await Promise.all(
    vhData.map((vh) =>
      prisma.volunteer_history.create({
        data: vh,
      })
    )
  );

  console.log(`  ✓ Created ${vhData.length} volunteer_history entries`);

  // Seed volunteer_role_project (35 total: 60% ongoing, 50% with notes)
  const vrpData = [];

  for (let i = 0; i < 35; i++) {
    const volunteerId = tier1.volunteerIds[i % tier1.volunteerIds.length];
    const roleId = tier0.roleIds[i % tier0.roleIds.length];
    const projectId = tier0.projectIds[i % tier0.projectIds.length];
    const isOngoing = randomBoolean(0.6);
    const hasNotes = randomBoolean(0.5);

    const startDate = randomDate(
      new Date('2020-01-01'),
      new Date('2024-01-01')
    );
    const endDate = isOngoing
      ? null
      : randomDate(startDate, new Date('2024-12-31'));

    const notes = hasNotes
      ? randomElement([
          'Excellent performance on this project',
          'Led the design sprint',
          'Coordinated with nonprofit stakeholders',
          'Managed the development team',
          'Conducted user research',
          'Primary technical contact',
        ])
      : null;

    vrpData.push({
      volunteer_id: volunteerId,
      role_id: roleId,
      project_id: projectId,
      start_date: startDate,
      end_date: endDate,
      notes: notes,
    });
  }

  await Promise.all(
    vrpData.map((vrp) =>
      prisma.volunteer_role_project.create({
        data: vrp,
      })
    )
  );

  console.log(`  ✓ Created ${vrpData.length} volunteer_role_project entries`);
}
