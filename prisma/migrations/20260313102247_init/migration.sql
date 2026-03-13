-- CreateEnum
CREATE TYPE "action_type" AS ENUM ('JOINED', 'LEFT', 'ENROLLED', 'PROMOTED', 'DEMOTED', 'ROLE_CHANGE', 'GRADUATED', 'RESIGNED', 'HIATUS');

-- CreateEnum
CREATE TYPE "project_resource_type" AS ENUM ('CODE', 'DESIGNS', 'REQUIREMENTS', 'LIVE_URL', 'DOCUMENTATION');

-- CreateEnum
CREATE TYPE "project_type" AS ENUM ('DESIGN_ONLY', 'DEVELOP_ONLY', 'FULL_STACK', 'STRATEGY_CONSULT', 'MAINTENANCE');

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
CREATE TYPE "link_type" AS ENUM ('SOCIAL_MEDIA', 'GITHUB', 'FIGMA', 'LINKEDIN', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "term_type" AS ENUM ('SEMESTER', 'QUARTER', 'TRIMESTER');

-- CreateEnum
CREATE TYPE "volunteer_class" AS ENUM ('COLLEGIATE', 'ALUMNI', 'ASSOCIATE');

-- CreateEnum
CREATE TYPE "volunteer_status" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'HIATUS', 'REVIEW');

-- CreateEnum
CREATE TYPE "chapter_status" AS ENUM ('PROSPECT', 'FORMING', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('SCOPING', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "entity_type" AS ENUM ('CHAPTER', 'OFFICER_ROLE', 'PROJECT', 'PROJECT_ROLE', 'ENGAGEMENT', 'UNIVERSITY', 'COMPANY');

-- CreateTable
CREATE TABLE "chapters" (
    "chapter_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
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
    "name" TEXT NOT NULL,
    "location_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "location_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "address_line" TEXT,
    "city" TEXT,
    "state_code" TEXT,
    "postal_code" TEXT,
    "country_code" TEXT DEFAULT 'USA',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "majors" (
    "major_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "majors_pkey" PRIMARY KEY ("major_id")
);

-- CreateTable
CREATE TABLE "projects" (
    "project_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "github_url" TEXT,
    "status" "project_status" NOT NULL DEFAULT 'SCOPING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "volunteer_history" (
    "volunteer_history_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "action_type" "action_type" NOT NULL,
    "related_entity_id" UUID,
    "related_entity_type" "entity_type",
    "previous_value_label" TEXT,
    "new_value_label" TEXT,
    "effective_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "volunteer_history_pkey" PRIMARY KEY ("volunteer_history_id")
);

-- CreateTable
CREATE TABLE "volunteers" (
    "volunteer_id" UUID NOT NULL,
    "org_email" TEXT,
    "status" "volunteer_status" NOT NULL DEFAULT 'ACTIVE',
    "volunteer_class" "volunteer_class" NOT NULL DEFAULT 'COLLEGIATE',
    "engagement_track" "engagement_track" NOT NULL DEFAULT 'CHAPTER',
    "major_id" UUID,
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
    "academic_term_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "university_id" UUID,
    "name" TEXT NOT NULL,
    "canonical_label" TEXT,
    "type" "term_type",
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "academic_terms_pkey" PRIMARY KEY ("academic_term_id")
);

-- CreateTable
CREATE TABLE "constituents" (
    "constituent_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "primary_email" TEXT NOT NULL,
    "phone_number" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "constituents_pkey" PRIMARY KEY ("constituent_id")
);

-- CreateTable
CREATE TABLE "mentors" (
    "mentor_id" UUID NOT NULL,
    "status" "volunteer_status" NOT NULL DEFAULT 'ACTIVE',
    "expertise_area" TEXT,
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
    "program_type" TEXT,
    "status" "engagement_status" NOT NULL DEFAULT 'ACTIVE',
    "start_date" DATE,
    "end_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mentorships_pkey" PRIMARY KEY ("mentorship_id")
);

-- CreateTable
CREATE TABLE "officer_assignments" (
    "officer_assignment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "officer_role_id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "officer_assignments_pkey" PRIMARY KEY ("officer_assignment_id")
);

-- CreateTable
CREATE TABLE "officer_roles" (
    "officer_role_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "scope" "role_scope",
    "rank_level" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "officer_roles_pkey" PRIMARY KEY ("officer_role_id")
);

-- CreateTable
CREATE TABLE "partners" (
    "partner_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "legal_name" TEXT NOT NULL,
    "mission_statement" TEXT,
    "website_url" TEXT,
    "pcs_organization_type" TEXT,
    "pcs_subject" TEXT,
    "pcs_population" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("partner_id")
);

-- CreateTable
CREATE TABLE "project_resources" (
    "project_resource_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "label" TEXT,
    "url" TEXT,
    "category" "project_resource_type",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_resources_pkey" PRIMARY KEY ("project_resource_id")
);

-- CreateTable
CREATE TABLE "project_engagements" (
    "project_engagement_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "partner_id" UUID,
    "chapter_id" UUID,
    "academic_term_id" UUID,
    "client_contact_id" UUID,
    "status" "engagement_status" NOT NULL DEFAULT 'ACTIVE',
    "domain" "project_type" NOT NULL DEFAULT 'FULL_STACK',
    "financial" "financial_type" NOT NULL DEFAULT 'PRO_BONO',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_engagements_pkey" PRIMARY KEY ("project_engagement_id")
);

-- CreateTable
CREATE TABLE "project_roles" (
    "project_role_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_leadership" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_roles_pkey" PRIMARY KEY ("project_role_id")
);

-- CreateTable
CREATE TABLE "project_staffing" (
    "project_staffing_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "project_engagement_id" UUID NOT NULL,
    "project_role_id" UUID,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_staffing_pkey" PRIMARY KEY ("project_staffing_id")
);

-- CreateTable
CREATE TABLE "constituent_links" (
    "constituent_link_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "constituent_id" UUID NOT NULL,
    "platform" "link_type",
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "constituent_links_pkey" PRIMARY KEY ("constituent_link_id")
);

-- CreateTable
CREATE TABLE "universities" (
    "university_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email_domain" TEXT,
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
CREATE UNIQUE INDEX "majors_name_key" ON "majors"("name");

-- CreateIndex
CREATE INDEX "volunteer_history_volunteer_id_idx" ON "volunteer_history"("volunteer_id");

-- CreateIndex
CREATE INDEX "volunteers_major_id_idx" ON "volunteers"("major_id");

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
CREATE INDEX "officer_assignments_officer_role_id_idx" ON "officer_assignments"("officer_role_id");

-- CreateIndex
CREATE INDEX "officer_assignments_chapter_id_idx" ON "officer_assignments"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "officer_roles_name_key" ON "officer_roles"("name");

-- CreateIndex
CREATE INDEX "project_resources_project_id_idx" ON "project_resources"("project_id");

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
CREATE UNIQUE INDEX "project_roles_name_key" ON "project_roles"("name");

-- CreateIndex
CREATE INDEX "project_staffing_volunteer_id_idx" ON "project_staffing"("volunteer_id");

-- CreateIndex
CREATE INDEX "project_staffing_project_engagement_id_idx" ON "project_staffing"("project_engagement_id");

-- CreateIndex
CREATE INDEX "project_staffing_project_role_id_idx" ON "project_staffing"("project_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_staffing_volunteer_id_project_engagement_id_key" ON "project_staffing"("volunteer_id", "project_engagement_id");

-- CreateIndex
CREATE INDEX "constituent_links_constituent_id_idx" ON "constituent_links"("constituent_id");

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
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_graduation_term_id_fkey" FOREIGN KEY ("graduation_term_id") REFERENCES "academic_terms"("academic_term_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_home_chapter_id_fkey" FOREIGN KEY ("home_chapter_id") REFERENCES "chapters"("chapter_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "majors"("major_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

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
ALTER TABLE "officer_assignments" ADD CONSTRAINT "officer_assignments_officer_role_id_fkey" FOREIGN KEY ("officer_role_id") REFERENCES "officer_roles"("officer_role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "officer_assignments" ADD CONSTRAINT "officer_assignments_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("volunteer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_resources" ADD CONSTRAINT "project_resources_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms"("academic_term_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("chapter_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_client_contact_id_fkey" FOREIGN KEY ("client_contact_id") REFERENCES "constituents"("constituent_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("partner_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_engagements" ADD CONSTRAINT "project_engagements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_staffing" ADD CONSTRAINT "project_staffing_project_engagement_id_fkey" FOREIGN KEY ("project_engagement_id") REFERENCES "project_engagements"("project_engagement_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_staffing" ADD CONSTRAINT "project_staffing_project_role_id_fkey" FOREIGN KEY ("project_role_id") REFERENCES "project_roles"("project_role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_staffing" ADD CONSTRAINT "project_staffing_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("volunteer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "constituent_links" ADD CONSTRAINT "constituent_links_constituent_id_fkey" FOREIGN KEY ("constituent_id") REFERENCES "constituents"("constituent_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
