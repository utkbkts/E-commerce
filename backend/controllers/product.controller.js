import { redis } from "../lib/redis.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import Product from "../models/product.model.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";

const createProduct = catchAsyncError(async (req, res, next) => {
  let cloudinaryResponse = null;

  if (req.body.image) {
    cloudinaryResponse = await upload_file(req.body.image, "commerce");
  }

  const product = await Product.create({
    ...req.body,
    image: cloudinaryResponse?.url ? cloudinaryResponse.url : "",
    user: req.user._id,
  });
  res.status(200).json({ product });
});

const getFeaturedProducts = catchAsyncError(async (req, res, next) => {
  let featuredProducts = await redis.get("featured_products");
  if (featuredProducts) {
    return res.json(JSON.parse(featuredProducts));
  }
  featuredProducts = await Product.find({ isFeatured: true }).lean();

  if (!featuredProducts || featuredProducts.length === 0) {
    return next(new ErrorHandler("no featured products found", 401));
  }
  await redis.set("featured_products", JSON.stringify(featuredProducts));
  res.status(200).json({
    featuredProducts,
  });
});

const getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    products,
  });
});
//ürün öneri sistemi
const getRecommendations = catchAsyncError(async (req, res) => {
  const products = await Product.aggregate([
    {
      $sample: { size: 3 },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        image: 1,
        price: 1,
      },
    },
  ]);
  res.json(products);
});

const getProductsByCategory = catchAsyncError(async (req, res) => {
  const { category } = req.params;

  const products = await Product.find({ category });
  res.json({ products });
});

const toggleFeaturedProducts = catchAsyncError(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();
    updateFeaturedProductsCache();
    res.json(updatedProduct);
  } else {
    return next(new ErrorHandler({ message: "Product not found" }));
  }
});
const updateFeaturedProductsCache = catchAsyncError(async (req, res) => {
  const featuredProducts = await Product.find({ isFeatured: true }).lean();
  await redis.set("featured_products", JSON.stringify(featuredProducts));
});

const deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("product is not found", 401));
  }
  if (product.image) {
    const publicId = product.image.split("/").pop().split(".")[0];
    await delete_file(`commerce/${publicId}`);
  }
  await redis.del("featured_products");
  await product.deleteOne();
  return res.status(200).json({
    message: "delete success",
  });
});
export default {
  getAdminProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendations,
  getProductsByCategory,
  toggleFeaturedProducts,
};
