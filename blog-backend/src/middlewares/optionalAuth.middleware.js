import jwt from "jsonwebtoken";
import { promisify } from "util";
import {userModel} from '../models/user.model.js';

// Optional authentication - doesn't throw error if not logged in
const optionalAuth = async (req, res, next) => {
  const accessToken = req.cookies?.token;

  if (!accessToken) {
    req.user = null;
    return next();
  }

  try {
    const result = await promisify(jwt.verify)(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    
    if (result) {
      const user = await userModel.findById(result._id);
      if (user && !user.isPasswordChangedAfterJWT(result.iat)) {
        req.user = user;
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }
  
  next();
};

export default optionalAuth;

