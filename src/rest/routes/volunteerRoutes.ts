// REST API routes for volunteer operations
// This file defines HTTP endpoints for volunteer CRUD operations

import { Router, Request, Response } from 'express';
import { volunteerService } from '../../services';
import { asyncHandler } from '../middleware';

// Create Express router for volunteer-related endpoints
const router = Router();

/**
 * GET /api/volunteers - Retrieve all volunteers
 * 
 * Returns a list of all volunteer records in the database.
 * Response format: { success: true, data: Volunteer[] }
 * 
 * HTTP Status Codes:
 * - 200: Success, returns volunteer array (may be empty)
 * - 500: Server error (handled by error middleware)
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const volunteers = await volunteerService.getAllVolunteers();
    res.json({ success: true, data: volunteers });
  })
);

/**
 * GET /api/volunteers/:id - Retrieve single volunteer by ID
 * 
 * Returns a specific volunteer record matching the provided ID.
 * Response format: { success: true, data: Volunteer | null }
 * 
 * HTTP Status Codes:
 * - 200: Success, returns volunteer data or null if not found
 * - 400: Bad request (invalid ID format)
 * - 404: Not found (handled by service layer)
 * - 500: Server error (handled by error middleware)
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const volunteer = await volunteerService.getVolunteerById(req.params.id);
    res.json({ success: true, data: volunteer });
  })
);

/**
 * POST /api/volunteers - Create new volunteer record
 * 
 * Creates a new volunteer with the provided data in request body.
 * Request body should match VolunteerInput type (validated in service layer).
 * Response format: { success: true, data: Volunteer }
 * 
 * HTTP Status Codes:
 * - 201: Created successfully, returns new volunteer data
 * - 400: Bad request (validation errors)
 * - 409: Conflict (duplicate email or similar)
 * - 500: Server error (handled by error middleware)
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const volunteer = await volunteerService.createVolunteer(req.body);
    res.status(201).json({ success: true, data: volunteer });
  })
);

// Export router with a descriptive name for importing
export { router as volunteerRoutes };
