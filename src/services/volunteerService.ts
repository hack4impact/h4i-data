// Volunteer service layer - business logic for volunteer operations
// This file contains the service layer that sits between API routes/resolvers and the database

import { prisma } from '../config/database';
import { VolunteerInput } from '../types';
import { Prisma } from '@prisma/client';
import { VolunteerValidator, ValidationError } from '../utils/validators';

/**
 * VolunteerService class handles all business logic for volunteer operations.
 * This service layer provides:
 * - Data validation and sanitization
 * - Database operations through Prisma
 * - Error handling and transformation
 * - Business rule enforcement
 * 
 * The service layer pattern separates business logic from API concerns,
 * making the code more testable and maintainable.
 */
export class VolunteerService {
  /**
   * Retrieves all volunteers from the database.
   * Returns volunteers sorted by creation date (newest first).
   * 
   * @returns Promise<Volunteer[]> - Array of all volunteer records
   * @throws Error if database query fails
   */
  getAllVolunteers = async () => {
    try {
      const volunteers = await prisma.volunteers.findMany({
        // Order by creation date descending (newest first)
        // This provides a consistent, predictable ordering
        orderBy: { created_at: 'desc' },
      });
      return volunteers;
    } catch (error) {
      // Log error for debugging while throwing user-friendly message
      console.error('Failed to fetch volunteers:', error);
      throw new Error('Failed to fetch volunteers from database');
    }
  };

  /**
   * Creates a new volunteer record in the database.
   * Handles validation, sanitization, and database constraint errors.
   * 
   * @param data - Raw volunteer input data from API request
   * @returns Promise<Volunteer> - The created volunteer record
   * @throws ValidationError for invalid input data
   * @throws Error for database constraints or unexpected errors
   */
  createVolunteer = async (data: VolunteerInput) => {
    try {
      // Step 1: Clean up input data (trim whitespace, normalize case)
      const sanitizedData = VolunteerValidator.sanitizeVolunteerInput(data);
      
      // Step 2: Validate all fields and business rules
      VolunteerValidator.validateVolunteerInput(sanitizedData);

      // Step 3: Attempt to create the volunteer record
      const volunteer = await prisma.volunteers.create({
        data: sanitizedData,
      });

      return volunteer;
    } catch (error) {
      /**
       * Comprehensive error handling for different error types.
       * This provides meaningful error messages to API consumers.
       */
      
      // Handle Prisma-specific database errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            // Unique constraint violation (likely duplicate email)
            throw new Error('A volunteer with this email already exists');
          case 'P2003':
            // Foreign key constraint violation (invalid university_id)
            throw new Error(
              'Invalid university_id provided - university does not exist'
            );
          default:
            // Other Prisma errors - log details but don't expose internals
            console.error('Prisma error creating volunteer:', error);
            throw new Error('Database error occurred while creating volunteer');
        }
      }

      // Re-throw validation errors unchanged (they have good messages)
      if (error instanceof ValidationError) {
        throw error;
      }

      // Handle any other unexpected errors
      console.error('Unexpected error creating volunteer:', error);
      throw new Error('An unexpected error occurred while creating volunteer');
    }
  };

  /**
   * Retrieves a single volunteer by their unique ID.
   * Validates the ID format and handles not-found scenarios.
   * 
   * @param id - The volunteer UUID to search for
   * @returns Promise<Volunteer> - The volunteer record if found
   * @throws ValidationError if ID format is invalid
   * @throws Error if volunteer not found or database error occurs
   */
  getVolunteerById = async (id: string) => {
    try {
      // Validate ID format before querying database
      // This prevents invalid queries and provides better error messages
      VolunteerValidator.validateId(id);

      // Query for the specific volunteer
      const volunteer = await prisma.volunteers.findUnique({
        where: { volunteer_id: id },
      });

      // Handle not found case explicitly
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      return volunteer;
    } catch (error) {
      /**
       * Error handling with specific cases for different error types.
       */
      
      // Re-throw validation errors unchanged (ID format issues)
      if (error instanceof ValidationError) {
        throw error;
      }

      // Re-throw "not found" errors unchanged (expected business case)
      if (error instanceof Error && error.message === 'Volunteer not found') {
        throw error;
      }

      // Handle any unexpected database or system errors
      console.error('Unexpected error fetching volunteer:', error);
      throw new Error('An unexpected error occurred while fetching volunteer');
    }
  };
}

/**
 * Export a singleton instance of VolunteerService.
 * This pattern ensures:
 * - Single instance across the application
 * - Easy dependency injection for testing
 * - Consistent behavior across different API endpoints
 */
export const volunteerService = new VolunteerService();
