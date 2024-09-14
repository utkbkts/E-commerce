import catchAsyncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/product.model.js";

const AddToCart = catchAsyncError(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  const existingItem = user.cartItems.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    user.cartItems.push(productId);
  }
  await user.save();
  res.json(user.cartItems);
});

const getCartProducts = catchAsyncError(async (req, res) => {
  const cartItemIds = req.user.cartItems.map((item) => item.id);
  const products = await Product.find({ _id: { $in: cartItemIds } });

  const cartItems = products.map((product) => {
    const quantity =
      req.user.cartItems.find((item) => item.id === product._id.toString())
        ?.quantity || 0;
    return { ...product.toJSON(), quantity };
  });

  res.json(cartItems);
});

const removeFromAllCart = catchAsyncError(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!productId) {
    user.cartItems = [];
  } else {
    user.cartItems = user.cartItems.filter((item) => item.id !== productId);
  }
  await user.save();
  res.json(user.cartItems);
});

const updateQuantity = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const user = req.user;

  const existingItem = user.cartItems.find((item) => item.id === id);

  if (existingItem) {
    if (quantity === 0) {
      user.cartItems = user.cartItems.filter((item) => item.id !== id);
      await user.save();
      return res.json(user.cartItems);
    }
    existingItem.quantity = quantity;
    await user.save();
    res.json(user.cartItems);
  } else {
    return next(new ErrorHandler("product not found", 404));
  }
});

export default {
  AddToCart,
  removeFromAllCart,
  updateQuantity,
  getCartProducts,
};
