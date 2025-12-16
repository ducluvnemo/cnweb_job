import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/user.model.js";
// Mô phỏng model User, thay bằng model thực tế của bạn
// Ví dụ: import User from "../models/user.model.js";

passport.serializeUser((user, done) => {
  done(null, user.id || user._id || user.providerId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user =
      (await User.findById(id)) || (await User.findOne({ providerId: id }));
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // callbackURL: `${process.env.OAUTH_CALLBACK_URL}/google/callback`,
      callbackURL: `http://localhost:3000/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Tìm hoặc tạo user trong DB từ profile
      // const user = await upsertOAuthUser("google", profile);
      const user = {
        provider: "google",
        providerId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
      };
      return done(null, user);
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `/api/v1/auth/github/callback`,
      scope: ["user:email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `${profile.username}@users.noreply.github.com`;
        const avatar = profile.photos?.[0]?.value;

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            fullName: profile.displayName || profile.username,
            email,
            role: "student",
            profile: { profilePhoto: avatar || "" },
          });
        } else {
          user.profile = user.profile || {};
          if (!user.profile.profilePhoto && avatar) {
            user.profile.profilePhoto = avatar;
          }
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
