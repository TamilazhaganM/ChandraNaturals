import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES, PAYMENT_STATUS } from '../config/constants.js';

/**
 * Get all reviews for a product (Public)
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      $or: [{ _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }, { slug: productId }]
    });

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });

    return successResponse(res, {
      statusCode: 200,
      message: 'Reviews fetched successfully',
      data: { reviews, count: reviews.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a review for a product (Authenticated Customer)
 */
export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Rating must be between 1 and 5 stars',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    if (!comment || !comment.trim()) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Review comment cannot be empty',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    const product = await Product.findOne({
      $or: [{ _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }, { slug: productId }]
    });

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: product._id,
      user: req.user._id
    });

    if (existingReview) {
      return errorResponse(res, {
        statusCode: 409,
        message: 'You have already submitted a review for this product.',
        errorCode: ERROR_CODES.DUPLICATE_ENTRY
      });
    }

    // Check if user has purchased this product (Verified purchase badge)
    const hasPurchased = await Order.exists({
      user: req.user._id,
      paymentStatus: PAYMENT_STATUS.PAID,
      'items.product': product._id
    });

    const newReview = await Review.create({
      product: product._id,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      title: title ? title.trim() : '',
      comment: comment.trim(),
      isVerifiedPurchase: !!hasPurchased
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Thank you! Your review has been submitted.',
      data: { review: newReview }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review (Author or Admin)
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = { _id: id };
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const review = await Review.findOneAndDelete(query);

    if (!review) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Review not found or unauthorized',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
