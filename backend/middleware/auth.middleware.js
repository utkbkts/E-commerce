import User from "../models/user.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
import jwt from "jsonwebtoken";
export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { jwtToken } = req.cookies;

  if (!jwtToken) {
    return next(new ErrorHandler("Login first to access this resource", 401));
  }
  const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

export const authhorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role (${req.user.role}) access this resource`, 403)
      );
    }
    next();
  };
};
