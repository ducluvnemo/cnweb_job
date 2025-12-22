import express from "express";
import {
  deleteCompany,
  getCompany,
  getCompanyById,
  registerCompany,
  updateCompany,
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  deleteCompanyByAdmin,
} from "../controller/company.controller.js";

import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

// recruiter
router.post("/register", isAuthenticated, registerCompany);
router.get("/get", isAuthenticated, getCompany);
router.get("/get/:id", isAuthenticated, getCompanyById);
router.patch("/update/:id", isAuthenticated, singleUpload, updateCompany);
router.delete("/deleteCompany", isAuthenticated, deleteCompany);

// admin
router.get("/admin/pending", isAuthenticated, isAdmin, getPendingCompanies);
router.put("/admin/:id/approve", isAuthenticated, isAdmin, approveCompany);
router.put("/admin/:id/reject", isAuthenticated, isAdmin, rejectCompany);
router.delete("/admin/:id", isAuthenticated, isAdmin, deleteCompanyByAdmin);

export default router;
