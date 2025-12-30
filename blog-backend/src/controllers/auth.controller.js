import { userModel } from "../models/user.model.js";
import { asyncHandler, ApiResponce, ApiError} from '../utils/index.js'
import crypto from "crypto";
import sendEmail from "../services/emailSender.js"



const createSendToken = async (user, statusCode, message, res) => {

  const token = await user.generateAccessToken();

  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  res.status(statusCode).cookie("token", token, options).json({
    status: "success",
    token,
    message,
    data: user,
  });
};


// Login User
const loginUser = asyncHandler(async (req, res, next) => {
    
  // 1. get the data from the user
  const { username, email, password } = req?.body;

  const userExits = await userModel.findOne({ $or:[{ username }, { email }]});

  // 2. check the user exits with the given credentials
  if (!userExits) {
    return next(new ApiError(404, "Username or password is incorrect..!"));
  }

  // 3. match the password
  const isPasswordCorrect = await userExits.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    return next(new ApiError(400, "Username or password is incorrect..!"));
  }

  // 4. send the jwt
  const user = await userModel.findById(userExits._id).select("-password");

  createSendToken(user, 200, "User logged in successfully..!", res);
});


// Sign Up User
const signUpUser = asyncHandler(async (req, res, next) => {
  // 1. get the data from the user
  const { username, profilePhoto, firstName, lastName, age, email, password } = req.body;

  // 2. check if the user exits
  const existingUser = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(new ApiError(401, "Email or Username is already exists"));
  }

  // 3. create the user
  const roles = req.body?.roles || "user";

  const user = await userModel.create({
    profilePhoto,
    firstName,
    lastName,
    age,
    username: username.toLowerCase(),
    email,
    password,
    roles,
  });

  // 4. select the user without the password
  const userCreated = await userModel.findById(user._id).select("-password");

  if (!userCreated) {
    return next(
      new ApiError(500, "something went wrong while creating a user ")
    );
  }

  // 5. send the jwt
  createSendToken(userCreated, 200, "user signed up successfully", res);
});


// Logout User
const logout = asyncHandler(async (req, res) => {
  res.status(200).clearCookie("token").send("User log out successfully");
});



// Forgot Password
const forgotPassword = asyncHandler(async (req, res, next) => {
  // Get the user by email
  const email = req.body?.email;

  if (!email || !email.includes("@") || email.trim() == " ") {
    return next(new ApiError(400, "Email is required"));
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // generate reset token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it to the user
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/reset-password/${resetToken}`;

  const message = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>Hello ${user.username},</h2>
    <p>We received a request to reset your password. If you did not make this request, you can safely ignore this email.</p>
    <p>Otherwise, click the button below to reset your password:</p>
    <p>
      <a href="${resetURL}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
    </p>
    <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
    <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
    <hr />
    <p style="font-size: 0.9em;">This link will expire in 10 minutes for your security.</p>
  </div>
  `;

  try {
    await sendEmail({
      email,
      subject: "Your password reset token",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email..!",
    });
  } catch (error) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });

    return next(
      new ApiError(
        500,
        "There was an error sending the email. Try again later.!"
      )
    );
  }
});


// rest Password
const resetPassword = asyncHandler(async (req, res, next) => {
  // 1 Get the user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 if token has not expired, and user exists, set the new password
  if (!user) {
    return next(new ApiError(400, "Token is invalid or has expired"));
  }

  // 3 update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4 log the user in, send JWT
  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});



// Update Password
const updatePassword = asyncHandler(async (req, res, next) => {
  // 1) Get the user, and current password from the user.
  const { oldPassword, newPassword } = req.body;

  if (oldPassword === newPassword) {
    return next(
      new ApiError(400, "New password should be different from old password")
    );
  }
  // 2) find the user with given data
  const user = await userModel.findById(req.user._id);
  if (!user) return next(new ApiError(400, "Invalid User"));

  // 4) compare the password
  if (!(await user.isPasswordCorrect(oldPassword)))
    return next(new ApiError(400, "Old password is incorrect..!"));

  // 6) send the new jwt to the user
  // Password updated successfully message
  const message = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>Hello ${user.username},</h2>
  <p>Your password has been updated successfully at ${new Date().toLocaleString(
    "en-IN",
    { timeZone: "Asia/Kolkata" }
  )} </p> 
  </div>`;

  try {
    const token = await user.generateAccessToken();
    // 5) update the password
    user.password = newPassword;
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Password updated successfully",
      message,
    });

    createSendToken(user, 200, "User Password updated successfully", res);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "There was an error sending the email. Try again later.!"
      )
    );
  }
});

export {
  signUpUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
};
