import Coupon from '../models/Coupon.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../config/constants.js';

/**
 * Validate and calculate coupon discount
 */
export const applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !subtotal || subtotal <= 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Coupon code and a valid order subtotal are required.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    const cleanCode = String(code).trim().toUpperCase();

    const coupon = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Invalid or expired promo code.',
        errorCode: ERROR_CODES.COUPON_INVALID
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'This promo code has reached its maximum redemption limit.',
        errorCode: ERROR_CODES.COUPON_INVALID
      });
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return errorResponse(res, {
        statusCode: 400,
        message: `This coupon requires a minimum cart value of ₹${coupon.minOrderValue}.`,
        errorCode: ERROR_CODES.COUPON_INVALID
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'fixed') {
      discount = Math.min(subtotal, coupon.discountValue);
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discount}`,
      data: {
        code: coupon.code,
        discount,
        newTotal: Math.max(0, subtotal - discount)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get active promo offers
 */
export const getActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).select('code description discountType discountValue minOrderValue maxDiscount validUntil');

    return successResponse(res, {
      statusCode: 200,
      message: 'Active coupons fetched successfully',
      data: { coupons }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create coupon
 */
export const createCoupon = async (req, res, next) => {
  try {
    const couponData = req.body;
    couponData.code = String(couponData.code).trim().toUpperCase();

    const existing = await Coupon.findOne({ code: couponData.code });
    if (existing) {
      return errorResponse(res, {
        statusCode: 409,
        message: `Coupon "${couponData.code}" already exists.`,
        errorCode: ERROR_CODES.DUPLICATE_ENTRY
      });
    }

    const coupon = await Coupon.create(couponData);

    return successResponse(res, {
      statusCode: 201,
      message: 'Coupon created successfully',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};
