/**
 * Tier 1 Seeder - Tables dependent on Tier 0
 */

import { PrismaClient } from '@prisma/client';
import { Tier0Data } from './tier0.seeder';
import {
  generateEmail,
  randomBoolean,
  randomDate,
  randomElement,
  randomInt,
} from './data-generators';

const prisma = new PrismaClient();

export interface Tier1Data {
  chapterIds: string[];
  companyIds: string[];
  nonprofitIds: string[];
  sponsorIds: string[];
  volunteerIds: string[];
}

export async function seedTier1(tier0: Tier0Data): Promise<Tier1Data> {
  console.log('🌱 Seeding Tier 1: Dependent tables...');

  // Seed Chapters (10 total: 8 ACTIVE, 2 INACTIVE)
  const chapterNames = [
    'UIUC Chapter',
    'Northwestern Chapter',
    'UC Berkeley Chapter',
    'Stanford Chapter',
    'Georgia Tech Chapter',
    'CMU Chapter',
    'UW Chapter',
    'UT Austin Chapter',
    'Michigan Chapter',
    'Cornell Chapter',
  ];

  const chapters = await Promise.all(
    chapterNames.map((name, index) =>
      prisma.chapters.create({
        data: {
          name: name,
          location_id: tier0.universityIds[index],
          founded_date: randomDate(
            new Date('2015-01-01'),
            new Date('2024-01-01')
          ),
          status_type: index < 8 ? 'ACTIVE' : 'INACTIVE',
        },
      })
    )
  );

  const chapterIds = chapters.map((c) => c.chapter_id);
  console.log(`  ✓ Created ${chapterIds.length} chapters`);

  // Seed Companies (8 total)
  const companiesData = [
    { name: 'Microsoft', location_idx: 0 },
    { name: 'Google', location_idx: 1 },
    { name: 'Meta', location_idx: 2 },
    { name: 'Amazon', location_idx: 3 },
    { name: 'Salesforce', location_idx: 4 },
    { name: 'Apple Inc.', location_idx: 1 },
    { name: 'Netflix Inc.', location_idx: 1 },
    { name: 'Adobe Inc.', location_idx: 1 },
  ];

  const companies = await Promise.all(
    companiesData.map((company) =>
      prisma.companies.create({
        data: {
          name: company.name,
          location_id:
            company.location_idx < tier0.companyLocationIds.length
              ? tier0.companyLocationIds[company.location_idx]
              : tier0.companyLocationIds[0],
        },
      })
    )
  );

  const companyIds = companies.map((c) => c.company_id);
  console.log(`  ✓ Created ${companyIds.length} companies`);

  // Seed Nonprofits (10 total)
  const nonprofitsData = [
    {
      name: 'Bay Area Food Bank',
      mission: 'Fighting hunger and food insecurity in the Bay Area',
      website: 'https://bayareafoodbank.org',
      location: true,
    },
    {
      name: 'Chicago Literacy Alliance',
      mission: 'Empowering individuals through literacy and education',
      website: 'https://chicagoliteracy.org',
      location: true,
    },
    {
      name: 'Youth Mentors Network',
      mission: 'Connecting youth with positive role models',
      website: 'https://youthmentors.org',
      location: true,
    },
    {
      name: 'Health Access Coalition',
      mission: 'Ensuring healthcare access for underserved communities',
      website: null,
      location: true,
    },
    {
      name: 'Environment First Initiative',
      mission: 'Promoting environmental sustainability and conservation',
      website: 'https://environmentfirst.org',
      location: true,
    },
    {
      name: 'Senior Support Services',
      mission: 'Providing care and resources for elderly populations',
      website: 'https://seniorsupport.org',
      location: true,
    },
    {
      name: 'Arts for All Council',
      mission: 'Making arts education accessible to all children',
      website: 'https://artsforall.org',
      location: true,
    },
    {
      name: 'Homeless Outreach Program',
      mission: 'Providing shelter and support services to homeless individuals',
      website: null,
      location: true,
    },
    {
      name: 'Animal Rescue League',
      mission: 'Rescuing and rehoming abandoned animals',
      website: 'https://animalrescue.org',
      location: false,
    },
    {
      name: 'Refugee Aid Society',
      mission: 'Supporting refugees in their integration journey',
      website: 'https://refugeeaid.org',
      location: false,
    },
  ];

  const nonprofits = await Promise.all(
    nonprofitsData.map((nonprofit, index) =>
      prisma.nonprofits.create({
        data: {
          name: nonprofit.name,
          contact_id: tier0.contactIds[index],
          location_id:
            nonprofit.location && randomBoolean(0.8)
              ? randomElement(tier0.universityIds)
              : null,
          mission: nonprofit.mission,
          website: nonprofit.website,
        },
      })
    )
  );

  const nonprofitIds = nonprofits.map((n) => n.nonprofit_id);
  console.log(`  ✓ Created ${nonprofitIds.length} nonprofits`);

  // Seed Sponsors (12 total: 67% company-affiliated)
  const sponsorNames = [
    'Jennifer Davis',
    'William Garcia',
    'Nicole Miller',
    'Daniel Wilson',
    'Ashley Moore',
    'Matthew Taylor',
    'Rachel Brown',
    'Kevin Jackson',
    'Stephanie White',
    'Brian Harris',
    'Olivia Martin',
    'Andrew Thompson',
  ];

  const sponsors = await Promise.all(
    sponsorNames.map((name, index) =>
      prisma.sponsors.create({
        data: {
          name: name,
          contact_id: tier0.contactIds[10 + index],
          company_id: index < 8 ? companyIds[index] : null,
          location_id: randomBoolean(0.5)
            ? randomElement(tier0.locationIds)
            : null,
        },
      })
    )
  );

  const sponsorIds = sponsors.map((s) => s.sponsor_id);
  console.log(`  ✓ Created ${sponsorIds.length} sponsors`);

  // Seed Volunteers (20 total: 12 STUDENT, 8 PROFESSIONAL)
  const volunteersData = [
    // Students (12)
    {
      first_name: 'Alex',
      last_name: 'Johnson',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2025,
    },
    {
      first_name: 'Maria',
      last_name: 'Garcia',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2026,
    },
    {
      first_name: 'Ryan',
      last_name: 'Chen',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2025,
    },
    {
      first_name: 'Sophie',
      last_name: 'Patel',
      type: 'BOTH' as const,
      status: 'STUDENT' as const,
      grad_year: 2026,
    },
    {
      first_name: 'Jordan',
      last_name: 'Williams',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2027,
    },
    {
      first_name: 'Emily',
      last_name: 'Martinez',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2026,
    },
    {
      first_name: 'Nathan',
      last_name: 'Lee',
      type: 'BOTH' as const,
      status: 'STUDENT' as const,
      grad_year: 2025,
    },
    {
      first_name: 'Isabella',
      last_name: 'Anderson',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2027,
    },
    {
      first_name: 'Ethan',
      last_name: 'Brown',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2026,
    },
    {
      first_name: 'Ava',
      last_name: 'Davis',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2025,
    },
    {
      first_name: 'Lucas',
      last_name: 'Wilson',
      type: 'BOTH' as const,
      status: 'STUDENT' as const,
      grad_year: 2027,
    },
    {
      first_name: 'Mia',
      last_name: 'Taylor',
      type: 'CHAPTER' as const,
      status: 'STUDENT' as const,
      grad_year: 2026,
    },
    // Professionals (8)
    {
      first_name: 'James',
      last_name: 'Thompson',
      type: 'OPERATIONS' as const,
      status: 'PROFESSIONAL' as const,
      grad_year: 2020,
    },
    {
      first_name: 'Sarah',
      last_name: 'Moore',
      type: 'OPERATIONS' as const,
      status: 'PROFESSIONAL' as const,
      grad_year: 2019,
    },
    {
      first_name: 'Michael',
      last_name: 'Jackson',
      type: 'BOTH' as const,
      status: 'PROFESSIONAL' as const,
      grad_year: 2021,
    },
    {
      first_name: 'Jennifer',
      last_name: 'White',
      type: 'OPERATIONS' as const,
      status: 'PROFESSIONAL' as const,
      grad_year: 2018,
    },
    {
      first_name: 'David',
      last_name: 'Harris',
      type: 'OPERATIONS' as const,
      status: 'PROFESSIONAL' as const,
      grad_year: 2022,
    },
    {
      first_name: 'Lisa',
      last_name: 'Martin',
      type: 'BOTH' as const,
      status: 'PROFESSIONAL' as const,
      grad_year: 2020,
    },
    {
      first_name: 'Robert',
      last_name: 'Clark',
      type: 'OPERATIONS' as const,
      status: 'PROFESSIONAL' as const,
      grad_year: 2023,
    },
    {
      first_name: 'Amanda',
      last_name: 'Lewis',
      type: 'OPERATIONS' as const,
      status: 'PROFESSIONAL' as const,
      grad_year: 2019,
    },
  ];

  const volunteers = await Promise.all(
    volunteersData.map((volunteer, index) => {
      const gradDate = new Date(`${volunteer.grad_year}-05-15`);
      return prisma.volunteers.create({
        data: {
          first_name: volunteer.first_name,
          last_name: volunteer.last_name,
          email: generateEmail(
            volunteer.first_name,
            volunteer.last_name,
            'example.com'
          ),
          H4I_email: randomBoolean(0.6)
            ? generateEmail(
                volunteer.first_name,
                volunteer.last_name,
                'hack4impact.org'
              )
            : null,
          university_id:
            tier0.universityIds[index % tier0.universityIds.length],
          volunteer_type: volunteer.type,
          volunteer_status: volunteer.status,
          graduation_date: gradDate,
        },
      });
    })
  );

  const volunteerIds = volunteers.map((v) => v.volunteer_id);
  console.log(`  ✓ Created ${volunteerIds.length} volunteers`);

  return {
    chapterIds,
    companyIds,
    nonprofitIds,
    sponsorIds,
    volunteerIds,
  };
}
