import { z } from 'zod';

// Action types for volunteer history
export const actionTypeSchema = z.enum([
  'ENROLLED',
  'PROMOTED',
  'DEMOTED',
  'ROLE_CHANGE',
  'GRADUATED',
  'RESIGNED',
  'HIATUS',
]);
export type ActionType = z.infer<typeof actionTypeSchema>;

// Deliverable types for project deliverables
export const deliverableTypeSchema = z.enum([
  'REPO',
  'DESIGN_SPEC',
  'LIVE_URL',
  'DOCUMENTATION',
]);
export type DeliverableType = z.infer<typeof deliverableTypeSchema>;

// Domain types for project engagements
export const domainTypeSchema = z.enum([
  'DESIGN_ONLY',
  'DEVELOP_ONLY',
  'FULL_STACK',
  'STRATEGY_CONSULT',
  'MAINTENANCE',
]);
export type DomainType = z.infer<typeof domainTypeSchema>;

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

// Financial types for projects
export const financialTypeSchema = z.enum([
  'PRO_BONO',
  'INTERNAL',
  'PAID_CONSULT',
]);
export type FinancialType = z.infer<typeof financialTypeSchema>;

// Role scope for officer roles
export const roleScopeSchema = z.enum(['CHAPTER', 'CENTRAL']);
export type RoleScope = z.infer<typeof roleScopeSchema>;

// Social platform types for social links
export const socialPlatformTypeSchema = z.enum([
  'GITHUB',
  'LINKEDIN',
  'PORTFOLIO',
  'TWITTER',
  'DRIBBBLE',
  'OTHER',
]);
export type SocialPlatformType = z.infer<typeof socialPlatformTypeSchema>;

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
