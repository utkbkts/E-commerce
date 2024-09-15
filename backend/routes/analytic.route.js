import express from "express";
import {
  authhorizeRoles,
  isAuthenticatedUser,
} from "../middleware/auth.middleware.js";
import analyticController from "../controllers/analytic.controller.js";

const router = express.Router();

router.get(
  "/",
  isAuthenticatedUser,
  authhorizeRoles("admin"),
  analyticController.getSales
);

export default router;
