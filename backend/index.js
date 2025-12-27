import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import database from "./utils/database.js";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import http from "http";
import { Server } from "socket.io";

import session from "express-session";
import passport from "passport";
import "./utils/passport.js";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import laterJobRoute from "./routes/laterJob.route.js";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import { setIO } from "./controller/message.controller.js";
import cvRoute from "./routes/cv.route.js";
import adminRoute from "./routes/admin.route.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

const port = process.env.PORT || 3000;

database.connect();

// ===== Middleware (đặt trước routes) =====
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true nếu dùng HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// ===== Routes (đặt sau middleware) =====
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/laterJob", laterJobRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/cv", cvRoute);

// Initialize Socket.io for message controller
setIO(io);

// ===== Socket.io handlers =====
const userSockets = new Map(); // Map of userId -> socketId

io.on("connection", (socket) => {
  //console.log("New user connected:", socket.id);

  // Lưu user ID khi user join
  socket.on("join", (userId) => {
    userSockets.set(userId, socket.id);
    //console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Xử lý gửi tin nhắn real-time
  socket.on("send_message", async (data) => {
    try {
      const { receiverId, content, senderId, message } = data;
      
      // Tìm socket của receiver
      const receiverSocketId = userSockets.get(receiverId);
      
      // Gửi tin nhắn đến receiver nếu online
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
      
      // Gửi message lại cho sender để cập nhật UI
      socket.emit("message_sent", message);
    } catch (error) {
      console.error("Error in send_message:", error);
      socket.emit("error", { message: "Error sending message" });
    }
  });

  // Xử lý disconnect
  socket.on("disconnect", () => {
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        //console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});