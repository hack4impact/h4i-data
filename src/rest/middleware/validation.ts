import { Request, Response, NextFunction } from 'express';
import { VolunteerStatus, VolunteerType } from '../../types';

export const validateVolunteerInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, graduation_date, volunteer_status, volunteer_type } = req.body;

  // check required fields
  const requiredFields = [
    'first_name',
    'last_name',
    'email',
    'graduation_date',
    'volunteer_status',
    'volunteer_type',
    'university_id',
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  // validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
    });
  }

  // validate volunteer_status
  if (!Object.values(VolunteerStatus).includes(volunteer_status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid volunteer_status. Must be one of: ${Object.values(
        VolunteerStatus
      ).join(', ')}`,
    });
  }

  // validate volunteer_type
  if (!Object.values(VolunteerType).includes(volunteer_type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid volunteer_type. Must be one of: ${Object.values(
        VolunteerType
      ).join(', ')}`,
    });
  }

  // validate graduation_date format
  const graduationDate = new Date(graduation_date);
  if (isNaN(graduationDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid graduation_date format. Use ISO 8601 format (YYYY-MM-DD)',
    });
  }

  // validate graduation date is not in the past (optional business logic)
  const today = new Date();
  if (graduationDate < today) {
    return res.status(400).json({
      success: false,
      error: 'Graduation date cannot be in the past',
    });
  }

  next();
};

export const validateVolunteerUpdateInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, volunteer_status, volunteer_type, graduation_date } = req.body;

  // if email is provided, validate format
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }
  }

  // if volunteer_status is provided, validate it
  if (
    volunteer_status &&
    !Object.values(VolunteerStatus).includes(volunteer_status)
  ) {
    return res.status(400).json({
      success: false,
      error: `Invalid volunteer_status. Must be one of: ${Object.values(
        VolunteerStatus
      ).join(', ')}`,
    });
  }

  // if volunteer_type is provided, validate it
  if (
    volunteer_type &&
    !Object.values(VolunteerType).includes(volunteer_type)
  ) {
    return res.status(400).json({
      success: false,
      error: `Invalid volunteer_type. Must be one of: ${Object.values(
        VolunteerType
      ).join(', ')}`,
    });
  }

  // if graduation_date is provided, validate format
  if (graduation_date) {
    const graduationDateObj = new Date(graduation_date);
    if (isNaN(graduationDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid graduation_date format. Use ISO 8601 format (YYYY-MM-DD)',
      });
    }
  }

  next();
};

export const validateIdParam = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'ID parameter is required',
    });
  }

  // basic UUID validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format. Must be a valid UUID',
    });
  }

  next();
};
