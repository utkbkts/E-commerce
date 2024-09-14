import { redis } from "../lib/redis.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import jwt from "jsonwebtoken";

const SignUp = catchAsyncError(async (req, res, next) => {
  const { email, password, name } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new ErrorHandler("user already exists", 400));
  }

  const user = await User.create({ name, email, password });

  sendToken(user, 201, res);
});

const Login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("password does not match", 401));
  }

  sendToken(user, 201, res);
});

const Logout = catchAsyncError(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new ErrorHandler("Refresh token not provided", 401));
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  await redis.del(`refresh_token${decoded.id}`);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});
export default { SignUp, Login, Logout };
