-- CreateTable
CREATE TABLE "member" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "university" TEXT,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_project" (
    "id" BIGSERIAL NOT NULL,
    "member_id" BIGINT NOT NULL,
    "project_id" BIGINT,

    CONSTRAINT "Member_Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "chapter" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nationals" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT DEFAULT 'NAME (ex: JOSHUA)',
    "school" TEXT DEFAULT 'SCHOOL (ex: CAL POLY SLO)',
    "branch" TEXT DEFAULT 'BRANCH (ex: ENGINEERING)',

    CONSTRAINT "nationals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "member_project" ADD CONSTRAINT "Member_Project_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "member_project" ADD CONSTRAINT "Member_Project_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

