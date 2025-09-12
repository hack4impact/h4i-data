import { Request, Response } from 'express';
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  createLocationSchema,
  updateLocationSchema,
} from '../../../core';

export const locationController = {
  getAllLocations: async (_req: Request, res: Response) => {
    try {
      const locations = await getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve locations',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  getLocationById: async (req: Request, res: Response) => {
    try {
      const location = await getLocationById(req.params.id);
      if (location) {
        res.json(location);
      } else {
        res.status(404).json({ error: 'Location not found' });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve location',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  createLocation: async (req: Request, res: Response) => {
    try {
      const validatedData = createLocationSchema.parse(req.body);
      const newLocation = await createLocation(validatedData);
      res.status(201).json(newLocation);
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({
          error: 'Invalid data',
          details: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Failed to create location',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  },

  updateLocation: async (req: Request, res: Response) => {
    try {
      const validatedData = updateLocationSchema.parse(req.body);
      const updatedLocation = await updateLocation(
        req.params.id,
        validatedData
      );
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({
          error: 'Invalid data',
          details: error.message,
        });
      } else if (
        error instanceof Error &&
        error.message.includes('not found')
      ) {
        res.status(404).json({ error: 'Location not found' });
      } else {
        res.status(500).json({
          error: 'Failed to update location',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  },

  deleteLocation: async (req: Request, res: Response) => {
    try {
      await deleteLocation(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: 'Location not found' });
      } else {
        res.status(500).json({
          error: 'Failed to delete location',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  },
};
