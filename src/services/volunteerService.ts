// src/services/volunteerService.ts

// Volunteer service layer - business logic for volunteer operations
// This file uses Zod for schema validation to ensure data integrity,
// separating business logic from the database and API layers.

import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { VolunteerValidator, ValidationError } from '../utils/validators';
import { volunteerSchema } from '../types/';
import { core, ZodError } from 'zod';

/**
 * VolunteerService class handles all business logic for volunteer operations.
 * This service layer provides:
 * - Data validation and sanitization via Zod schemas.
 * - Database operations through Prisma.
 * - Centralized error handling and transformation.
 * - Enforcement of business rules.
 *
 * This pattern abstracts the business logic from API concerns (like request/response handling),
 * making the code more modular, testable, and maintainable.
 */
export class VolunteerService {
  /**
   * Retrieves all volunteers from the database.
   * Returns volunteers sorted by their creation date in descending order (newest first).
   *
   * @returns {Promise<Volunteer[]>} A promise that resolves to an array of all volunteer records.
   * @throws {Error} If the database query fails, a generic error is thrown.
   */
  getAllVolunteers = async () => {
    try {
      const volunteers = await prisma.volunteers.findMany({
        // A consistent ordering provides a predictable response for API consumers.
        orderBy: { created_at: 'desc' },
      });
      return volunteers;
    } catch (error) {
      // Log the detailed error for debugging purposes while throwing a more user-friendly message.
      console.error('Failed to fetch volunteers:', error);
      throw new Error('Failed to fetch volunteers from the database');
    }
  };

  /**
   * Creates a new volunteer record in the database.
   * This method first validates the input data against the `volunteerSchema` using Zod.
   * If validation is successful, it proceeds to create the record in the database.
   * It also handles specific database constraint errors, like unique email violations.
   *
   * @param {unknown} data - The raw input data from the API request. Using `unknown` forces type-safe parsing.
   * @returns {Promise<Volunteer>} A promise that resolves to the newly created volunteer record.
   * @throws {ValidationError} If the input data fails Zod validation.
   * @throws {Error} For database constraint violations or other unexpected errors.
   */
  createVolunteer = async (data: unknown) => {
    try {
      // Step 1: Validate and parse the input data using the Zod schema.
      // Zod handles both validation and sanitization (trimming, etc.) in one step.
      // If validation fails, Zod throws an error which is caught in the catch block.
      const validatedData = volunteerSchema.parse(data);

      // Step 2: Attempt to create the volunteer record with the validated data.
      const volunteer = await prisma.volunteers.create({
        data: validatedData,
      });

      return volunteer;
    } catch (error) {
      // Step 3: Provide comprehensive error handling for different failure scenarios.

      // Handle Zod validation errors by converting them into our custom ValidationError.
      if (error instanceof ZodError) {
        // We can format a user-friendly error message from Zod's detailed error object.
        const formattedErrors = error.issues
          .map((e: core.$ZodIssue) => e.message)
          .join(', ');
        throw new ValidationError(`Validation failed: ${formattedErrors}`);
      }

      // Handle Prisma-specific database errors for more specific feedback.
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            // Unique constraint violation (e.g., duplicate email).
            throw new Error('A volunteer with this email already exists');
          case 'P2003':
            // Foreign key constraint violation (e.g., invalid university_id).
            throw new Error(
              'Invalid university_id provided - the specified university does not exist'
            );
          default:
            // For other known database errors, log the details but provide a generic message.
            console.error('Prisma error creating volunteer:', error);
            throw new Error(
              'A database error occurred while creating the volunteer'
            );
        }
      }

      // Handle any other unexpected errors.
      console.error('Unexpected error creating volunteer:', error);
      throw new Error(
        'An unexpected error occurred while creating the volunteer'
      );
    }
  };

  /**
   * Retrieves a single volunteer by their unique ID.
   * Validates the ID format before querying the database and handles not-found scenarios.
   *
   * @param {string} id - The UUID of the volunteer to retrieve.
   * @returns {Promise<Volunteer>} A promise that resolves to the volunteer record if found.
   * @throws {ValidationError} If the provided ID is not a valid UUID.
   * @throws {Error} If no volunteer is found with the given ID, or if a database error occurs.
   */
  getVolunteerById = async (id: string) => {
    try {
      // Step 1: Validate the ID format before sending a query to the database.
      // This prevents invalid queries and provides a clear error message for bad requests.
      VolunteerValidator.validateId(id);

      // Step 2: Query the database for the specific volunteer.
      const volunteer = await prisma.volunteers.findUnique({
        where: { volunteer_id: id },
      });

      // Step 3: Handle the "not found" case explicitly for a clear API response.
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      return volunteer;
    } catch (error) {
      // Step 4: Handle different types of errors that may occur.

      // Re-throw validation or "not found" errors directly as they are intentional and have clear messages.
      if (
        error instanceof ValidationError ||
        (error instanceof Error && error.message === 'Volunteer not found')
      ) {
        throw error;
      }

      // Handle any unexpected database or system errors.
      console.error(
        `Unexpected error fetching volunteer with ID ${id}:`,
        error
      );
      throw new Error(
        'An unexpected error occurred while fetching the volunteer'
      );
    }
  };
}

/**
 * Export a singleton instance of VolunteerService.
 * This pattern ensures that a single, consistent instance of the service is used
 * throughout the application, simplifying state management and dependency injection.
 */
export const volunteerService = new VolunteerService();
