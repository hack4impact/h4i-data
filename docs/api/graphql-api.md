# GraphQL API Documentation

## Overview

The GraphQL API provides a flexible way to query and mutate operations data. The endpoint uses `graphql-http` (not Apollo), so there is no built-in playground — use an external GraphQL client or cURL.

**Integrated server** (`pnpm run dev`): `http://localhost:3001/api/graphql`
**Standalone server** (`pnpm run dev:graphql`): `http://localhost:3003/`

---

## Schema Structure

### Volunteer Entity

```graphql
enum VolunteerClass {
  COLLEGIATE
  ALUMNI
  ASSOCIATE
}

enum EngagementTrack {
  PROGRAMS
  CENTRAL
  ADVISORY
}

enum EducationLevel {
  UNDERGRADUATE
  GRADUATE
  BOOTCAMP
  SELF_TAUGHT
  OTHER
}

enum MemberStatus {
  PROSPECT
  ACTIVE
  INACTIVE
  ON_HIATUS
}

type Volunteer {
  volunteer_id: ID!
  org_email: String
  status: MemberStatus
  volunteer_class: VolunteerClass
  engagement_track: EngagementTrack
  major_id: ID
  education_level: EducationLevel
  graduation_term_id: ID
  university_id: ID
  home_chapter_id: ID
  employer_id: ID
  created_at: String
  updated_at: String
  constituent: Constituent
}

type Query {
  volunteers: [Volunteer!]!
  volunteer(id: ID!): Volunteer
}

input CreateVolunteerInput {
  volunteer_id: ID!
  org_email: String
  status: MemberStatus
  volunteer_class: VolunteerClass
  engagement_track: EngagementTrack
  major_id: ID
  education_level: EducationLevel
  graduation_term_id: ID
  university_id: ID
  home_chapter_id: ID
  employer_id: ID
}

input UpdateVolunteerInput {
  org_email: String
  status: MemberStatus
  volunteer_class: VolunteerClass
  engagement_track: EngagementTrack
  major_id: ID
  education_level: EducationLevel
  graduation_term_id: ID
  university_id: ID
  home_chapter_id: ID
  employer_id: ID
}

type Mutation {
  createVolunteer(input: CreateVolunteerInput!): Volunteer!
  updateVolunteer(id: ID!, input: UpdateVolunteerInput!): Volunteer!
  deleteVolunteer(id: ID!): Volunteer
}
```

### Chapter Entity

```graphql
enum ChapterStatus {
  PROSPECT
  ACTIVE
  INACTIVE
  SUSPENDED
}

type Chapter {
  chapter_id: ID!
  name: String!
  university_id: ID
  location_id: ID
  founded_date: String
  status: ChapterStatus
  created_at: String
  updated_at: String
}

type Query {
  chapters: [Chapter!]!
  chapter(id: ID!): Chapter
}

input CreateChapterInput {
  name: String!
  university_id: ID
  location_id: ID
  founded_date: String
  status: ChapterStatus
}

input UpdateChapterInput {
  name: String
  university_id: ID
  location_id: ID
  founded_date: String
  status: ChapterStatus
}

type Mutation {
  createChapter(input: CreateChapterInput!): Chapter!
  updateChapter(id: ID!, input: UpdateChapterInput!): Chapter!
  deleteChapter(id: ID!): Chapter
}
```

### Academic Term Entity

```graphql
enum TermType {
  SEMESTER
  QUARTER
  TRIMESTER
}

type AcademicTerm {
  term_id: ID!
  university_id: ID
  name: String!
  canonical_label: String
  type: TermType
  start_date: String
  end_date: String
  created_at: String
  updated_at: String
}

type Query {
  academicTerms: [AcademicTerm!]!
  academicTerm(id: ID!): AcademicTerm
}

input CreateAcademicTermInput {
  university_id: ID
  name: String!
  canonical_label: String
  type: TermType
  start_date: String
  end_date: String
}

input UpdateAcademicTermInput {
  university_id: ID
  name: String
  canonical_label: String
  type: TermType
  start_date: String
  end_date: String
}

type Mutation {
  createAcademicTerm(input: CreateAcademicTermInput!): AcademicTerm!
  updateAcademicTerm(id: ID!, input: UpdateAcademicTermInput!): AcademicTerm!
  deleteAcademicTerm(id: ID!): AcademicTerm
}
```

### Company Entity

```graphql
type Company {
  company_id: ID!
  name: String!
  industry_id: ID
  location_id: ID
  created_at: String
  updated_at: String
}

input CompanyCreateInput {
  name: String!
  industry_id: ID
  location_id: ID
}

input CompanyUpdateInput {
  name: String
  industry_id: ID
  location_id: ID
}

extend type Query {
  company(company_id: ID!): Company
  companies: [Company!]!
}

extend type Mutation {
  createCompany(input: CompanyCreateInput!): Company!
  updateCompany(company_id: ID!, input: CompanyUpdateInput!): Company!
  deleteCompany(company_id: ID!): Boolean!
}
```

### Constituent Entity

```graphql
type Constituent {
  constituent_id: ID!
  first_name: String!
  last_name: String!
  primary_email: String!
  phone_number: String
  created_at: String
  updated_at: String
}

type Query {
  constituents: [Constituent!]!
  constituent(id: ID!): Constituent
}

input CreateConstituentInput {
  first_name: String!
  last_name: String!
  primary_email: String!
  phone_number: String
}

input UpdateConstituentInput {
  first_name: String
  last_name: String
  primary_email: String
  phone_number: String
}

type Mutation {
  createConstituent(input: CreateConstituentInput!): Constituent!
  updateConstituent(id: ID!, input: UpdateConstituentInput!): Constituent!
  deleteConstituent(id: ID!): Constituent
}
```

### Location Entity

```graphql
type Location {
  location_id: ID!
  name: String!
  address_line: String
  city: String
  state_code: String
  postal_code: String
  country_code: String
  created_at: String
  updated_at: String
}

type Query {
  locations: [Location!]!
  location(id: ID!): Location
}

input CreateLocationInput {
  name: String!
  address_line: String
  city: String
  state_code: String
  postal_code: String
  country_code: String
}

input UpdateLocationInput {
  name: String
  address_line: String
  city: String
  state_code: String
  postal_code: String
  country_code: String
}

type Mutation {
  createLocation(input: CreateLocationInput!): Location!
  updateLocation(id: ID!, input: UpdateLocationInput!): Location!
  deleteLocation(id: ID!): Location
}
```

### Major Entity

```graphql
type Major {
  major_id: ID!
  name: String!
  created_at: String
  updated_at: String
}

type Query {
  majors: [Major!]!
  major(id: ID!): Major
}

input CreateMajorInput {
  name: String!
}

input UpdateMajorInput {
  name: String
}

type Mutation {
  createMajor(input: CreateMajorInput!): Major!
  updateMajor(id: ID!, input: UpdateMajorInput!): Major!
  deleteMajor(id: ID!): Major
}
```

### Mentor Entity

```graphql
type Mentor {
  mentor_id: ID!
  status: MemberStatus
  expertise_area: String
  max_mentees: Int
  created_at: String
  updated_at: String
  constituent: Constituent
}

type Query {
  mentors: [Mentor!]!
  mentor(id: ID!): Mentor
}

input CreateMentorInput {
  mentor_id: ID!
  status: MemberStatus
  expertise_area: String
  max_mentees: Int
}

input UpdateMentorInput {
  status: MemberStatus
  expertise_area: String
  max_mentees: Int
}

type Mutation {
  createMentor(input: CreateMentorInput!): Mentor!
  updateMentor(id: ID!, input: UpdateMentorInput!): Mentor!
  deleteMentor(id: ID!): Mentor
}
```

### Mentorship Entity

```graphql
enum EngagementStatus {
  PROSPECT
  ACTIVE
  COMPLETED
  ON_HOLD
}

type Mentorship {
  mentorship_id: ID!
  mentor_id: ID!
  mentee_id: ID!
  program_type: String
  status: EngagementStatus
  start_date: String
  end_date: String
  notes: String
  created_at: String
  updated_at: String
}

type Query {
  mentorships: [Mentorship!]!
  mentorship(id: ID!): Mentorship
}

input CreateMentorshipInput {
  mentor_id: ID!
  mentee_id: ID!
  program_type: String
  status: EngagementStatus
  start_date: String
  end_date: String
  notes: String
}

input UpdateMentorshipInput {
  mentor_id: ID
  mentee_id: ID
  program_type: String
  status: EngagementStatus
  start_date: String
  end_date: String
  notes: String
}

type Mutation {
  createMentorship(input: CreateMentorshipInput!): Mentorship!
  updateMentorship(id: ID!, input: UpdateMentorshipInput!): Mentorship!
  deleteMentorship(id: ID!): Mentorship
}
```

### Officer Assignment Entity

```graphql
type OfficerAssignment {
  assignment_id: ID!
  volunteer_id: ID!
  role_id: ID!
  chapter_id: ID!
  start_date: String
  end_date: String
  created_at: String
  updated_at: String
}

type Query {
  officerAssignments: [OfficerAssignment!]!
  officerAssignment(id: ID!): OfficerAssignment
}

input CreateOfficerAssignmentInput {
  volunteer_id: ID!
  role_id: ID!
  chapter_id: ID!
  start_date: String
  end_date: String
}

input UpdateOfficerAssignmentInput {
  volunteer_id: ID
  role_id: ID
  chapter_id: ID
  start_date: String
  end_date: String
}

type Mutation {
  createOfficerAssignment(input: CreateOfficerAssignmentInput!): OfficerAssignment!
  updateOfficerAssignment(id: ID!, input: UpdateOfficerAssignmentInput!): OfficerAssignment!
  deleteOfficerAssignment(id: ID!): OfficerAssignment
}
```

### Officer Role Entity

```graphql
enum RoleScope {
  CHAPTER
  CENTRAL
}

type OfficerRole {
  role_id: ID!
  name: String!
  scope: RoleScope
  rank_level: Int
  created_at: String
  updated_at: String
}

type Query {
  officerRoles: [OfficerRole!]!
  officerRole(id: ID!): OfficerRole
}

input CreateOfficerRoleInput {
  name: String!
  scope: RoleScope
  rank_level: Int
}

input UpdateOfficerRoleInput {
  name: String
  scope: RoleScope
  rank_level: Int
}

type Mutation {
  createOfficerRole(input: CreateOfficerRoleInput!): OfficerRole!
  updateOfficerRole(id: ID!, input: UpdateOfficerRoleInput!): OfficerRole!
  deleteOfficerRole(id: ID!): OfficerRole
}
```

### Partner Entity

```graphql
type Partner {
  partner_id: ID!
  legal_name: String!
  mission_statement: String
  website_url: String
  pcs_organization_type: String
  pcs_subject: String
  pcs_population: String
  created_at: String
  updated_at: String
}

type Query {
  partners: [Partner!]!
  partner(id: ID!): Partner
}

input CreatePartnerInput {
  legal_name: String!
  mission_statement: String
  website_url: String
  pcs_organization_type: String
  pcs_subject: String
  pcs_population: String
}

input UpdatePartnerInput {
  legal_name: String
  mission_statement: String
  website_url: String
  pcs_organization_type: String
  pcs_subject: String
  pcs_population: String
}

type Mutation {
  createPartner(input: CreatePartnerInput!): Partner!
  updatePartner(id: ID!, input: UpdatePartnerInput!): Partner!
  deletePartner(id: ID!): Partner
}
```

### Project Deliverable Entity

```graphql
enum DeliverableType {
  REPO
  DESIGN_SPEC
  LIVE_URL
  DOCUMENTATION
}

type ProjectDeliverable {
  deliverable_id: ID!
  project_id: ID!
  label: String
  url: String
  category: DeliverableType
  created_at: String
  updated_at: String
}

type Query {
  projectDeliverables: [ProjectDeliverable!]!
  projectDeliverable(id: ID!): ProjectDeliverable
}

input CreateProjectDeliverableInput {
  project_id: ID!
  label: String
  url: String
  category: DeliverableType
}

input UpdateProjectDeliverableInput {
  project_id: ID
  label: String
  url: String
  category: DeliverableType
}

type Mutation {
  createProjectDeliverable(input: CreateProjectDeliverableInput!): ProjectDeliverable!
  updateProjectDeliverable(id: ID!, input: UpdateProjectDeliverableInput!): ProjectDeliverable!
  deleteProjectDeliverable(id: ID!): ProjectDeliverable
}
```

### Project Engagement Entity

```graphql
enum DomainType {
  DESIGN_ONLY
  DEVELOP_ONLY
  FULL_STACK
  STRATEGY_CONSULT
  MAINTENANCE
}

type ProjectEngagement {
  engagement_id: ID!
  project_id: ID!
  partner_id: ID
  chapter_id: ID
  academic_term_id: ID
  client_contact_id: ID
  status: EngagementStatus
  domain: DomainType
  created_at: String
  updated_at: String
}

type Query {
  projectEngagements: [ProjectEngagement!]!
  projectEngagement(id: ID!): ProjectEngagement
}

input CreateProjectEngagementInput {
  project_id: ID!
  partner_id: ID
  chapter_id: ID
  academic_term_id: ID
  client_contact_id: ID
  status: EngagementStatus
  domain: DomainType
}

input UpdateProjectEngagementInput {
  project_id: ID
  partner_id: ID
  chapter_id: ID
  academic_term_id: ID
  client_contact_id: ID
  status: EngagementStatus
  domain: DomainType
}

type Mutation {
  createProjectEngagement(input: CreateProjectEngagementInput!): ProjectEngagement!
  updateProjectEngagement(id: ID!, input: UpdateProjectEngagementInput!): ProjectEngagement!
  deleteProjectEngagement(id: ID!): ProjectEngagement
}
```

### Project Role Entity

```graphql
type ProjectRole {
  role_id: ID!
  name: String!
  is_leadership: Boolean
  created_at: String
  updated_at: String
}

type Query {
  projectRoles: [ProjectRole!]!
  projectRole(id: ID!): ProjectRole
}

input CreateProjectRoleInput {
  name: String!
  is_leadership: Boolean
}

input UpdateProjectRoleInput {
  name: String
  is_leadership: Boolean
}

type Mutation {
  createProjectRole(input: CreateProjectRoleInput!): ProjectRole!
  updateProjectRole(id: ID!, input: UpdateProjectRoleInput!): ProjectRole!
  deleteProjectRole(id: ID!): ProjectRole
}
```

### Project Staffing Entity

```graphql
type ProjectStaffing {
  staffing_id: ID!
  volunteer_id: ID!
  engagement_id: ID!
  role_id: ID
  is_lead_contact: Boolean
  start_date: String
  end_date: String
  created_at: String
  updated_at: String
}

type Query {
  projectStaffings: [ProjectStaffing!]!
  projectStaffing(id: ID!): ProjectStaffing
}

input CreateProjectStaffingInput {
  volunteer_id: ID!
  engagement_id: ID!
  role_id: ID
  is_lead_contact: Boolean
  start_date: String
  end_date: String
}

input UpdateProjectStaffingInput {
  volunteer_id: ID
  engagement_id: ID
  role_id: ID
  is_lead_contact: Boolean
  start_date: String
  end_date: String
}

type Mutation {
  createProjectStaffing(input: CreateProjectStaffingInput!): ProjectStaffing!
  updateProjectStaffing(id: ID!, input: UpdateProjectStaffingInput!): ProjectStaffing!
  deleteProjectStaffing(id: ID!): ProjectStaffing
}
```

### Project Entity

```graphql
enum FinancialType {
  PRO_BONO
  INTERNAL
  PAID_CONSULT
}

enum ProjectStatus {
  WORKING
  ACTIVE
  INACTIVE
  ARCHIVED
}

type Project {
  project_id: ID!
  name: String!
  github_url: String
  financial: FinancialType
  status: ProjectStatus
  created_at: String
  updated_at: String
}

type Query {
  projects(sortOrder: String): [Project!]!
  project(id: ID!): Project
}

input CreateProjectInput {
  name: String!
  github_url: String
  financial: FinancialType
  status: ProjectStatus
}

input UpdateProjectInput {
  name: String
  github_url: String
  financial: FinancialType
  status: ProjectStatus
}

type Mutation {
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Project
}
```

### Social Link Entity

```graphql
enum SocialPlatformType {
  GITHUB
  LINKEDIN
  PORTFOLIO
  TWITTER
  DRIBBBLE
  OTHER
}

type SocialLink {
  link_id: ID!
  constituent_id: ID!
  platform: SocialPlatformType
  url: String!
  is_featured: Boolean
  created_at: String
  updated_at: String
}

type Query {
  socialLinks: [SocialLink!]!
  socialLink(id: ID!): SocialLink
}

input CreateSocialLinkInput {
  constituent_id: ID!
  platform: SocialPlatformType
  url: String!
  is_featured: Boolean
}

input UpdateSocialLinkInput {
  constituent_id: ID
  platform: SocialPlatformType
  url: String
  is_featured: Boolean
}

type Mutation {
  createSocialLink(input: CreateSocialLinkInput!): SocialLink!
  updateSocialLink(id: ID!, input: UpdateSocialLinkInput!): SocialLink!
  deleteSocialLink(id: ID!): SocialLink
}
```

### University Entity

```graphql
type University {
  university_id: ID!
  name: String!
  email_domain: String
  location_id: ID
  created_at: String
  updated_at: String
}

type Query {
  universities: [University!]!
  university(id: ID!): University
}

input CreateUniversityInput {
  name: String!
  email_domain: String
  location_id: ID
}

input UpdateUniversityInput {
  name: String
  email_domain: String
  location_id: ID
}

type Mutation {
  createUniversity(input: CreateUniversityInput!): University!
  updateUniversity(id: ID!, input: UpdateUniversityInput!): University!
  deleteUniversity(id: ID!): University
}
```

### Volunteer History Entity

```graphql
enum ActionType {
  ENROLLED
  PROMOTED
  DEMOTED
  ROLE_CHANGE
  GRADUATED
  RESIGNED
  HIATUS
}

enum EntityType {
  CHAPTER
  OFFICER_ROLE
  PROJECT
  PROJECT_ROLE
  ENGAGEMENT
  UNIVERSITY
  COMPANY
}

type VolunteerHistory {
  history_id: ID!
  volunteer_id: ID!
  action_type: ActionType!
  related_entity_id: ID
  related_entity_type: EntityType
  previous_value_label: String
  new_value_label: String
  effective_date: String!
  created_at: String
  updated_at: String
}

type Query {
  volunteerHistories: [VolunteerHistory!]!
  volunteerHistory(id: ID!): VolunteerHistory
}

input CreateVolunteerHistoryInput {
  volunteer_id: ID!
  action_type: ActionType!
  related_entity_id: ID
  previous_value_label: String
  new_value_label: String
  effective_date: String!
}

input UpdateVolunteerHistoryInput {
  volunteer_id: ID
  action_type: ActionType
  related_entity_id: ID
  previous_value_label: String
  new_value_label: String
  effective_date: String
}

type Mutation {
  createVolunteerHistory(input: CreateVolunteerHistoryInput!): VolunteerHistory!
  updateVolunteerHistory(id: ID!, input: UpdateVolunteerHistoryInput!): VolunteerHistory!
  deleteVolunteerHistory(id: ID!): VolunteerHistory
}
```

---

## Queries

### Get All Volunteers

```graphql
query {
  volunteers {
    volunteer_id
    first_name
    last_name
    email
    volunteer_status
  }
}
```

### Get Single Volunteer with Variables

```graphql
query GetVolunteer($id: ID!) {
  volunteer(id: $id) {
    volunteer_id
    first_name
    last_name
    email
    volunteer_status
  }
}
```

**Variables**:

```json
{
  "id": "your-volunteer-id-here"
}
```

---

## Mutations

### Create a Volunteer

```graphql
mutation CreateVolunteer($input: CreateVolunteerInput!) {
  createVolunteer(input: $input) {
    volunteer_id
    first_name
    last_name
    email
    graduation_date
    university_id
    volunteer_status
    volunteer_type
  }
}
```

**Input Type**:

```graphql
input CreateVolunteerInput {
  first_name: String
  last_name: String
  email: String
  graduation_date: String
  university_id: ID
  volunteer_status: StatusType
  volunteer_type: VolunteerType
  h4i_email: String
  chapter_id: ID
  company_id: ID
}
```

**Variables Example**:

```typescript
{
  input: {
    first_name: 'John',
    last_name: 'Doe',
    email:
      'john.doe' +
      Date.now() +
      Math.floor(Math.random() * 1000) +
      '@example.com',
    graduation_date: new Date('2026-06-18').toISOString(),
    volunteer_status: 'STUDENT',
    volunteer_type: 'BOTH',
    university_id: '07608837-420f-4697-bda2-701506079a9d', // Test UUID from Supabase
  },
}
```

### Update Volunteer (updating only first and last name)

```graphql
mutation UpdateVolunteer($id: ID!, $input: UpdateVolunteerInput!) {
  updateVolunteer(id: $id, input: $input) {
    volunteer_id
    first_name
    last_name
  }
}
```

**Input Type**:

```graphql
input UpdateVolunteerInput {
  first_name: String
  last_name: String
  email: String
  graduation_date: String
  university_id: ID
  volunteer_status: StatusType
  volunteer_type: VolunteerType
  h4i_email: String
  chapter_id: ID
  company_id: ID
}
```

### Delete a Volunteer

```graphql
mutation DeleteVolunteer($id: ID!) {
  deleteVolunteer(id: $id) {
    volunteer_id
  }
}
```

---

## Error Handling

GraphQL errors are returned in the standard GraphQL error format:

```graphql
{
  errors: [
    {
      message: 'Database error: Failed to retrieve volunteer',
      locations: [Array],
      path: [Array]
    }
  ],
  data: { volunteer: null }
}
```

### Common Error Codes

- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_ERROR`: Server error

---

## Validation Rules

### Volunteer Validation

- `first_name`: Minimum 2 characters, required for creation
- `last_name`: Minimum 2 characters, required for creation
- `email`: Must be a valid email address
- `graduation_date`: Must be valid ISO 8601 datetime string
- `volunteer_status`: Must be either `STUDENT` or `PROFESSIONAL`
- `h4i_email`: Optional field of a valid H4I email address
- `volunteer_type`: Must be either `CHAPTER` or `BOTH` or `OPERATIONS`
- `university_id`: Must be valid UUID format if provided
- `chapter_id`: Must be valid UUID format if provided
- `company_id`: Must be valid UUID format if provided

---

## Development Tools

### Introspection

Since `graphql-http` does not include a built-in playground, use a tool like [GraphQL Playground](https://github.com/graphql/graphql-playground), Postman, or Insomnia to explore the API. You can also use introspection queries via cURL.

### Top Level Introspection Query

Get the top level schema:

```graphql
query IntrospectionQuery {
  __schema {
    queryType {
      name
      fields {
        name
        type {
          name
          kind
        }
      }
    }
    mutationType {
      name
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
}
```
