// Core Entity Resolvers
import { chapterResolvers } from './resolvers/chapters.resolvers';
import { companyResolvers } from './resolvers/companies.resolvers';
import { constituentResolvers } from './resolvers/constituents.resolvers';
import { locationResolvers } from './resolvers/locations.resolvers';
import { partnerResolvers } from './resolvers/partners.resolvers';
import { projectResolvers } from './resolvers/projects.resolvers';
import { officerRoleResolvers } from './resolvers/officer-roles.resolvers';
import { volunteerResolvers } from './resolvers/volunteers.resolvers';
import { mentorResolvers } from './resolvers/mentors.resolvers';

// Supporting Entity Resolvers
import { majorResolvers } from './resolvers/majors.resolvers';
import { universityResolvers } from './resolvers/universities.resolvers';
import { academicTermResolvers } from './resolvers/academic-terms.resolvers';
import { projectRoleResolvers } from './resolvers/project-roles.resolvers';
import { socialLinkResolvers } from './resolvers/social-links.resolvers';

// Relation Entity Resolvers
import { volunteerHistoryResolvers } from './resolvers/volunteer-history.resolvers';
import { officerAssignmentResolvers } from './resolvers/officer-assignments.resolvers';
import { mentorshipResolvers } from './resolvers/mentorships.resolvers';
import { projectDeliverableResolvers } from './resolvers/project-deliverables.resolvers';
import { projectEngagementResolvers } from './resolvers/project-engagements.resolvers';
import { projectStaffingResolvers } from './resolvers/project-staffing.resolvers';

// Merge multiple resolver objects here
export const resolvers = {
  Query: {
    // Core Entities
    ...chapterResolvers.Query,
    ...companyResolvers.Query,
    ...constituentResolvers.Query,
    ...locationResolvers.Query,
    ...partnerResolvers.Query,
    ...projectResolvers.Query,
    ...officerRoleResolvers.Query,
    ...volunteerResolvers.Query,
    ...mentorResolvers.Query,

    // Supporting Entities
    ...majorResolvers.Query,
    ...universityResolvers.Query,
    ...academicTermResolvers.Query,
    ...projectRoleResolvers.Query,
    ...socialLinkResolvers.Query,

    // Relation Entities
    ...volunteerHistoryResolvers.Query,
    ...officerAssignmentResolvers.Query,
    ...mentorshipResolvers.Query,
    ...projectDeliverableResolvers.Query,
    ...projectEngagementResolvers.Query,
    ...projectStaffingResolvers.Query,
  },
  Mutation: {
    // Core Entities
    ...chapterResolvers.Mutation,
    ...companyResolvers.Mutation,
    ...constituentResolvers.Mutation,
    ...locationResolvers.Mutation,
    ...partnerResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...officerRoleResolvers.Mutation,
    ...volunteerResolvers.Mutation,
    ...mentorResolvers.Mutation,

    // Supporting Entities
    ...majorResolvers.Mutation,
    ...universityResolvers.Mutation,
    ...academicTermResolvers.Mutation,
    ...projectRoleResolvers.Mutation,
    ...socialLinkResolvers.Mutation,

    // Relation Entities
    ...volunteerHistoryResolvers.Mutation,
    ...officerAssignmentResolvers.Mutation,
    ...mentorshipResolvers.Mutation,
    ...projectDeliverableResolvers.Mutation,
    ...projectEngagementResolvers.Mutation,
    ...projectStaffingResolvers.Mutation,
  },
  // Type Resolvers
  Volunteer: volunteerResolvers.Volunteer,
  Mentor: mentorResolvers.Mentor,
};
