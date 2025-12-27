import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import allowRoles from "../middleware/allowRoles.js";
import { sendMessage, getMessages, getConversations } from "../controller/message.controller.js";

const router = express.Router();

// chỉ student + recruiter được chat
const CHAT_ROLES = ["student", "recruiter"];

router
  .route("/send/:receiverId")
  .post(isAuthenticated, allowRoles(...CHAT_ROLES), sendMessage);

router
  .route("/get/:userId")
  .get(isAuthenticated, allowRoles(...CHAT_ROLES), getMessages);

router
  .route("/conversations")
  .get(isAuthenticated, allowRoles(...CHAT_ROLES), getConversations);

export default router;