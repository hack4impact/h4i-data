-- Drop and recreate schema for idempotent reseeding
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Enums
CREATE TYPE public.action_type AS ENUM ('JOINED', 'LEFT', 'HIATUS', 'ENROLLED', 'PROMOTED', 'DEMOTED', 'ROLE_CHANGE', 'GRADUATED', 'RESIGNED');
CREATE TYPE public.project_resource_type AS ENUM ('CODE', 'DESIGNS', 'REQUIREMENTS', 'LIVE_URL', 'DOCUMENTATION');
CREATE TYPE public.project_type AS ENUM ('DESIGN_ONLY', 'DEVELOP_ONLY', 'FULL_STACK', 'STRATEGY_CONSULT', 'MAINTENANCE');
CREATE TYPE public.education_level AS ENUM ('UNDERGRADUATE', 'GRADUATE', 'BOOTCAMP', 'SELF_TAUGHT', 'OTHER');
CREATE TYPE public.engagement_status AS ENUM ('PROSPECT', 'ACTIVE', 'COMPLETED', 'ON_HOLD');
CREATE TYPE public.engagement_track AS ENUM ('PROGRAMS', 'CENTRAL', 'ADVISORY');
CREATE TYPE public.financial_type AS ENUM ('PRO_BONO', 'INTERNAL', 'PAID_CONSULT');
CREATE TYPE public.role_scope AS ENUM ('CHAPTER', 'CENTRAL');
CREATE TYPE public.social_platform_type AS ENUM ('GITHUB', 'LINKEDIN', 'PORTFOLIO', 'TWITTER', 'DRIBBBLE', 'OTHER');
CREATE TYPE public.term_type AS ENUM ('SEMESTER', 'QUARTER', 'TRIMESTER');
CREATE TYPE public.volunteer_class AS ENUM ('COLLEGIATE', 'ALUMNI', 'ASSOCIATE');
CREATE TYPE public.volunteer_status AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'HIATUS');
CREATE TYPE public.chapter_status AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE public.project_status AS ENUM ('WORKING', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE public.entity_type AS ENUM ('CHAPTER', 'OFFICER_ROLE', 'PROJECT', 'PROJECT_ROLE', 'ENGAGEMENT', 'UNIVERSITY', 'COMPANY');

-- Create Tables (in an order that respects foreign keys)

-- Tables with no or few dependencies
CREATE TABLE public.locations (
    location_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address_line text NULL,
    city text NULL,
    state_code text NULL,
    postal_code text NULL,
    country_code text NULL DEFAULT 'USA',
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (location_id)
);

CREATE TABLE public.constituents (
    constituent_id uuid NOT NULL DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    primary_email text NOT NULL,
    phone_number text NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (constituent_id),
    UNIQUE (primary_email)
);

CREATE TABLE public.projects (
    project_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    github_url text NULL,
    status project_status NOT NULL DEFAULT 'WORKING',
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id)
);

CREATE TABLE public.officer_roles (
    role_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    scope role_scope NULL,
    rank_level int NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id),
    UNIQUE (name)
);

CREATE TABLE public.project_roles (
    role_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    is_leadership boolean NULL DEFAULT false,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id),
    UNIQUE (name)
);

CREATE TABLE public.partners (
    partner_id uuid NOT NULL DEFAULT gen_random_uuid(),
    legal_name text NOT NULL,
    mission_statement text NULL,
    website_url text NULL,
    pcs_organization_type text NULL,
    pcs_subject text NULL,
    pcs_population text NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (partner_id)
);

CREATE TABLE public.majors (
    major_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (major_id),
    UNIQUE (name)
);

-- Tables with dependencies
CREATE TABLE public.universities (
    university_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email_domain text NULL,
    location_id uuid NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (university_id),
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX idx_universities_location_id ON public.universities(location_id);

CREATE TABLE public.companies (
    company_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    location_id uuid NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (company_id),
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX idx_companies_location_id ON public.companies(location_id);

CREATE TABLE public.academic_terms (
    term_id uuid NOT NULL DEFAULT gen_random_uuid(),
    university_id uuid NULL,
    name text NOT NULL,
    canonical_label text NULL,
    type term_type NULL,
    start_date date NULL,
    end_date date NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (term_id),
    FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX idx_academic_terms_university_id ON public.academic_terms(university_id);

CREATE TABLE public.chapters (
    chapter_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    university_id uuid NULL,
    location_id uuid NULL,
    founded_date date NULL,
    status chapter_status NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (chapter_id),
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX idx_chapters_university_id ON public.chapters(university_id);
CREATE INDEX idx_chapters_location_id ON public.chapters(location_id);

CREATE TABLE public.social_links (
    link_id uuid NOT NULL DEFAULT gen_random_uuid(),
    constituent_id uuid NOT NULL,
    platform social_platform_type NULL,
    url text NOT NULL,
    is_featured boolean NULL DEFAULT false,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (link_id),
    FOREIGN KEY (constituent_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE CASCADE
);
CREATE INDEX idx_social_links_constituent_id ON public.social_links(constituent_id);

CREATE TABLE public.mentors (
    mentor_id uuid NOT NULL,
    status volunteer_status NOT NULL DEFAULT 'ACTIVE',
    expertise_area text NULL,
    max_mentees int NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (mentor_id),
    FOREIGN KEY (mentor_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE public.volunteers (
    volunteer_id uuid NOT NULL,
    org_email text NULL,
    status volunteer_status NOT NULL DEFAULT 'ACTIVE',
    volunteer_class volunteer_class NULL DEFAULT 'COLLEGIATE',
    engagement_track engagement_track NULL DEFAULT 'PROGRAMS',
    major_id uuid NULL,
    education_level education_level NULL,
    graduation_term_id uuid NULL,
    university_id uuid NULL,
    home_chapter_id uuid NULL,
    employer_id uuid NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (volunteer_id),
    FOREIGN KEY (volunteer_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (employer_id) REFERENCES public.companies(company_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (graduation_term_id) REFERENCES public.academic_terms(term_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (home_chapter_id) REFERENCES public.chapters(chapter_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (major_id) REFERENCES public.majors(major_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX idx_volunteers_major_id ON public.volunteers(major_id);
CREATE INDEX idx_volunteers_graduation_term_id ON public.volunteers(graduation_term_id);
CREATE INDEX idx_volunteers_university_id ON public.volunteers(university_id);
CREATE INDEX idx_volunteers_home_chapter_id ON public.volunteers(home_chapter_id);
CREATE INDEX idx_volunteers_employer_id ON public.volunteers(employer_id);

CREATE TABLE public.mentorships (
    mentorship_id uuid NOT NULL DEFAULT gen_random_uuid(),
    mentor_id uuid NOT NULL,
    mentee_id uuid NOT NULL,
    program_type text NULL,
    status engagement_status NULL DEFAULT 'ACTIVE',
    start_date date NULL,
    end_date date NULL,
    notes text NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (mentorship_id),
    FOREIGN KEY (mentor_id) REFERENCES public.mentors(mentor_id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX idx_mentorships_mentor_id ON public.mentorships(mentor_id);
CREATE INDEX idx_mentorships_mentee_id ON public.mentorships(mentee_id);

CREATE TABLE public.project_resources (
    deliverable_id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    label text NULL,
    url text NULL,
    category project_resource_type NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (deliverable_id),
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON UPDATE NO ACTION ON DELETE CASCADE
);
CREATE INDEX idx_project_resources_project_id ON public.project_resources(project_id);

CREATE TABLE public.project_engagements (
    engagement_id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    partner_id uuid NULL,
    chapter_id uuid NULL,
    academic_term_id uuid NULL,
    client_contact_id uuid NULL,
    status engagement_status NULL DEFAULT 'ACTIVE',
    domain project_type NULL DEFAULT 'FULL_STACK',
    financial financial_type NULL DEFAULT 'PRO_BONO',
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (engagement_id),
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (partner_id) REFERENCES public.partners(partner_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (chapter_id) REFERENCES public.chapters(chapter_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (academic_term_id) REFERENCES public.academic_terms(term_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (client_contact_id) REFERENCES public.constituents(constituent_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX idx_project_engagements_project_id ON public.project_engagements(project_id);
CREATE INDEX idx_project_engagements_partner_id ON public.project_engagements(partner_id);
CREATE INDEX idx_project_engagements_chapter_id ON public.project_engagements(chapter_id);
CREATE INDEX idx_project_engagements_academic_term_id ON public.project_engagements(academic_term_id);
CREATE INDEX idx_project_engagements_client_contact_id ON public.project_engagements(client_contact_id);

CREATE TABLE public.officer_assignments (
    assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
    volunteer_id uuid NOT NULL,
    role_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    start_date date NULL,
    end_date date NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (assignment_id),
    FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(volunteer_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (role_id) REFERENCES public.officer_roles(role_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (chapter_id) REFERENCES public.chapters(chapter_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    UNIQUE (volunteer_id, role_id, chapter_id)
);
CREATE INDEX idx_officer_assignments_volunteer_id ON public.officer_assignments(volunteer_id);
CREATE INDEX idx_officer_assignments_role_id ON public.officer_assignments(role_id);
CREATE INDEX idx_officer_assignments_chapter_id ON public.officer_assignments(chapter_id);

CREATE TABLE public.project_staffing (
    staffing_id uuid NOT NULL DEFAULT gen_random_uuid(),
    volunteer_id uuid NOT NULL,
    engagement_id uuid NOT NULL,
    role_id uuid NULL,
    is_lead_contact boolean NULL DEFAULT false,
    start_date date NULL,
    end_date date NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (staffing_id),
    FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(volunteer_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (engagement_id) REFERENCES public.project_engagements(engagement_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (role_id) REFERENCES public.project_roles(role_id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    UNIQUE (volunteer_id, engagement_id)
);
CREATE INDEX idx_project_staffing_volunteer_id ON public.project_staffing(volunteer_id);
CREATE INDEX idx_project_staffing_engagement_id ON public.project_staffing(engagement_id);
CREATE INDEX idx_project_staffing_role_id ON public.project_staffing(role_id);

CREATE TABLE public.volunteer_history (
    history_id uuid NOT NULL DEFAULT gen_random_uuid(),
    volunteer_id uuid NOT NULL,
    action_type action_type NOT NULL,
    related_entity_id uuid NULL,
    related_entity_type entity_type NULL,
    previous_value_label text NULL,
    new_value_label text NULL,
    effective_date date NOT NULL,
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    updated_at timestamptz(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (history_id),
    FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(volunteer_id) ON UPDATE NO ACTION ON DELETE CASCADE
);
CREATE INDEX idx_volunteer_history_volunteer_id ON public.volunteer_history(volunteer_id);
