import { Router } from "express";
import { volunteerService } from "../../services";
import { VolunteerInput, VolunteerUpdateInput } from "../../types";

const router = Router();

// GET /api/volunteers - Get all volunteers
router.get("/", async (req, res) => {
  try {
    const volunteers = await volunteerService.getAllVolunteers();
    res.json({
      success: true,
      data: volunteers,
      count: volunteers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch volunteers",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/volunteers/:id - Get volunteer by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await volunteerService.getVolunteerById(id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: "Volunteer not found",
      });
    }

    res.json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch volunteer",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/volunteers - Create new volunteer
router.post("/", async (req, res) => {
  try {
    const volunteerData: VolunteerInput = req.body;

    // Basic validation
    if (
      !volunteerData.first_name ||
      !volunteerData.last_name ||
      !volunteerData.email
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: first_name, last_name, email",
      });
    }

    const result = await volunteerService.createVolunteer(volunteerData);
    res.status(201).json({
      success: true,
      message: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create volunteer",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PUT /api/volunteers/:id - Update volunteer
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: VolunteerUpdateInput = req.body;

    const result = await volunteerService.updateVolunteer(id, updateData);
    res.json({
      success: true,
      message: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update volunteer",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// DELETE /api/volunteers/:id - Delete volunteer
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await volunteerService.deleteVolunteer(id);
    res.json({
      success: true,
      message: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete volunteer",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/volunteers/filter/status/:status - Get volunteers by status
router.get("/filter/status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const volunteers = await volunteerService.getVolunteersByStatus(status);
    res.json({
      success: true,
      data: volunteers,
      count: volunteers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch volunteers by status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/volunteers/filter/type/:type - Get volunteers by type
router.get("/filter/type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const volunteers = await volunteerService.getVolunteersByType(type);
    res.json({
      success: true,
      data: volunteers,
      count: volunteers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch volunteers by type",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as volunteerRoutes };
