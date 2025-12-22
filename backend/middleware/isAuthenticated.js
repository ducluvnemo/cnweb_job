import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    req.user = user;
    req.id = user._id;

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
};

export default isAuthenticated;
