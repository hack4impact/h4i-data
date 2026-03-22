/**
 * Tier 0 Seeder - Foundation tables with no dependencies
 */

import { PrismaClient } from '@prisma/client';
import {
  generateEmail,
  generatePhoneNumber,
  generateRepoUrl,
  generatePermissions,
  randomBoolean,
} from './data-generators';

const prisma = new PrismaClient();

export interface Tier0Data {
  locationIds: string[];
  universityIds: string[];
  companyLocationIds: string[];
  contactIds: string[];
  branchIds: string[];
  projectIds: string[];
  roleIds: string[];
}

export async function seedTier0(): Promise<Tier0Data> {
  console.log('🌱 Seeding Tier 0: Foundation tables...');

  // Seed Locations (15 total: 10 universities + 5 companies)
  const universities = [
    {
      name: 'University of Illinois at Urbana-Champaign',
      address: '601 E John St, Champaign, IL 61801',
      subdivision_code: 'IL',
    },
    {
      name: 'Northwestern University',
      address: '633 Clark St, Evanston, IL 60208',
      subdivision_code: 'IL',
    },
    {
      name: 'University of California, Berkeley',
      address: '200 California Hall, Berkeley, CA 94720',
      subdivision_code: 'CA',
    },
    {
      name: 'Stanford University',
      address: '450 Serra Mall, Stanford, CA 94305',
      subdivision_code: 'CA',
    },
    {
      name: 'Georgia Institute of Technology',
      address: '225 North Ave NW, Atlanta, GA 30332',
      subdivision_code: 'GA',
    },
    {
      name: 'Carnegie Mellon University',
      address: '5000 Forbes Ave, Pittsburgh, PA 15213',
      subdivision_code: 'PA',
    },
    {
      name: 'University of Washington',
      address: '1410 NE Campus Pkwy, Seattle, WA 98195',
      subdivision_code: 'WA',
    },
    {
      name: 'University of Texas at Austin',
      address: '110 Inner Campus Dr, Austin, TX 78712',
      subdivision_code: 'TX',
    },
    {
      name: 'University of Michigan',
      address: '500 S State St, Ann Arbor, MI 48109',
      subdivision_code: 'MI',
    },
    {
      name: 'Cornell University',
      address: '300 Day Hall, Ithaca, NY 14853',
      subdivision_code: 'NY',
    },
  ];

  const companies = [
    {
      name: 'Microsoft Corporation',
      address: 'One Microsoft Way, Redmond, WA 98052',
      subdivision_code: 'WA',
    },
    {
      name: 'Google LLC',
      address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
      subdivision_code: 'CA',
    },
    {
      name: 'Meta Platforms Inc',
      address: '1 Hacker Way, Menlo Park, CA 94025',
      subdivision_code: 'CA',
    },
    {
      name: 'Amazon.com Inc',
      address: '410 Terry Ave N, Seattle, WA 98109',
      subdivision_code: 'WA',
    },
    {
      name: 'Salesforce Inc',
      address: 'Salesforce Tower, 415 Mission St, San Francisco, CA 94105',
      subdivision_code: 'CA',
    },
  ];

  const universityLocations = await Promise.all(
    universities.map((loc) =>
      prisma.locations.create({
        data: {
          name: loc.name,
          address: loc.address,
          subdivision_code: loc.subdivision_code,
          country_code: 'US',
        },
      })
    )
  );

  const companyLocations = await Promise.all(
    companies.map((loc) =>
      prisma.locations.create({
        data: {
          name: loc.name,
          address: loc.address,
          subdivision_code: loc.subdivision_code,
          country_code: 'US',
        },
      })
    )
  );

  const universityIds = universityLocations.map((l) => l.location_id);
  const companyLocationIds = companyLocations.map((l) => l.location_id);
  const locationIds = [...universityIds, ...companyLocationIds];

  console.log(`  ✓ Created ${locationIds.length} locations`);

  // Seed Contacts (25 total: 10 nonprofit + 10 sponsor + 5 extra for dual-contact)
  const contactNames = [
    'Sarah Johnson',
    'Michael Chen',
    'Emily Rodriguez',
    'David Kim',
    'Jessica Patel',
    'Robert Williams',
    'Amanda Thompson',
    'James Martinez',
    'Lisa Anderson',
    'Christopher Lee',
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
    'Sophia Clark',
    'Thomas Lewis',
    'Emma Walker',
  ];

  const contacts = await Promise.all(
    contactNames.map((name, index) =>
      prisma.contacts.create({
        data: {
          name: name,
          email: name.toLowerCase().replace(/\s+/g, '.') + '@example.org',
          phone_number: randomBoolean(0.6) ? generatePhoneNumber() : null,
        },
      })
    )
  );

  const contactIds = contacts.map((c) => c.contact_id);
  console.log(`  ✓ Created ${contactIds.length} contacts`);

  // Seed Operations Branches (6 total)
  const branches = [
    'Finance',
    'Marketing & Communications',
    'Engineering',
    'Product & Design',
    'Human Resources',
    'External Relations',
  ];

  const operationsBranches = await Promise.all(
    branches.map((name) =>
      prisma.operations_branches.create({
        data: { name: name },
      })
    )
  );

  const branchIds = operationsBranches.map((b) => b.branch_id);
  console.log(`  ✓ Created ${branchIds.length} operations branches`);

  // Seed Projects (12 total: cover all 5 project_types)
  const projectsData = [
    {
      name: 'Community Food Tracker',
      type: 'DESIGN_ONLY' as const,
      budget: 3000,
      description:
        'Design a mobile app to track food distribution for local food banks',
    },
    {
      name: 'Youth Literacy Platform',
      type: 'DESIGN_ONLY' as const,
      budget: 2500,
      description:
        'Design an interactive reading platform for underprivileged students',
    },
    {
      name: 'Senior Care Portal',
      type: 'DEVELOP_ONLY' as const,
      budget: 8000,
      description: 'Develop a web portal for senior care coordination',
    },
    {
      name: 'Animal Shelter Database',
      type: 'DEVELOP_ONLY' as const,
      budget: 6500,
      description: 'Build a database system for animal shelter management',
    },
    {
      name: 'Environmental Impact Tracker',
      type: 'DESIGN_AND_DEVELOP' as const,
      budget: 12000,
      description:
        'Full-stack app to track and visualize environmental initiatives',
    },
    {
      name: 'Homeless Resource Hub',
      type: 'DESIGN_AND_DEVELOP' as const,
      budget: 15000,
      description:
        'Comprehensive platform connecting homeless individuals with resources',
    },
    {
      name: 'Refugee Integration App',
      type: 'DESIGN_AND_DEVELOP' as const,
      budget: 11000,
      description:
        'Mobile app to help refugees integrate into local communities',
    },
    {
      name: 'Health Access Navigator',
      type: 'CONSULT' as const,
      budget: 5000,
      description:
        'Product strategy and roadmap for healthcare access nonprofit',
    },
    {
      name: 'Arts Education Portal',
      type: 'CONSULT' as const,
      budget: 4500,
      description: 'Product design for online arts education platform',
    },
    {
      name: 'Youth Mentorship Matcher',
      type: 'MAINTAIN' as const,
      budget: 500,
      description: 'External collaboration on mentorship matching algorithm',
    },
    {
      name: 'Community Garden Network',
      type: 'MAINTAIN' as const,
      budget: 1000,
      description: 'Partnership project for urban gardening initiative',
    },
    {
      name: 'Voter Registration Drive',
      type: 'DESIGN_AND_DEVELOP' as const,
      budget: 9000,
      description:
        'Platform to streamline voter registration for underserved communities',
    },
  ];

  const projects = await Promise.all(
    projectsData.map((project) =>
      prisma.projects.create({
        data: {
          name: project.name,
          project_type: project.type,
          budget: project.budget,
          repo: generateRepoUrl(project.name),
          description: project.description,
        },
      })
    )
  );

  const projectIds = projects.map((p) => p.project_id);
  console.log(`  ✓ Created ${projectIds.length} projects`);

  // Seed Roles (10 total: cover all 4 level_types)
  const rolesData = [
    {
      name: 'Chapter Member',
      level: 'REGULAR_CHAPTER_VOLUNTEER_LEVEL' as const,
      description: 'Regular chapter volunteer',
    },
    {
      name: 'Chapter Secretary',
      level: 'REGULAR_CHAPTER_VOLUNTEER_LEVEL' as const,
      description: 'Chapter administrative support',
    },
    {
      name: 'Tech Lead',
      level: 'CHAPTER_BOARD_LEVEL' as const,
      description: 'Technical leadership for chapter',
    },
    {
      name: 'Chapter President',
      level: 'CHAPTER_BOARD_LEVEL' as const,
      description: 'Chapter executive leader',
    },
    {
      name: 'Product Manager',
      level: 'CHAPTER_BOARD_LEVEL' as const,
      description: 'Product strategy and management',
    },
    {
      name: 'Operations Associate',
      level: 'REGULAR_OPERATIONS_VOLUNTEER_LEVEL' as const,
      description: 'Operations team member',
    },
    {
      name: 'Finance Team Member',
      level: 'REGULAR_OPERATIONS_VOLUNTEER_LEVEL' as const,
      description: 'Finance operations support',
    },
    {
      name: 'Marketing Coordinator',
      level: 'REGULAR_OPERATIONS_VOLUNTEER_LEVEL' as const,
      description: 'Marketing and communications',
    },
    {
      name: 'Executive Director',
      level: 'OPERATIONS_BOARD_LEVEL' as const,
      description: 'National executive leadership',
    },
    {
      name: 'National Board Member',
      level: 'OPERATIONS_BOARD_LEVEL' as const,
      description: 'National governance and strategy',
    },
  ];

  const roles = await Promise.all(
    rolesData.map((role) =>
      prisma.roles.create({
        data: {
          name: role.name,
          description: role.description,
          level_type: role.level,
          permissions: generatePermissions(role.level),
        },
      })
    )
  );

  const roleIds = roles.map((r) => r.role_id);
  console.log(`  ✓ Created ${roleIds.length} roles`);

  return {
    locationIds,
    universityIds,
    companyLocationIds,
    contactIds,
    branchIds,
    projectIds,
    roleIds,
  };
}
