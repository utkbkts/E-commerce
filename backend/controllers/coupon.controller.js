import catchAsyncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Coupon from "../models/coupon.model.js";

const getCoupon = catchAsyncError(async (req, res) => {
  const coupon = await Coupon.findOne({ user: req.user._id, isActive: true });

  res.json(coupon || null);
});

const validateCoupon = catchAsyncError(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({
    code: code,
    user: req.user._id,
    isActive: true,
  });

  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }
  if (coupon.expirationDate < new Date()) {
    coupon.isActive = false;
    await coupon.save();
    return next(new ErrorHandler("Coupon expired", 404));
  }
  res.json({
    message: "Coupon is valid",
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
  });
});

export default { getCoupon, validateCoupon };
