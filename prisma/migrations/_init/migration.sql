-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."action_type" AS ENUM ('JOINED', 'LEFT', 'ON HIATUS');

-- CreateEnum
CREATE TYPE "public"."level_type" AS ENUM ('1 - REGULAR CHAPTER VOLUNTEER LEVEL', '2 - CHAPTER BOARD LEVEL', '3 - REGULAR OPERATIONS VOLUNTEER LEVEL', '4 - OPERATIONS BOARD LEVEL');

-- CreateEnum
CREATE TYPE "public"."status_type" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."volunteer_status" AS ENUM ('STUDENT', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "public"."volunteer_type" AS ENUM ('CHAPTER', 'OPERATIONS', 'BOTH');

-- CreateEnum
CREATE TYPE "public"."project_type" AS ENUM ('DESIGN-ONLY', 'DEVELOP-ONLY', 'DESIGN AND DEVELOP', 'CONSULT', 'MAINTAIN');

-- CreateTable
CREATE TABLE "public"."chapters" (
    "chapter_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "location_id" UUID,
    "founded_date" DATE NOT NULL,
    "status_type" "public"."status_type" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_pkey" PRIMARY KEY ("chapter_id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "company_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "location_id" UUID,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
    "contact_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "location_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country_code" CHAR(2) NOT NULL DEFAULT 'US',
    "subdivision_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_pkey1" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "public"."nonprofit_chapter_project" (
    "nonprofit_chapter_project_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nonprofit_id" UUID NOT NULL,
    "chapter_id" UUID,
    "project_id" UUID NOT NULL,
    "project_contact_id" UUID NOT NULL,
    "collab_contact_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,
    "project_status" "public"."status_type" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nonprofit_chapter_project_pkey" PRIMARY KEY ("nonprofit_chapter_project_id")
);

-- CreateTable
CREATE TABLE "public"."nonprofits" (
    "nonprofit_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "website" TEXT,
    "location_id" UUID,
    "contact_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nonprofits_pkey" PRIMARY KEY ("nonprofit_id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "project_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "budget" DECIMAL(12,2),
    "repo" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_type" "public"."project_type" NOT NULL DEFAULT 'DESIGN AND DEVELOP',

    CONSTRAINT "project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "role_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "level_type" "public"."level_type" NOT NULL DEFAULT '1 - REGULAR CHAPTER VOLUNTEER LEVEL',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "public"."sponsor_chapter" (
    "sponsor_chapter_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sponsor_id" UUID NOT NULL,
    "chapter_id" UUID,
    "year_sponsored" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsor_chapter_pkey" PRIMARY KEY ("sponsor_chapter_id")
);

-- CreateTable
CREATE TABLE "public"."sponsors" (
    "sponsor_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "location_id" UUID,
    "contact_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("sponsor_id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_assignment" (
    "volunteer_assignment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "branch_id" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "public"."status_type" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_assignment_pkey" PRIMARY KEY ("volunteer_assignment_id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_history" (
    "history_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "action_type" "public"."action_type" NOT NULL DEFAULT 'JOINED',
    "reason" TEXT,
    "action_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_role_project" (
    "volunteer_role_project_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_role_project_pkey" PRIMARY KEY ("volunteer_role_project_id")
);

-- CreateTable
CREATE TABLE "public"."volunteers" (
    "volunteer_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "graduation_date" DATE NOT NULL,
    "university_id" UUID NOT NULL,
    "volunteer_status" "public"."volunteer_status" NOT NULL DEFAULT 'STUDENT',
    "H4I_email" TEXT,
    "chapter_id" UUID,
    "volunteer_type" "public"."volunteer_type" NOT NULL DEFAULT 'CHAPTER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID,

    CONSTRAINT "members_pkey" PRIMARY KEY ("volunteer_id")
);

-- CreateTable
CREATE TABLE "public"."operations_branches" (
    "branch_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "national_branches_pkey" PRIMARY KEY ("branch_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "person_email_key" ON "public"."volunteers"("email");

-- AddForeignKey
ALTER TABLE "public"."chapters" ADD CONSTRAINT "chapters_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" ADD CONSTRAINT "nonprofit_chapter_project_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("chapter_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" ADD CONSTRAINT "nonprofit_chapter_project_collab_contact_id_fkey" FOREIGN KEY ("collab_contact_id") REFERENCES "public"."contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" ADD CONSTRAINT "nonprofit_chapter_project_nonprofit_id_fkey" FOREIGN KEY ("nonprofit_id") REFERENCES "public"."nonprofits"("nonprofit_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" ADD CONSTRAINT "nonprofit_chapter_project_project_contact_id_fkey" FOREIGN KEY ("project_contact_id") REFERENCES "public"."contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" ADD CONSTRAINT "nonprofit_chapter_project_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nonprofits" ADD CONSTRAINT "nonprofits_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nonprofits" ADD CONSTRAINT "nonprofits_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sponsor_chapter" ADD CONSTRAINT "sponsor_chapter_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("chapter_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sponsor_chapter" ADD CONSTRAINT "sponsor_chapter_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("sponsor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sponsors" ADD CONSTRAINT "sponsors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sponsors" ADD CONSTRAINT "sponsors_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sponsors" ADD CONSTRAINT "sponsors_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteer_assignment" ADD CONSTRAINT "member_assignment_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."operations_branches"("branch_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteer_assignment" ADD CONSTRAINT "member_assignment_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteer_assignment" ADD CONSTRAINT "volunteer_assignment_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("volunteer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteer_history" ADD CONSTRAINT "volunteer_history_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("volunteer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteer_role_project" ADD CONSTRAINT "member_role_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteer_role_project" ADD CONSTRAINT "member_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteer_role_project" ADD CONSTRAINT "volunteer_role_project_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("volunteer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteers" ADD CONSTRAINT "members_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("chapter_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteers" ADD CONSTRAINT "volunteers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."volunteers" ADD CONSTRAINT "volunteers_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

