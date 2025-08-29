import { Router } from "express";
import { volunteerRoutes } from "./volunteerRoutes";

const router = Router();

// Mount feature routes
router.use("/volunteers", volunteerRoutes);

// Health check for REST API
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "REST API",
    timestamp: new Date().toISOString(),
  });
});

export { router as apiRoutes };
