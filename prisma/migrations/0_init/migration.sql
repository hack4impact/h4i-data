-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "action_type" AS ENUM ('JOINED', 'LEFT', 'ON HIATUS', 'ENROLLED', 'PROMOTED', 'DEMOTED', 'ROLE_CHANGE', 'GRADUATED', 'RESIGNED', 'HIATUS');

-- CreateEnum
CREATE TYPE "deliverable_type" AS ENUM ('REPO', 'DESIGN_SPEC', 'LIVE_URL', 'DOCUMENTATION');

-- CreateEnum
CREATE TYPE "domain_type" AS ENUM ('DESIGN_ONLY', 'DEVELOP_ONLY', 'FULL_STACK', 'STRATEGY_CONSULT', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "education_level" AS ENUM ('UNDERGRADUATE', 'GRADUATE', 'OTHER');

-- CreateEnum
CREATE TYPE "engagement_status" AS ENUM ('PROSPECT', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'REVIEW');

-- CreateEnum
CREATE TYPE "engagement_track" AS ENUM ('CHAPTER', 'CENTRAL', 'ADVISORY');

-- CreateEnum
CREATE TYPE "financial_type" AS ENUM ('PRO_BONO', 'INTERNAL', 'PAID');

-- CreateEnum
CREATE TYPE "role_scope" AS ENUM ('CHAPTER', 'CENTRAL');

-- CreateEnum
CREATE TYPE "social_platform_type" AS ENUM ('GITHUB', 'LINKEDIN', 'PORTFOLIO', 'TWITTER', 'DRIBBBLE', 'OTHER');

-- CreateEnum
CREATE TYPE "term_type" AS ENUM ('SEMESTER', 'QUARTER', 'TRIMESTER');

-- CreateEnum
CREATE TYPE "volunteer_class" AS ENUM ('COLLEGIATE', 'ALUMNI', 'ASSOCIATE');

-- CreateEnum
CREATE TYPE "member_status" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'ON_HIATUS');

-- CreateEnum
CREATE TYPE "chapter_status" AS ENUM ('PROSPECT', 'FORMING', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('SCOPING', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "entity_type" AS ENUM ('CHAPTER', 'OFFICER_ROLE', 'PROJECT', 'PROJECT_ROLE', 'ENGAGEMENT', 'UNIVERSITY', 'COMPANY');

-- CreateTable
CREATE TABLE "chapters" (
    "chapter_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "university_id" UUID,
    "location_id" UUID,
    "founded_date" DATE,
    "status" "chapter_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("chapter_id")
);

-- CreateTable
CREATE TABLE "companies" (
    "company_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "industry" VARCHAR,
    "location_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "location_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "address_line" VARCHAR,
    "state_code" VARCHAR(2),
    "country_code" VARCHAR(3) DEFAULT 'USA',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "projects" (
    "project_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "github_url" VARCHAR,
    "financial" "financial_type" DEFAULT 'PRO_BONO',
    "status" "project_status" NOT NULL DEFAULT 'SCOPING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "volunteer_history" (
    "history_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "action_type" "action_type" NOT NULL,
    "related_entity_id" UUID,
    "related_entity_type" "entity_type",
    "previous_value_label" VARCHAR,
    "new_value_label" VARCHAR,
    "effective_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "volunteer_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "volunteers" (
    "volunteer_id" UUID NOT NULL,
    "org_email" VARCHAR,
    "status" "member_status" NOT NULL DEFAULT 'ACTIVE',
    "volunteer_class" "volunteer_class" DEFAULT 'COLLEGIATE',
    "engagement_track" "engagement_track" DEFAULT 'CHAPTER',
    "major" VARCHAR,
    "education_level" "education_level",
    "graduation_term_id" UUID,
    "university_id" UUID,
    "home_chapter_id" UUID,
    "employer_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("volunteer_id")
);

-- CreateTable
CREATE TABLE "academic_terms" (
    "term_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "university_id" UUID,
    "name" VARCHAR NOT NULL,
    "canonical_label" VARCHAR,
    "type" "term_type",
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "academic_terms_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "constituents" (
    "constituent_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "primary_email" VARCHAR NOT NULL,
    "phone_number" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "constituents_pkey" PRIMARY KEY ("constituent_id")
);

-- CreateTable
CREATE TABLE "mentors" (
    "mentor_id" UUID NOT NULL,
    "status" "member_status" NOT NULL DEFAULT 'ACTIVE',
    "expertise_area" VARCHAR,
    "max_mentees" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mentors_pkey" PRIMARY KEY ("mentor_id")
);

-- CreateTable
CREATE TABLE "mentorships" (
    "mentorship_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentor_id" UUID NOT NULL,
    "mentee_id" UUID NOT NULL,
    "program_type" VARCHAR,
    "status" "engagement_status" DEFAULT 'ACTIVE',
    "start_date" DATE,
    "end_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mentorships_pkey" PRIMARY KEY ("mentorship_id")
);

-- CreateTable
CREATE TABLE "officer_assignments" (
    "assignment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "officer_assignments_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "officer_roles" (
    "role_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "scope" "role_scope",
    "rank_level" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "officer_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "partners" (
    "partner_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "legal_name" VARCHAR NOT NULL,
    "mission_statement" TEXT,
    "website_url" VARCHAR,
    "pcs_organization_type" VARCHAR,
    "pcs_subject" VARCHAR,
    "pcs_population" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("partner_id")
);

-- CreateTable
CREATE TABLE "project_deliverables" (
    "deliverable_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "label" VARCHAR,
    "url" VARCHAR,
    "category" "deliverable_type",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_deliverables_pkey" PRIMARY KEY ("deliverable_id")
);

-- CreateTable
CREATE TABLE "project_engagements" (
    "engagement_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "partner_id" UUID,
    "chapter_id" UUID,
    "academic_term_id" UUID,
    "client_contact_id" UUID,
    "status" "engagement_status" DEFAULT 'ACTIVE',
    "domain" "domain_type" DEFAULT 'FULL_STACK',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_engagements_pkey" PRIMARY KEY ("engagement_id")
);

-- CreateTable
CREATE TABLE "project_roles" (
    "role_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "is_leadership" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "project_staffing" (
    "staffing_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "engagement_id" UUID NOT NULL,
    "role_id" UUID,
    "is_lead_contact" BOOLEAN DEFAULT false,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_staffing_pkey" PRIMARY KEY ("staffing_id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "link_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "constituent_id" UUID NOT NULL,
    "platform" "social_platform_type",
    "url" VARCHAR NOT NULL,
    "is_featured" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("link_id")
);

-- CreateTable
CREATE TABLE "universities" (
    "university_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "email_domain" VARCHAR,
    "location_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("university_id")
);

-- CreateIndex
CREATE INDEX "chapters_university_id_idx" ON "chapters"("university_id");

-- CreateIndex
CREATE INDEX "chapters_location_id_idx" ON "chapters"("location_id");

-- CreateIndex
CREATE INDEX "companies_location_id_idx" ON "companies"("location_id");

-- CreateIndex
CREATE INDEX "volunteer_history_volunteer_id_idx" ON "volunteer_history"("volunteer_id");

-- CreateIndex
CREATE INDEX "volunteers_graduation_term_id_idx" ON "volunteers"("graduation_term_id");

-- CreateIndex
CREATE INDEX "volunteers_university_id_idx" ON "volunteers"("university_id");

-- CreateIndex
CREATE INDEX "volunteers_home_chapter_id_idx" ON "volunteers"("home_chapter_id");

-- CreateIndex
CREATE INDEX "volunteers_employer_id_idx" ON "volunteers"("employer_id");

-- CreateIndex
CREATE INDEX "academic_terms_university_id_idx" ON "academic_terms"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "constituents_primary_email_key" ON "constituents"("primary_email");

-- CreateIndex
CREATE INDEX "mentorships_mentor_id_idx" ON "mentorships"("mentor_id");

-- CreateIndex
CREATE INDEX "mentorships_mentee_id_idx" ON "mentorships"("mentee_id");

-- CreateIndex
CREATE INDEX "officer_assignments_volunteer_id_idx" ON "officer_assignments"("volunteer_id");

-- CreateIndex
CREATE INDEX "officer_assignments_role_id_idx" ON "officer_assignments"("role_id");

-- CreateIndex
CREATE INDEX "officer_assignments_chapter_id_idx" ON "officer_assignments"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "officer_roles_name_key" ON "officer_roles"("name");

-- CreateIndex
CREATE INDEX "project_deliverables_project_id_idx" ON "project_deliverables"("project_id");

-- CreateIndex
CREATE INDEX "project_engagements_project_id_idx" ON "project_engagements"("project_id");

-- CreateIndex
CREATE INDEX "project_engagements_partner_id_idx" ON "project_engagements"("partner_id");

-- CreateIndex
CREATE INDEX "project_engagements_chapter_id_idx" ON "project_engagements"("chapter_id");

-- CreateIndex
CREATE INDEX "project_engagements_academic_term_id_idx" ON "project_engagements"("academic_term_id");

-- CreateIndex
CREATE INDEX "project_engagements_client_contact_id_idx" ON "project_engagements"("client_contact_id");

-- CreateIndex
CREATE INDEX "project_staffing_volunteer_id_idx" ON "project_staffing"("volunteer_id");

-- CreateIndex
CREATE INDEX "project_staffing_engagement_id_idx" ON "project_staffing"("engagement_id");

-- CreateIndex
CREATE INDEX "project_staffing_role_id_idx" ON "project_staffing"("role_id");

-- CreateIndex
CREATE INDEX "social_links_constituent_id_idx" ON "social_links"("constituent_id");

-- CreateIndex
CREATE INDEX "universities_location_id_idx" ON "universities"("location_id");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("university_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteer_history" ADD CONSTRAINT "volunteer_history_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("volunteer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_graduation_term_id_fkey" FOREIGN KEY ("graduation_term_id") REFERENCES "academic_terms"("term_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_home_chapter_id_fkey" FOREIGN KEY ("home_chapter_id") REFERENCES "chapters"("chapter_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("university_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "constituents"("constituent_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("university_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "constituents"("constituent_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mentorships" ADD CONSTRAINT "mentorships_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "constituents"("constituent_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mentorships" ADD CONSTRAINT "mentorships_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentors"("mentor_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "officer_assignments" ADD CONSTRAINT "officer_assignments_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("chapter_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "officer_assignments" ADD CONSTRAINT "officer_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "officer_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "officer_assignments" ADD CONSTRAINT "officer_assignments_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("volunteer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms"("term_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("chapter_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_client_contact_id_fkey" FOREIGN KEY ("client_contact_id") REFERENCES "constituents"("constituent_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("partner_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_staffing" ADD CONSTRAINT "project_staffing_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "project_engagements"("engagement_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_staffing" ADD CONSTRAINT "project_staffing_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "project_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_staffing" ADD CONSTRAINT "project_staffing_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("volunteer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_constituent_id_fkey" FOREIGN KEY ("constituent_id") REFERENCES "constituents"("constituent_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

