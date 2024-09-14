import express from "express";
import productController from "../controllers/product.controller.js";
import {
  authhorizeRoles,
  isAuthenticatedUser,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/featured", productController.getFeaturedProducts);
router.get("/recommendations", productController.getRecommendations);
router.get("/category/:category", productController.getProductsByCategory);

//admin
router.get(
  "/admin/getAll",
  isAuthenticatedUser,
  authhorizeRoles("admin"),
  productController.getAdminProducts
);

router.put(
  "/admin/:id",
  isAuthenticatedUser,
  authhorizeRoles("admin"),
  productController.toggleFeaturedProducts
);

router.post(
  "/admin/create",
  isAuthenticatedUser,
  productController.createProduct
);
router.delete("/:id", isAuthenticatedUser, productController.deleteProduct);
export default router;
