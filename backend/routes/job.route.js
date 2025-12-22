import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  postJob,
  getAllJobs,
  getJobById,
  getJobByIdAdmin,
  getAdminJobs,
  getAllJobsForAdmin,
  EditJob,
  deleteJob,
  getJobPositions,
  getJobLocations,
  getPendingJobsForAdmin,
  approveJob,
  rejectJob,
} from "../controller/job.controller.js";

const router = express.Router();

// recruiter / user
router.post("/post", isAuthenticated, postJob);
router.get("/get", getAllJobs);
router.get("/get/:id", getJobById);

// recruiter self
router.get("/getAdmin/:id", isAuthenticated, getJobByIdAdmin);
router.get("/getAdminJob", isAuthenticated, getAdminJobs);
router.get("/getAllJobsForAdmin", isAuthenticated, isAdmin, getAllJobsForAdmin);
router.patch("/updateJob/:id", isAuthenticated, EditJob);
router.delete("/deleteJob", isAuthenticated, deleteJob);

// filters
router.get("/filters/positions", getJobPositions);
router.get("/filters/locations", getJobLocations);

// admin job approval
router.get(
  "/admin/pending",
  isAuthenticated,
  isAdmin,
  getPendingJobsForAdmin
);
router.put(
  "/admin/:id/approve",
  isAuthenticated,
  isAdmin,
  approveJob
);
router.put(
  "/admin/:id/reject",
  isAuthenticated,
  isAdmin,
  rejectJob
);

export default router;