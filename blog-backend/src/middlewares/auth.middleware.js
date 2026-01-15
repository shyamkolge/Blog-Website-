import jwt from "jsonwebtoken";
import { promisify } from "util";
import {userModel} from '../models/user.model.js';
import {ApiError, asyncHandler} from '../utils/index.js'

const isLoggedIn = asyncHandler(async (req, res, next) => {
  
  const accessToken = req.cookies?.token;

  if (!accessToken) return next(new ApiError(401, "You are not logged in"));

  try {
    const result = await promisify(jwt.verify)(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    
    if (!result) {
      return next(new ApiError(401, "Invalid Access Token"));
    }

    const user = await userModel.findById(result._id);
    if (!user) {
      return next(new ApiError(401, "User not found with the token"));
    }
    
    if (user.isPasswordChangedAfterJWT(result.iat)) {
      return next(new ApiError(401, "User recently changed password"));
    }

    req.user = user;

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, "Token has expired. Please login again"));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, "Invalid token. Please login again"));
    }
    if (error.name === 'NotBeforeError') {
      return next(new ApiError(401, "Token not yet valid"));
    }
    
    // For any other errors
    console.log("Error in isLoggedIn middleware:", error);
    return next(new ApiError(401, "Authentication failed"));
  }
});

export default isLoggedIn;
