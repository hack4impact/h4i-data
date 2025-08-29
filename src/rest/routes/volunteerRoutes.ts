import { Router } from "express";
import { volunteerService } from "../../services";

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
router.get("/", async (req, res) => {
  try {
    const volunteers = await volunteerService.getAllVolunteers(); // ← Same service call!
    res.json({ success: true, data: volunteers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/volunteers
router.post("/", async (req, res) => {
  try {
    const volunteer = await volunteerService.createVolunteer(req.body); // ← Same service call!
    res.status(201).json({ success: true, data: volunteer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export { router as volunteerRoutes };
