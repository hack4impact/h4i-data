// GraphQL resolvers for volunteer operations
// Resolvers are functions that fetch/modify data for each field in the GraphQL schema

import { volunteerService } from '../../services';
import { VolunteerInput } from '../../types';

/**
 * GraphQL resolvers that connect schema fields to actual data operations.
 * Each resolver function:
 * - Receives arguments from the GraphQL query
 * - Calls the appropriate service layer function
 * - Returns data in the format expected by the schema
 * 
 * This follows the pattern: GraphQL -> Resolvers -> Services -> Database
 */
export const volunteerResolvers = {
  /**
   * Query resolvers handle read operations (fetching data)
   */
  Query: {
    /**
     * Resolver for 'volunteers' query - returns all volunteers
     * GraphQL query: { volunteers { volunteer_id, first_name, ... } }
     * 
     * @returns Promise<Volunteer[]> - Array of all volunteer records
     */
    volunteers: async () => {
      return await volunteerService.getAllVolunteers();
    },

    /**
     * Resolver for 'volunteer' query - returns single volunteer by ID
     * GraphQL query: { volunteer(id: "123") { first_name, last_name, ... } }
     * 
     * @param _ - Root object (unused in top-level resolvers)
     * @param args - Query arguments containing the volunteer ID
     * @returns Promise<Volunteer | null> - Single volunteer or null if not found
     */
    volunteer: async (_: unknown, { id }: { id: string }) => {
      return await volunteerService.getVolunteerById(id);
    },
  },

  /**
   * Mutation resolvers handle write operations (creating/updating/deleting data)
   */
  Mutation: {
    /**
     * Resolver for 'createVolunteer' mutation - creates new volunteer record
     * GraphQL mutation: mutation { createVolunteer(input: { ... }) { volunteer_id, ... } }
     * 
     * @param _ - Root object (unused in top-level resolvers)  
     * @param args - Mutation arguments containing volunteer input data
     * @returns Promise<Volunteer> - The newly created volunteer record
     */
    createVolunteer: async (
      _: unknown,
      { input }: { input: VolunteerInput }
    ) => {
      return await volunteerService.createVolunteer(input);
    },
  },
};
