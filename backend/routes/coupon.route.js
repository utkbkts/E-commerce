import express from "express";
import couponController from "../controllers/coupon.controller.js";
import {
  authhorizeRoles,
  isAuthenticatedUser,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", isAuthenticatedUser, couponController.getCoupon);
router.post("/validate", isAuthenticatedUser, couponController.validateCoupon);

export default router;
