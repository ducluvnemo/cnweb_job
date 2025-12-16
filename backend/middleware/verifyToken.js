import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.split(" ")[1];
    const token = req.cookies?.token || bearer;
    if (!token) return next(); // cho phép fallback sang session

    const payload = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(payload.userId);
    if (user) req.user = user;
    next();
  } catch (_) {
    next();
  }
};
