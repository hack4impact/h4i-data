CREATE TYPE "term_type" AS ENUM (
  'SEMESTER',
  'QUARTER',
  'TRIMESTER'
);

CREATE TYPE "education_level" AS ENUM (
  'UNDERGRADUATE',
  'GRADUATE',
  'BOOTCAMP',
  'SELF_TAUGHT',
  'OTHER'
);

CREATE TYPE "financial_type" AS ENUM (
  'PRO_BONO',
  'INTERNAL',
  'PAID_CONSULT'
);

CREATE TYPE "domain_type" AS ENUM (
  'DESIGN_ONLY',
  'DEVELOP_ONLY',
  'FULL_STACK',
  'STRATEGY_CONSULT',
  'MAINTENANCE'
);

CREATE TYPE "volunteer_class" AS ENUM (
  'COLLEGIATE',
  'ALUMNI',
  'ASSOCIATE'
);

CREATE TYPE "engagement_track" AS ENUM (
  'PROGRAMS',
  'CENTRAL',
  'ADVISORY'
);

CREATE TYPE "engagement_status" AS ENUM (
  'PROSPECT',
  'ACTIVE',
  'COMPLETED',
  'ON_HOLD'
);

CREATE TYPE "action_type" AS ENUM (
  'ENROLLED',
  'PROMOTED',
  'DEMOTED',
  'ROLE_CHANGE',
  'GRADUATED',
  'RESIGNED',
  'HIATUS'
);

CREATE TYPE "deliverable_type" AS ENUM (
  'REPO',
  'DESIGN_SPEC',
  'LIVE_URL',
  'DOCUMENTATION'
);

CREATE TYPE "social_platform_type" AS ENUM (
  'GITHUB',
  'LINKEDIN',
  'PORTFOLIO',
  'TWITTER',
  'DRIBBBLE',
  'OTHER'
);

CREATE TYPE "role_scope" AS ENUM (
  'CHAPTER',
  'CENTRAL'
);

CREATE TABLE "constituents" (
  "constituent_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "first_name" varchar,
  "last_name" varchar,
  "primary_email" varchar UNIQUE NOT NULL,
  "phone_number" varchar,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "social_links" (
  "link_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "constituent_id" uuid,
  "platform" social_platform_type,
  "url" varchar,
  "is_featured" boolean DEFAULT false
);

CREATE TABLE "locations" (
  "location_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar,
  "address_line" varchar,
  "state_code" varchar(2),
  "country_code" varchar(3) DEFAULT 'USA'
);

CREATE TABLE "universities" (
  "university_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar,
  "email_domain" varchar,
  "location_id" uuid
);

CREATE TABLE "academic_terms" (
  "term_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "university_id" uuid,
  "name" varchar,
  "canonical_label" varchar,
  "type" term_type,
  "start_date" date,
  "end_date" date
);

CREATE TABLE "chapters" (
  "chapter_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar,
  "university_id" uuid,
  "location_id" uuid,
  "founded_date" date
);

CREATE TABLE "volunteers" (
  "volunteer_id" uuid PRIMARY KEY,
  "org_email" varchar,
  "active_status" boolean DEFAULT true,
  "volunteer_class" volunteer_class DEFAULT 'COLLEGIATE',
  "engagement_track" engagement_track DEFAULT 'PROGRAMS',
  "major" varchar,
  "education_level" education_level,
  "graduation_term_id" uuid,
  "university_id" uuid,
  "home_chapter_id" uuid,
  "employer_id" uuid,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "volunteer_history" (
  "history_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "volunteer_id" uuid,
  "action_type" action_type,
  "related_entity_id" uuid,
  "previous_value_label" varchar,
  "new_value_label" varchar,
  "effective_date" date
);

CREATE TABLE "officer_roles" (
  "role_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar UNIQUE,
  "scope" role_scope,
  "rank_level" int
);

CREATE TABLE "officer_assignments" (
  "assignment_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "volunteer_id" uuid,
  "role_id" uuid,
  "chapter_id" uuid,
  "start_date" date,
  "end_date" date
);

CREATE TABLE "mentorships" (
  "mentorship_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "mentor_id" uuid,
  "mentee_id" uuid,
  "program_type" varchar,
  "status" engagement_status DEFAULT 'ACTIVE',
  "start_date" date,
  "end_date" date,
  "notes" text
);

CREATE TABLE "projects" (
  "project_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar,
  "github_url" varchar,
  "financial" financial_type DEFAULT 'PRO_BONO',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "project_deliverables" (
  "deliverable_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "project_id" uuid,
  "label" varchar,
  "url" varchar,
  "category" deliverable_type
);

CREATE TABLE "project_roles" (
  "role_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar,
  "is_leadership" boolean DEFAULT false
);

CREATE TABLE "partners" (
  "partner_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "legal_name" varchar,
  "mission_statement" text,
  "website_url" varchar,
  "pcs_organization_type" varchar,
  "pcs_subject" varchar,
  "pcs_population" varchar,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "project_engagements" (
  "engagement_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "project_id" uuid,
  "partner_id" uuid,
  "chapter_id" uuid,
  "academic_term_id" uuid,
  "client_contact_id" uuid,
  "status" engagement_status DEFAULT 'ACTIVE',
  "domain" domain_type DEFAULT 'FULL_STACK',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "project_staffing" (
  "staffing_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "volunteer_id" uuid,
  "engagement_id" uuid,
  "role_id" uuid,
  "is_lead_contact" boolean DEFAULT false,
  "start_date" date,
  "end_date" date
);

CREATE TABLE "companies" (
  "company_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar,
  "industry" varchar,
  "location_id" uuid
);

ALTER TABLE "volunteers" ADD FOREIGN KEY ("volunteer_id") REFERENCES "constituents" ("constituent_id") ON DELETE CASCADE;

ALTER TABLE "social_links" ADD FOREIGN KEY ("constituent_id") REFERENCES "constituents" ("constituent_id") ON DELETE CASCADE;

ALTER TABLE "mentorships" ADD FOREIGN KEY ("mentor_id") REFERENCES "constituents" ("constituent_id");

ALTER TABLE "mentorships" ADD FOREIGN KEY ("mentee_id") REFERENCES "constituents" ("constituent_id");

ALTER TABLE "volunteer_history" ADD FOREIGN KEY ("volunteer_id") REFERENCES "volunteers" ("volunteer_id") ON DELETE CASCADE;

ALTER TABLE "universities" ADD FOREIGN KEY ("location_id") REFERENCES "locations" ("location_id");

ALTER TABLE "chapters" ADD FOREIGN KEY ("location_id") REFERENCES "locations" ("location_id");

ALTER TABLE "companies" ADD FOREIGN KEY ("location_id") REFERENCES "locations" ("location_id");

ALTER TABLE "academic_terms" ADD FOREIGN KEY ("university_id") REFERENCES "universities" ("university_id");

ALTER TABLE "officer_assignments" ADD FOREIGN KEY ("role_id") REFERENCES "officer_roles" ("role_id");

ALTER TABLE "officer_assignments" ADD FOREIGN KEY ("volunteer_id") REFERENCES "volunteers" ("volunteer_id");

ALTER TABLE "officer_assignments" ADD FOREIGN KEY ("chapter_id") REFERENCES "chapters" ("chapter_id");

ALTER TABLE "project_deliverables" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id") ON DELETE CASCADE;

ALTER TABLE "project_engagements" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id");

ALTER TABLE "project_engagements" ADD FOREIGN KEY ("partner_id") REFERENCES "partners" ("partner_id");

ALTER TABLE "project_engagements" ADD FOREIGN KEY ("chapter_id") REFERENCES "chapters" ("chapter_id");

ALTER TABLE "project_engagements" ADD FOREIGN KEY ("client_contact_id") REFERENCES "constituents" ("constituent_id");

ALTER TABLE "project_engagements" ADD FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms" ("term_id");

ALTER TABLE "project_staffing" ADD FOREIGN KEY ("engagement_id") REFERENCES "project_engagements" ("engagement_id");

ALTER TABLE "project_staffing" ADD FOREIGN KEY ("volunteer_id") REFERENCES "volunteers" ("volunteer_id");

ALTER TABLE "project_staffing" ADD FOREIGN KEY ("role_id") REFERENCES "project_roles" ("role_id");

ALTER TABLE "volunteers" ADD FOREIGN KEY ("home_chapter_id") REFERENCES "chapters" ("chapter_id");

ALTER TABLE "volunteers" ADD FOREIGN KEY ("university_id") REFERENCES "universities" ("university_id");

ALTER TABLE "volunteers" ADD FOREIGN KEY ("graduation_term_id") REFERENCES "academic_terms" ("term_id");

ALTER TABLE "volunteers" ADD FOREIGN KEY ("employer_id") REFERENCES "companies" ("company_id");
