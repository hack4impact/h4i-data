// Validation utilities for volunteer data
// This file provides input validation and sanitization for volunteer records

import { VolunteerInput, VolunteerStatus, VolunteerType } from '../types';

/**
 * Regular expression constants for validation.
 * These are defined at module level for reuse and performance.
 */

// Basic email validation regex - checks for basic email format (user@domain.ext)
// Note: This is not RFC-compliant but catches most common mistakes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UUID v4 validation regex - ensures proper UUID format
// Matches: 8-4-4-4-12 hex digits with version and variant bits
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Custom error class for validation failures.
 * Extends the standard Error class to provide specific error type
 * that can be caught and handled differently from other errors.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError'; // Helps with error type identification
  }
}

/**
 * Volunteer validation utility class.
 * Contains static methods for validating volunteer-related data.
 * Uses static methods since we don't need to maintain state between validations.
 */
export class VolunteerValidator {
  /**
   * Validates a volunteer ID (UUID format).
   * Ensures the ID is present and follows UUID v4 format.
   *
   * @param id - The ID string to validate
   * @throws ValidationError if ID is missing or invalid format
   */
  static validateId(id: string): void {
    // Check if ID is present and not just whitespace
    if (!id?.trim()) {
      throw new ValidationError('ID is required');
    }

    // Validate UUID format using regex
    if (!UUID_REGEX.test(id)) {
      throw new ValidationError('Invalid ID format. Must be a valid UUID');
    }
  }

  /**
   * Comprehensive validation of volunteer input data.
   * Validates all required fields, formats, and enum values.
   * Accumulates all errors and throws a single ValidationError with all issues.
   *
   * @param data - Volunteer input data to validate
   * @throws ValidationError with detailed error message if validation fails
   */
  static validateVolunteerInput(data: VolunteerInput): void {
    const errors: string[] = [];

    /**
     * Required field validation.
     * Checks that all required fields are present and not empty/whitespace-only.
     */
    if (!data.first_name?.trim()) errors.push('first_name is required');
    if (!data.last_name?.trim()) errors.push('last_name is required');
    if (!data.email?.trim()) errors.push('email is required');
    if (!data.graduation_date) errors.push('graduation_date is required');
    if (!data.volunteer_status) errors.push('volunteer_status is required');
    if (!data.volunteer_type) errors.push('volunteer_type is required');
    if (!data.university_id?.trim()) errors.push('university_id is required');

    /**
     * Email format validation.
     * Only validates format if email is provided (to avoid duplicate error messages).
     */
    if (data.email && !EMAIL_REGEX.test(data.email.trim())) {
      errors.push('Invalid email format');
    }

    /**
     * Enum validation for volunteer_status.
     * Ensures the provided status is one of the allowed enum values.
     */
    if (
      data.volunteer_status &&
      !Object.values(VolunteerStatus).includes(data.volunteer_status)
    ) {
      errors.push(
        `Invalid volunteer_status. Must be one of: 
  ${Object.values(VolunteerStatus).join(', ')}`
      );
    }

    /**
     * Enum validation for volunteer_type.
     * Ensures the provided type is one of the allowed enum values.
     */
    if (
      data.volunteer_type &&
      !Object.values(VolunteerType).includes(data.volunteer_type)
    ) {
      errors.push(
        `Invalid volunteer_type. Must be one of: 
  ${Object.values(VolunteerType).join(', ')}`
      );
    }

    /**
     * Date format validation.
     * Checks that graduation_date can be parsed as a valid JavaScript Date.
     * JavaScript Date constructor is quite permissive, so this catches obvious errors.
     */
    if (data.graduation_date) {
      const graduationDate = new Date(data.graduation_date);
      if (isNaN(graduationDate.getTime())) {
        errors.push(
          'Invalid graduation_date format. Use ISO 8601 format (YYYY-MM-DD)'
        );
      }
    }

    /**
     * UUID validation for university_id.
     * Only validates format if university_id is provided.
     */
    if (data.university_id && !UUID_REGEX.test(data.university_id)) {
      errors.push('Invalid university_id format. Must be a valid UUID');
    }

    // If any validation errors occurred, throw a single error with all issues
    if (errors.length > 0) {
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Sanitizes volunteer input data by trimming whitespace and normalizing formats.
   * This should be called after validation to clean up the data before storage.
   *
   * @param data - Raw volunteer input data
   * @returns Sanitized volunteer input data
   */
  static sanitizeVolunteerInput(data: VolunteerInput): VolunteerInput {
    return {
      ...data,
      // Trim whitespace from text fields
      first_name: data.first_name?.trim(),
      last_name: data.last_name?.trim(),
      // Normalize email addresses to lowercase and trim whitespace
      email: data.email?.trim().toLowerCase(),
      H4I_email: data.H4I_email?.trim().toLowerCase(),
      // Trim whitespace from IDs
      university_id: data.university_id?.trim(),
    };
  }
}
