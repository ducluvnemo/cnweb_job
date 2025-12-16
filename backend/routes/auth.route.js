import { Router } from "express";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/user.model.js";
import { verifyToken } from "../middleware/verifyToken.js";
import jwt from "jsonwebtoken";
const router = Router();

// Bắt đầu OAuth Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google`,
    session: true,
  }),
  async (req, res) => {
    console.log("User after Google auth:", req.user);
    let user = await User.findOne({ email: req.user.email });
    if (!user) {
      user = new User({
        fullName: req.user.name,
        email: req.user.email,
        role: "student",
        // thêm profile với profilePhoto từ Google
        profile: {
          profilePhoto: req.user.avatar || "",
        },
        // nếu có các trường provider
        // provider: req.user.provider,
        // providerId: req.user.providerId,
      });
      await user.save();
      console.log("Created new user from Google OAuth:", user);
    } else {
      // đảm bảo có profile object và profilePhoto
      user.profile = user.profile || {};
      if (!user.profile.profilePhoto && req.user.avatar) {
        user.profile.profilePhoto = req.user.avatar;
      }
      await user.save();
      console.log("Existing user found for Google OAuth:", user);
    }
    req.login(user, (err) => {
      if (err)
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google`);

      // tạo JWT giống luồng login thường
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax", // dùng "none" + secure: true nếu khác domain + HTTPS
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });

      // redirect về FE
      res.redirect(`${process.env.CLIENT_URL}/login?oauth=google`);
    });
  }
);

// Bắt đầu OAuth GitHub
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=github`,
    session: true,
  }),
  async (req, res) => {
    // phát hành JWT giống Google để dùng các API protected
    const token = jwt.sign({ userId: req.user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.CLIENT_URL}/login?oauth=github`);
  }
);

// Lấy thông tin user hiện tại (đã đăng nhập)
router.get("/me", verifyToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthenticated" });

  const dbUser = req.user;
  const safeUser = {
    _id: dbUser._id,
    fullName: dbUser.fullName,
    email: dbUser.email,
    phoneNumber: dbUser.phoneNumber,
    role: dbUser.role,
    profile: dbUser.profile || { profilePhoto: "" },
  };
  return res.json({ user: safeUser, success: true });
});

// Đăng xuất
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
  });
});

export default router;
