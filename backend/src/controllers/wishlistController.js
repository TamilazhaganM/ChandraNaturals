import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../config/constants.js';

/**
 * Get authenticated customer's wishlist
 */
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const validProducts = (wishlist.products || []).filter(p => p && p.isActive);

    return successResponse(res, {
      statusCode: 200,
      message: 'Wishlist fetched successfully',
      data: {
        wishlist: validProducts,
        count: validProducts.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      $or: [{ _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }, { slug: productId }],
      isActive: true
    });

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(product._id)) {
      wishlist.products.push(product._id);
      await wishlist.save();
    }

    await wishlist.populate('products');

    return successResponse(res, {
      statusCode: 200,
      message: `Added ${product.name} to wishlist`,
      data: {
        wishlist: wishlist.products,
        count: wishlist.products.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return successResponse(res, {
        statusCode: 200,
        message: 'Product removed from wishlist',
        data: { wishlist: [], count: 0 }
      });
    }

    const product = await Product.findOne({
      $or: [{ _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }, { slug: productId }]
    });

    const targetId = product ? product._id.toString() : productId;

    wishlist.products = wishlist.products.filter(
      p => p.toString() !== targetId
    );

    await wishlist.save();
    await wishlist.populate('products');

    return successResponse(res, {
      statusCode: 200,
      message: 'Product removed from wishlist',
      data: {
        wishlist: wishlist.products,
        count: wishlist.products.length
      }
    });
  } catch (error) {
    next(error);
  }
};
