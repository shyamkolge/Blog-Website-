import Joi from "joi";

// Common password rules
const passwordRules = Joi.string().min(6).required().messages({
  "string.empty": "Password is required",
  "string.min": "Password must be at least 6 characters",
});

// Signup Validator
export const signupSchema = Joi.object({

  profileImage: Joi.any().optional().messages({
    "string.uri": "Profile photo must be a valid URL",
  }),

 firstName: Joi.string().min(2).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
  }),

  lastName: Joi.string().min(2).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 2 characters",
  }),

  age: Joi.number().integer().min(0).optional().messages({
    "number.base": "Age must be a number",
    "number.min": "Age cannot be negative",
  }),

  username: Joi.string().min(3).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Provide a valid email",
    "string.empty": "Email is required",
  }),

  password: passwordRules,
});

// Login Validator
export const loginSchema = Joi.object({
  username : Joi.string().required().messages({
    "string.empty": "Username is required",
  }),
  // email: Joi.string().email().required().messages({
  //   "string.email": "Enter a valid email address",
  //   "string.empty": "Email is required",
  // }),
  password: passwordRules,
});

// Forgot Password
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Enter a valid email",
    "string.empty": "Email is required",
  }),
});

// Reset Password
export const resetPasswordSchema = Joi.object({
  password: passwordRules,
});

// Update Password
export const updatePasswordSchema = Joi.object({
  oldPassword: passwordRules.label("Old Password"),
  newPassword: passwordRules
    .label("New Password")
    .disallow(Joi.ref("oldPassword"))
    .messages({
      "any.invalid": "New password must be different from old password",
    }),
});
