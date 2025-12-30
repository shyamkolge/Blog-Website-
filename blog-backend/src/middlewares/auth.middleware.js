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
    console.log("Error in isLoggedIn middleware : ", error);
  }
});

export default isLoggedIn;
