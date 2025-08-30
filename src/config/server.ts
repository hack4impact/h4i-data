// Server configuration management with environment variable validation
// This file centralizes all server configuration and ensures required variables are present

import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
// Must be called before accessing any environment variables
dotenv.config();

/**
 * Type definition for server configuration object.
 * Provides type safety and IntelliSense for configuration properties.
 */
export interface ServerConfig {
  GRAPHQL_PORT: number;      // Port for GraphQL server (default: 3000)
  REST_PORT: number;         // Port for REST API server (default: 3001)
  NODE_ENV: string;          // Environment mode (development/production/test)
  SUPABASE_URL: string;      // Required: Supabase database connection URL
  SEED_DATA: boolean;        // Whether to seed database with test data
}

/**
 * Configuration validator class that ensures all required environment variables
 * are present and provides meaningful error messages for missing configuration.
 * Uses static methods since we only need one configuration instance per app.
 */
class ConfigValidator {
  /**
   * Validates environment variables and returns typed configuration object.
   * Throws detailed error message if any required variables are missing.
   * 
   * @returns ServerConfig - Validated configuration object
   * @throws Error if required environment variables are missing
   */
  static validate(): ServerConfig {
    const errors: string[] = [];

    // List of environment variables that must be present for app to function
    // Currently only SUPABASE_URL is required, others have sensible defaults
    const requiredVars = ['SUPABASE_URL'];
    
    // Check each required variable and collect any missing ones
    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    });

    // If any required variables are missing, throw error with all missing vars
    // This gives developers complete picture of what needs to be configured
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    // Return validated configuration with appropriate type conversions and defaults
    return {
      // Server ports: parse integers with defaults for local development
      GRAPHQL_PORT: parseInt(process.env.GRAPHQL_PORT || '3000', 10),
      REST_PORT: parseInt(process.env.REST_PORT || '3001', 10),
      
      // Environment mode: defaults to development for local work
      NODE_ENV: process.env.NODE_ENV || 'development',
      
      // Database URL: required and validated above, safe to assert non-null
      SUPABASE_URL: process.env.SUPABASE_URL!,
      
      // Feature flag: only true if explicitly set to 'true' (case sensitive)
      SEED_DATA: process.env.SEED_DATA === 'true',
    };
  }
}

// Export validated configuration object that's available throughout the application
// Validation happens at module load time, so errors are caught early in startup
export const config = ConfigValidator.validate();
