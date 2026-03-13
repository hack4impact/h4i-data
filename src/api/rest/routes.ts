import { Router } from 'express';
import * as featureRoutes from './routes/index';

const router = Router();

// Core Entity Routes
router.use('/chapters', featureRoutes.chapterRoutes);
router.use('/companies', featureRoutes.companyRoutes);
router.use('/constituents', featureRoutes.constituentRoutes);
router.use('/locations', featureRoutes.locationRoutes);
router.use('/partners', featureRoutes.partnerRoutes);
router.use('/projects', featureRoutes.projectRoutes);
router.use('/officer-roles', featureRoutes.officerRoleRoutes);
router.use('/volunteers', featureRoutes.volunteerRoutes);
router.use('/mentors', featureRoutes.mentorRoutes);

// Supporting Entity Routes
router.use('/majors', featureRoutes.majorRoutes);
router.use('/universities', featureRoutes.universityRoutes);
router.use('/academic-terms', featureRoutes.academicTermRoutes);
router.use('/project-roles', featureRoutes.projectRoleRoutes);
router.use('/constituent-links', featureRoutes.constituentLinkRoutes);

// Relation Entity Routes
router.use('/volunteer-history', featureRoutes.volunteerHistoryRoutes);
router.use('/officer-assignments', featureRoutes.officerAssignmentRoutes);
router.use('/mentorships', featureRoutes.mentorshipRoutes);
router.use('/project-deliverables', featureRoutes.projectDeliverableRoutes);
router.use('/project-engagements', featureRoutes.projectEngagementRoutes);
router.use('/project-staffing', featureRoutes.projectStaffingRoutes);

export default router;
