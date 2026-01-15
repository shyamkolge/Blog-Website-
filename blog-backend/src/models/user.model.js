import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    profilePhoto: {
      type: String,
    },

    firstName: {
      type: String,
      required: function() {
        return !this.googleId; // Required only if not using Google OAuth
      },
    },

    lastName: {
      type: String,
      required: function() {
        return !this.googleId; // Required only if not using Google OAuth
      },
    },

    age: {
      type: Number,
      required: function() {
        return !this.googleId; // Required only if not using Google OAuth
      },
    },
    
    roles: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    
    username: {
      type: String,
      required: function() {
        return !this.googleId; // Required only if not using Google OAuth
      },
      unique: true,
      sparse: true, // Allows multiple null values
      lowercase: true,
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Email is required.."],
      lowercase: true,
    },

    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password required only if not using Google OAuth
      },
      minlength: 6,
    },

    googleId: {
      type: String,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null values
      unique: true,
    },

    bookmarkedBlogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
      }
    ],

    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false, // Don't include in queries by default
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

// For deleting the user
userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
});

// Hash the password before the user is saved (only if password exists)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// `passwordChangedAt` will be updated only when the password is changed
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

// Check if the password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Check if the password is changed after the JWT is issued
userSchema.methods.isPasswordChangedAfterJWT = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChange = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < passwordChange;
  }

  return false;
};


userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Generate Access Token (short-lived)
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

// Generate Refresh Token (long-lived)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

export const userModel = mongoose.model("user", userSchema);
