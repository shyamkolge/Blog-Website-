import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userModel } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL ,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with this email
        user = await userModel.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          if (!user.profilePhoto && profile.photos && profile.photos[0]) {
            user.profilePhoto = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user from Google profile
        const nameParts = profile.displayName.split(" ");
        const firstName = nameParts[0] || profile.name?.givenName || "User";
        const lastName = nameParts.slice(1).join(" ") || profile.name?.familyName || "";

        user = await userModel.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: firstName,
          lastName: lastName,
          username: profile.emails[0].value.split("@")[0] + "_" + profile.id.slice(0, 6), // Generate unique username
          profilePhoto: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
          age: 18, // Default age for OAuth users
          roles: "user",
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session (needed for OAuth flow)
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id).select("-password");
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

