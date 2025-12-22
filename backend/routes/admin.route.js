import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  getAdminDashboard,
  getAdminDashboardDetails,
  getAdminActivity,
  getPendingJobsQuick,
} from "../controller/admin.controller.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, isAdmin, getAdminDashboard);
router.get("/dashboard/details", isAuthenticated, isAdmin, getAdminDashboardDetails);

// NEW
router.get("/activity", isAuthenticated, isAdmin, getAdminActivity);
router.get("/jobs/pending", isAuthenticated, isAdmin, getPendingJobsQuick);

export default router;
