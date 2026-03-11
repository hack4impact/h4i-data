import { z } from 'zod';

// Action types for volunteer history
export const actionTypeSchema = z.enum([
  'JOINED',
  'LEFT',
  'ENROLLED',
  'PROMOTED',
  'DEMOTED',
  'ROLE_CHANGE',
  'GRADUATED',
  'RESIGNED',
  'HIATUS',
]);
export type ActionType = z.infer<typeof actionTypeSchema>;

// Resource types for project resources
export const projectResourceTypeSchema = z.enum([
  'CODE',
  'DESIGNS',
  'REQUIREMENTS',
  'LIVE_URL',
  'DOCUMENTATION',
]);
export type ProjectResourceType = z.infer<typeof projectResourceTypeSchema>;

// Domain types for project engagements
export const projectTypeSchema = z.enum([
  'DESIGN_ONLY',
  'DEVELOP_ONLY',
  'FULL_STACK',
  'STRATEGY_CONSULT',
  'MAINTENANCE',
]);
export type ProjectType = z.infer<typeof projectTypeSchema>;

// Education levels for volunteers
export const educationLevelSchema = z.enum([
  'UNDERGRADUATE',
  'GRADUATE',
  'BOOTCAMP',
  'SELF_TAUGHT',
  'OTHER',
]);
export type EducationLevel = z.infer<typeof educationLevelSchema>;

// Engagement status for project engagements and mentorships
export const engagementStatusSchema = z.enum([
  'PROSPECT',
  'ACTIVE',
  'COMPLETED',
  'ON_HOLD',
]);
export type EngagementStatus = z.infer<typeof engagementStatusSchema>;

// Engagement tracks for volunteers
export const engagementTrackSchema = z.enum([
  'PROGRAMS',
  'CENTRAL',
  'ADVISORY',
]);
export type EngagementTrack = z.infer<typeof engagementTrackSchema>;

// Financial types for project engagements
export const financialTypeSchema = z.enum([
  'PRO_BONO',
  'INTERNAL',
  'PAID_CONSULT',
]);
export type FinancialType = z.infer<typeof financialTypeSchema>;

// Role scope for officer roles
export const roleScopeSchema = z.enum(['CHAPTER', 'CENTRAL']);
export type RoleScope = z.infer<typeof roleScopeSchema>;

// Link types for constituent links
export const linkTypeSchema = z.enum([
  'SOCIAL_MEDIA',
  'GITHUB',
  'FIGMA',
  'LINKEDIN',
  'WEBSITE',
  'OTHER',
]);
export type LinkType = z.infer<typeof linkTypeSchema>;

// Term types for academic terms
export const termTypeSchema = z.enum(['SEMESTER', 'QUARTER', 'TRIMESTER']);
export type TermType = z.infer<typeof termTypeSchema>;

// Volunteer class types
export const volunteerClassSchema = z.enum([
  'COLLEGIATE',
  'ALUMNI',
  'ASSOCIATE',
]);
export type VolunteerClass = z.infer<typeof volunteerClassSchema>;

// Member status for volunteers and mentors
export const volunteerStatusSchema = z.enum([
  'PROSPECT',
  'ACTIVE',
  'INACTIVE',
  'HIATUS',
]);
export type VolunteerStatus = z.infer<typeof volunteerStatusSchema>;

// Chapter status
export const chapterStatusSchema = z.enum([
  'PROSPECT',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
]);
export type ChapterStatus = z.infer<typeof chapterStatusSchema>;

// Project status
export const projectStatusSchema = z.enum([
  'WORKING',
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

// Entity type discriminator for volunteer history
export const entityTypeSchema = z.enum([
  'CHAPTER',
  'OFFICER_ROLE',
  'PROJECT',
  'PROJECT_ROLE',
  'ENGAGEMENT',
  'UNIVERSITY',
  'COMPANY',
]);
export type EntityType = z.infer<typeof entityTypeSchema>;
