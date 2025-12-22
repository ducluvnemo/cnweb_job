import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    createCV,
    getMyCVs,
    getCVById,
    updateCV,
    deleteCV
} from "../controller/cv.controller.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createCV);
router.route("/my-cvs").get(isAuthenticated, getMyCVs);
router.route("/:id").get(isAuthenticated, getCVById);
router.route("/:id/update").put(isAuthenticated, updateCV);
router.route("/:id/delete").delete(isAuthenticated, deleteCV);

export default router;