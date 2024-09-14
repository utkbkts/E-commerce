import { redis } from "../lib/redis.js";

export default (user, statusCode, res) => {
  const refreshToken = user.RefreshToken();
  const accessToken = user.AccessToken();
  redis.set(`refresh_token${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

  const setCookies = () => {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  };

  setCookies();

  res.status(statusCode).json({
    accessToken,
  });
};
