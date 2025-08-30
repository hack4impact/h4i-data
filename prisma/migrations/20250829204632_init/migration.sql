-- DropForeignKey
ALTER TABLE "public"."chapters" DROP CONSTRAINT "chapters_location_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."companies" DROP CONSTRAINT "companies_location_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."connections" DROP CONSTRAINT "connections_company_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."connections" DROP CONSTRAINT "connections_university_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" DROP CONSTRAINT "nonprofit_chapter_project_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" DROP CONSTRAINT "nonprofit_chapter_project_collab_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" DROP CONSTRAINT "nonprofit_chapter_project_nonprofit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" DROP CONSTRAINT "nonprofit_chapter_project_project_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."nonprofit_chapter_project" DROP CONSTRAINT "nonprofit_chapter_project_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."nonprofits" DROP CONSTRAINT "nonprofits_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."nonprofits" DROP CONSTRAINT "nonprofits_location_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sponsor_chapter" DROP CONSTRAINT "sponsor_chapter_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sponsor_chapter" DROP CONSTRAINT "sponsor_chapter_sponsor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sponsors" DROP CONSTRAINT "sponsors_company_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sponsors" DROP CONSTRAINT "sponsors_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sponsors" DROP CONSTRAINT "sponsors_location_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_assignment" DROP CONSTRAINT "member_assignment_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_assignment" DROP CONSTRAINT "member_assignment_role_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_role_project" DROP CONSTRAINT "member_role_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_role_project" DROP CONSTRAINT "member_role_role_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_role_project" DROP CONSTRAINT "volunteer_role_project_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteers" DROP CONSTRAINT "members_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteers" DROP CONSTRAINT "volunteers_company_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteers" DROP CONSTRAINT "volunteers_university_id_fkey";

-- DropTable
DROP TABLE "public"."chapters";

-- DropTable
DROP TABLE "public"."companies";

-- DropTable
DROP TABLE "public"."connections";

-- DropTable
DROP TABLE "public"."contacts";

-- DropTable
DROP TABLE "public"."locations";

-- DropTable
DROP TABLE "public"."national_branches";

-- DropTable
DROP TABLE "public"."nonprofit_chapter_project";

-- DropTable
DROP TABLE "public"."nonprofits";

-- DropTable
DROP TABLE "public"."projects";

-- DropTable
DROP TABLE "public"."roles";

-- DropTable
DROP TABLE "public"."sponsor_chapter";

-- DropTable
DROP TABLE "public"."sponsors";

-- DropTable
DROP TABLE "public"."volunteer_assignment";

-- DropTable
DROP TABLE "public"."volunteer_history";

-- DropTable
DROP TABLE "public"."volunteer_role_project";

-- DropTable
DROP TABLE "public"."volunteers";

-- DropEnum
DROP TYPE "public"."action_type";

-- DropEnum
DROP TYPE "public"."level_type";

-- DropEnum
DROP TYPE "public"."status_type";

-- DropEnum
DROP TYPE "public"."volunteer_status";

-- DropEnum
DROP TYPE "public"."volunteer_type";

