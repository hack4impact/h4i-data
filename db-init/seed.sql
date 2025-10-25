-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop and recreate schema for idempotent reseeding
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Create Enums
CREATE TYPE public.action_type AS ENUM ('JOINED', 'LEFT', 'ON HIATUS');

CREATE TYPE public.level_type AS ENUM (
  '1 - REGULAR CHAPTER VOLUNTEER LEVEL',
  '2 - CHAPTER BOARD LEVEL',
  '3 - REGULAR OPERATIONS VOLUNTEER LEVEL',
  '4 - OPERATIONS BOARD LEVEL'
);

CREATE TYPE public.status_type AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE public.volunteer_status AS ENUM ('STUDENT', 'PROFESSIONAL');

CREATE TYPE public.volunteer_type AS ENUM ('CHAPTER', 'OPERATIONS', 'BOTH');

CREATE TYPE public.project_type AS ENUM (
  'DESIGN-ONLY',
  'DEVELOP-ONLY',
  'DESIGN AND DEVELOP',
  'CONSULT',
  'MAINTAIN'
);

-- Create Tables (Order: * first, then 1, then 2)

-- Table: contacts (*)
CREATE TABLE public.contacts (
  contact_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone_number text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT contacts_pkey PRIMARY KEY (contact_id),
  CONSTRAINT contacts_contact_id_key UNIQUE (contact_id)
) TABLESPACE pg_default;

-- Table: locations (*)
CREATE TABLE public.locations (
  location_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  country_code character(2) NOT NULL DEFAULT 'US'::bpchar,
  subdivision_code text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT university_pkey1 PRIMARY KEY (location_id),
  CONSTRAINT locations_location_id_key UNIQUE (location_id)
) TABLESPACE pg_default;

-- Table: operations_branches (*)
CREATE TABLE public.operations_branches (
  branch_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT operations_branches_pkey PRIMARY KEY (branch_id),
  CONSTRAINT operations_branches_branch_id_key UNIQUE (branch_id)
) TABLESPACE pg_default;

-- Table: projects (*)
CREATE TABLE public.projects (
  project_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NULL,
  budget numeric(12, 2) NULL DEFAULT '0'::numeric,
  repo text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  project_type public.project_type NOT NULL DEFAULT 'DESIGN AND DEVELOP'::project_type,
  CONSTRAINT project_pkey PRIMARY KEY (project_id),
  CONSTRAINT projects_project_id_key UNIQUE (project_id)
) TABLESPACE pg_default;

-- Table: roles (*)
CREATE TABLE public.roles (
  role_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  permissions jsonb NOT NULL,
  level_type public.level_type NOT NULL DEFAULT '1 - REGULAR CHAPTER VOLUNTEER LEVEL'::level_type,
  CONSTRAINT roles_pkey PRIMARY KEY (role_id),
  CONSTRAINT roles_role_id_key UNIQUE (role_id)
) TABLESPACE pg_default;

-- Table: companies (1)
CREATE TABLE public.companies (
  company_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_id uuid NULL,
  CONSTRAINT companies_pkey PRIMARY KEY (company_id),
  CONSTRAINT companies_company_id_key UNIQUE (company_id),
  CONSTRAINT companies_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations (location_id)
) TABLESPACE pg_default;

-- Table: chapters (1)
CREATE TABLE public.chapters (
  chapter_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_id uuid NULL,
  founded_date date NOT NULL,
  status_type public.status_type NOT NULL DEFAULT 'ACTIVE'::public.status_type,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chapter_pkey PRIMARY KEY (chapter_id),
  CONSTRAINT chapters_chapter_id_key UNIQUE (chapter_id),
  CONSTRAINT chapters_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations (location_id)
) TABLESPACE pg_default;

-- Table: nonprofits (1)
CREATE TABLE public.nonprofits (
  nonprofit_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mission text NOT NULL,
  website text NULL,
  location_id uuid NULL,
  contact_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT nonprofits_pkey PRIMARY KEY (nonprofit_id),
  CONSTRAINT nonprofits_nonprofit_id_key UNIQUE (nonprofit_id),
  CONSTRAINT nonprofits_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts (contact_id),
  CONSTRAINT nonprofits_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations (location_id)
) TABLESPACE pg_default;

-- Table: sponsors (1)
CREATE TABLE public.sponsors (
  sponsor_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_id uuid NULL,
  contact_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_date timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NULL,
  CONSTRAINT sponsors_pkey PRIMARY KEY (sponsor_id),
  CONSTRAINT sponsors_sponsor_id_key UNIQUE (sponsor_id),
  CONSTRAINT sponsors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (company_id),
  CONSTRAINT sponsors_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts (contact_id),
  CONSTRAINT sponsors_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations (location_id)
) TABLESPACE pg_default;

-- Table: volunteers (1)
CREATE TABLE public.volunteers (
  volunteer_id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  graduation_date date NOT NULL,
  university_id uuid NOT NULL,
  volunteer_status public.volunteer_status NOT NULL DEFAULT 'STUDENT'::volunteer_status,
  "H4I_email" text NULL,
  chapter_id uuid NULL,
  volunteer_type public.volunteer_type NOT NULL DEFAULT 'CHAPTER'::volunteer_type,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NULL,
  CONSTRAINT members_pkey PRIMARY KEY (volunteer_id),
  CONSTRAINT person_email_key UNIQUE (email),
  CONSTRAINT volunteers_volunteer_id_key UNIQUE (volunteer_id),
  CONSTRAINT members_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters (chapter_id),
  CONSTRAINT volunteers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (company_id),
  CONSTRAINT volunteers_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.locations (location_id)
) TABLESPACE pg_default;

-- Table: nonprofit_chapter_project (2)
CREATE TABLE public.nonprofit_chapter_project (
  nonprofit_chapter_project_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nonprofit_id uuid NOT NULL,
  chapter_id uuid NULL,
  project_id uuid NOT NULL,
  project_contact_id uuid NOT NULL,
  collab_contact_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NULL,
  notes text NULL,
  project_status public.status_type NOT NULL DEFAULT 'ACTIVE'::status_type,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT nonprofit_chapter_project_pkey PRIMARY KEY (nonprofit_chapter_project_id),
  CONSTRAINT nonprofit_chapter_project_nonprofit_chapter_project_id_key UNIQUE (nonprofit_chapter_project_id),
  CONSTRAINT nonprofit_chapter_project_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters (chapter_id),
  CONSTRAINT nonprofit_chapter_project_collab_contact_id_fkey FOREIGN KEY (collab_contact_id) REFERENCES public.contacts (contact_id),
  CONSTRAINT nonprofit_chapter_project_nonprofit_id_fkey FOREIGN KEY (nonprofit_id) REFERENCES public.nonprofits (nonprofit_id),
  CONSTRAINT nonprofit_chapter_project_project_contact_id_fkey FOREIGN KEY (project_contact_id) REFERENCES public.contacts (contact_id),
  CONSTRAINT nonprofit_chapter_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects (project_id)
) TABLESPACE pg_default;

-- Table: sponsor_chapter (2)
CREATE TABLE public.sponsor_chapter (
  sponsor_chapter_id uuid NOT NULL DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL,
  chapter_id uuid NULL,
  year_sponsored date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_date timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sponsor_chapter_pkey PRIMARY KEY (sponsor_chapter_id),
  CONSTRAINT sponsor_chapter_sponsor_chapter_id_key UNIQUE (sponsor_chapter_id),
  CONSTRAINT sponsor_chapter_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters (chapter_id),
  CONSTRAINT sponsor_chapter_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES public.sponsors (sponsor_id)
) TABLESPACE pg_default;

-- Table: volunteer_assignment (2)
CREATE TABLE public.volunteer_assignment (
  volunteer_assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL,
  role_id uuid NOT NULL,
  branch_id uuid NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status public.status_type NOT NULL DEFAULT 'ACTIVE'::status_type,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT member_assignment_pkey PRIMARY KEY (volunteer_assignment_id),
  CONSTRAINT volunteer_assignment_volunteer_assignment_id_key UNIQUE (volunteer_assignment_id),
  CONSTRAINT member_assignment_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.operations_branches (branch_id),
  CONSTRAINT member_assignment_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles (role_id),
  CONSTRAINT volunteer_assignment_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers (volunteer_id)
) TABLESPACE pg_default;

-- Table: volunteer_history (2)
CREATE TABLE public.volunteer_history (
  history_id uuid NOT NULL DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL,
  action_type public.action_type NOT NULL DEFAULT 'JOINED'::action_type,
  reason text NULL,
  action_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT membership_history_pkey PRIMARY KEY (history_id),
  CONSTRAINT volunteer_history_history_id_key UNIQUE (history_id),
  CONSTRAINT volunteer_history_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers (volunteer_id)
) TABLESPACE pg_default;

-- Table: volunteer_role_project (2)
CREATE TABLE public.volunteer_role_project (
  volunteer_role_project_id uuid NOT NULL DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL,
  role_id uuid NOT NULL,
  project_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT volunteer_role_project_pkey PRIMARY KEY (volunteer_role_project_id),
  CONSTRAINT volunteer_role_project_volunteer_role_id_key UNIQUE (volunteer_role_project_id),
  CONSTRAINT member_role_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects (project_id),
  CONSTRAINT member_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles (role_id),
  CONSTRAINT volunteer_role_project_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers (volunteer_id)
) TABLESPACE pg_default;

