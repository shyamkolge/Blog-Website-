import { Router } from 'express';
import { loginUser, resetPassword, signUpUser, logout, updatePassword, forgotPassword  } from '../controllers/auth.controller.js';
import {loginSchema, forgotPasswordSchema, signupSchema, updatePasswordSchema, resetPasswordSchema } from '../utils/auth/authValidator.js'
import { validate } from '../middlewares/inputValidate.js';
import isLoggedIn from '../middlewares/auth.middleware.js';

const router = Router();

// Login and sign up
router.post("/login", validate(loginSchema), loginUser);
router.post("/sign-up", validate(signupSchema), signUpUser);
router.get("/log-out", logout);

// Update Password
router.patch(
  "/update-password",
  isLoggedIn,
  validate(updatePasswordSchema),
  updatePassword
);

// Forgot Password
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.patch(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword
);

export default router;



