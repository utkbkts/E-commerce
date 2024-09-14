import express from "express";
import cartController from "../controllers/cart.controller.js";
import {
  authhorizeRoles,
  isAuthenticatedUser,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", isAuthenticatedUser, cartController.getCartProducts);
router.post("/", isAuthenticatedUser, cartController.AddToCart);
router.delete("/", isAuthenticatedUser, cartController.removeFromAllCart);
router.put("/:id", isAuthenticatedUser, cartController.updateQuantity);

export default router;
