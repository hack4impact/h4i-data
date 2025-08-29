import { VolunteerStatus, VolunteerType } from "./enums";

export interface VolunteerInput {
  first_name: string;
  last_name: string;
  email: string;
  graduation_date: Date;
  volunteer_status: VolunteerStatus;
  H4I_email?: string;
  volunteer_type: VolunteerType;
  university_id: string;
}

export interface Volunteer extends VolunteerInput {
  volunteer_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface VolunteerUpdateInput extends Partial<VolunteerInput> {}
