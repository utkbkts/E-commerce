import express from "express";
import paymentController from "../controllers/payment.controller.js";
import {
  authhorizeRoles,
  isAuthenticatedUser,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create-checkout-session",
  isAuthenticatedUser,
  paymentController.createCheckoutSession
);
router.post(
  "/checkout-success",
  isAuthenticatedUser,
  paymentController.checkoutSuccess
);

export default router;
