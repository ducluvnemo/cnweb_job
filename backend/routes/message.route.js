import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { sendMessage, getMessages, getConversations } from "../controller/message.controller.js";

const router = express.Router();

router.route('/send/:receiverId').post(isAuthenticated, sendMessage);
router.route('/get/:userId').get(isAuthenticated, getMessages);
router.route('/conversations').get(isAuthenticated, getConversations);

export default router;
