-- Drop and recreate schema for idempotent reseeding
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Enums
CREATE TYPE public.action_type AS ENUM ('ENROLLED', 'PROMOTED', 'DEMOTED', 'ROLE_CHANGE', 'GRADUATED', 'RESIGNED', 'HIATUS');
CREATE TYPE public.deliverable_type AS ENUM ('REPO', 'DESIGN_SPEC', 'LIVE_URL', 'DOCUMENTATION');
CREATE TYPE public.domain_type AS ENUM ('DESIGN_ONLY', 'DEVELOP_ONLY', 'FULL_STACK', 'STRATEGY_CONSULT', 'MAINTENANCE');
CREATE TYPE public.education_level AS ENUM ('UNDERGRADUATE', 'GRADUATE', 'BOOTCAMP', 'SELF_TAUGHT', 'OTHER');
CREATE TYPE public.engagement_status AS ENUM ('PROSPECT', 'ACTIVE', 'COMPLETED', 'ON_HOLD');
CREATE TYPE public.engagement_track AS ENUM ('PROGRAMS', 'CENTRAL', 'ADVISORY');
CREATE TYPE public.financial_type AS ENUM ('PRO_BONO', 'INTERNAL', 'PAID_CONSULT');
CREATE TYPE public.role_scope AS ENUM ('CHAPTER', 'CENTRAL');
CREATE TYPE public.social_platform_type AS ENUM ('GITHUB', 'LINKEDIN', 'PORTFOLIO', 'TWITTER', 'DRIBBBLE', 'OTHER');
CREATE TYPE public.term_type AS ENUM ('SEMESTER', 'QUARTER', 'TRIMESTER');
CREATE TYPE public.volunteer_class AS ENUM ('COLLEGIATE', 'ALUMNI', 'ASSOCIATE');

-- Create Tables (in an order that respects foreign keys)

-- Tables with no or few dependencies
CREATE TABLE public.locations (
    location_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name varchar NULL,
    address_line varchar NULL,
    state_code varchar(2) NULL,
    country_code varchar(3) NULL DEFAULT 'USA',
    PRIMARY KEY (location_id)
);

CREATE TABLE public.constituents (
    constituent_id uuid NOT NULL DEFAULT gen_random_uuid(),
    first_name varchar NULL,
    last_name varchar NULL,
    primary_email varchar NOT NULL,
    phone_number varchar NULL,
    created_at timestamptz(6) NULL DEFAULT now(),
    updated_at timestamptz(6) NULL DEFAULT now(),
    PRIMARY KEY (constituent_id),
    UNIQUE (primary_email)
);

CREATE TABLE public.projects (
    project_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name varchar NULL,
    github_url varchar NULL,
    financial financial_type NULL DEFAULT 'PRO_BONO',
    created_at timestamptz(6) NULL DEFAULT now(),
    updated_at timestamptz(6) NULL DEFAULT now(),
    PRIMARY KEY (project_id)
);

CREATE TABLE public.officer_roles (
    role_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name varchar NULL,
    scope role_scope NULL,
    rank_level int NULL,
    PRIMARY KEY (role_id),
    UNIQUE (name)
);

CREATE TABLE public.project_roles (
    role_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name varchar NULL,
    is_leadership boolean NULL DEFAULT false,
    PRIMARY KEY (role_id)
);

CREATE TABLE public.partners (
    partner_id uuid NOT NULL DEFAULT gen_random_uuid(),
    legal_name varchar NULL,
    mission_statement text NULL,
    website_url varchar NULL,
    pcs_organization_type varchar NULL,
    pcs_subject varchar NULL,
    pcs_population varchar NULL,
    created_at timestamptz(6) NULL DEFAULT now(),
    PRIMARY KEY (partner_id)
);

-- Tables with dependencies
CREATE TABLE public.universities (
    university_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name varchar NULL,
    email_domain varchar NULL,
    location_id uuid NULL,
    PRIMARY KEY (university_id),
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.companies (
    company_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name varchar NULL,
    industry varchar NULL,
    location_id uuid NULL,
    PRIMARY KEY (company_id),
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.academic_terms (
    term_id uuid NOT NULL DEFAULT gen_random_uuid(),
    university_id uuid NULL,
    name varchar NULL,
    canonical_label varchar NULL,
    type term_type NULL,
    start_date date NULL,
    end_date date NULL,
    PRIMARY KEY (term_id),
    FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.chapters (
    chapter_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name varchar NULL,
    university_id uuid NULL,
    location_id uuid NULL,
    founded_date date NULL,
    PRIMARY KEY (chapter_id),
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.social_links (
    link_id uuid NOT NULL DEFAULT gen_random_uuid(),
    constituent_id uuid NULL,
    platform social_platform_type NULL,
    url varchar NULL,
    is_featured boolean NULL DEFAULT false,
    PRIMARY KEY (link_id),
    FOREIGN KEY (constituent_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE public.volunteers (
    volunteer_id uuid NOT NULL,
    org_email varchar NULL,
    active_status boolean NULL DEFAULT true,
    volunteer_class volunteer_class NULL DEFAULT 'COLLEGIATE',
    engagement_track engagement_track NULL DEFAULT 'PROGRAMS',
    major varchar NULL,
    education_level education_level NULL,
    graduation_term_id uuid NULL,
    university_id uuid NULL,
    home_chapter_id uuid NULL,
    employer_id uuid NULL,
    created_at timestamptz(6) NULL DEFAULT now(),
    updated_at timestamptz(6) NULL DEFAULT now(),
    PRIMARY KEY (volunteer_id),
    FOREIGN KEY (volunteer_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (employer_id) REFERENCES public.companies(company_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (graduation_term_id) REFERENCES public.academic_terms(term_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (home_chapter_id) REFERENCES public.chapters(chapter_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.mentorships (
    mentorship_id uuid NOT NULL DEFAULT gen_random_uuid(),
    mentor_id uuid NULL,
    mentee_id uuid NULL,
    program_type varchar NULL,
    status engagement_status NULL DEFAULT 'ACTIVE',
    start_date date NULL,
    end_date date NULL,
    notes text NULL,
    PRIMARY KEY (mentorship_id),
    FOREIGN KEY (mentor_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (mentee_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.project_deliverables (
    deliverable_id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NULL,
    label varchar NULL,
    url varchar NULL,
    category deliverable_type NULL,
    PRIMARY KEY (deliverable_id),
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE public.project_engagements (
    engagement_id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NULL,
    partner_id uuid NULL,
    chapter_id uuid NULL,
    academic_term_id uuid NULL,
    client_contact_id uuid NULL,
    status engagement_status NULL DEFAULT 'ACTIVE',
    domain domain_type NULL DEFAULT 'FULL_STACK',
    created_at timestamptz(6) NULL DEFAULT now(),
    updated_at timestamptz(6) NULL DEFAULT now(),
    PRIMARY KEY (engagement_id),
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (partner_id) REFERENCES public.partners(partner_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (chapter_id) REFERENCES public.chapters(chapter_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (academic_term_id) REFERENCES public.academic_terms(term_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (client_contact_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.officer_assignments (
    assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
    volunteer_id uuid NULL,
    role_id uuid NULL,
    chapter_id uuid NULL,
    start_date date NULL,
    end_date date NULL,
    PRIMARY KEY (assignment_id),
    FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(volunteer_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (role_id) REFERENCES public.officer_roles(role_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (chapter_id) REFERENCES public.chapters(chapter_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.project_staffing (
    staffing_id uuid NOT NULL DEFAULT gen_random_uuid(),
    volunteer_id uuid NULL,
    engagement_id uuid NULL,
    role_id uuid NULL,
    is_lead_contact boolean NULL DEFAULT false,
    start_date date NULL,
    end_date date NULL,
    PRIMARY KEY (staffing_id),
    FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(volunteer_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (engagement_id) REFERENCES public.project_engagements(engagement_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (role_id) REFERENCES public.project_roles(role_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.volunteer_history (
    history_id uuid NOT NULL DEFAULT gen_random_uuid(),
    volunteer_id uuid NULL,
    action_type action_type NULL,
    related_entity_id uuid NULL,
    previous_value_label varchar NULL,
    new_value_label varchar NULL,
    effective_date date NULL,
    PRIMARY KEY (history_id),
    FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(volunteer_id) ON UPDATE NO ACTION ON DELETE CASCADE
);
