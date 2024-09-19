import { redis } from "../lib/redis.js";

export default (user, statusCode, res) => {
  const jwtToken = user.getJwtToken();
  redis.set(`jwtToken${user._id}`, jwtToken, "EX", 7 * 24 * 60 * 60);

  const setCookies = () => {
    res.cookie("jwtToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: new Date(
        Date.now() + process.env.COOKIE_EXPRES_TIME * 24 * 60 * 60 * 1000
      ),
    });
  };

  setCookies();

  res.status(statusCode).json({
    user,
  });
};
