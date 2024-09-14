import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", authController.SignUp);
router.post("/login", authController.Login);
router.post("/logout", authController.Logout);

export default router;
