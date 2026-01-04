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
      required: [true, "First name is required"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    
    roles: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
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
      required: [true, "Password is required"],
      minlength: 6,
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

// Hash the password before the user is saved
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

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

// Generate Access Token
userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

export const userModel = mongoose.model("user", userSchema);
