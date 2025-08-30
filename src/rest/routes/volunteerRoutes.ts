import { Router } from 'express';
import { volunteerService } from '../../services';
import { asyncHandler } from '../middleware';

const router = Router();

// new rest route template
// router.get('/new-endpoint/:param', async (req, res) => {
//   try {
//     const result = await volunteerService.newFunction(req.params.param);
//     res.json({ success: true, data: result });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// GET /api/volunteers
router.get(
  '/',
  asyncHandler(async (req: any, res: any) => {
    const volunteers = await volunteerService.getAllVolunteers();
    res.json({ success: true, data: volunteers });
  })
);

// POST /api/volunteers
router.post(
  '/',
  asyncHandler(async (req: any, res: any) => {
    const volunteer = await volunteerService.createVolunteer(req.body);
    res.status(201).json({ success: true, data: volunteer });
  })
);

export { router as volunteerRoutes };
