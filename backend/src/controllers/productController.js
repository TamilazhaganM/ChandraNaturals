import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../config/constants.js';

/**
 * Public: Get all active products with pagination, search, category, and price filters
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      q,
      search,
      minPrice,
      maxPrice,
      sortBy = 'featured',
      isVeg,
      isCombo
    } = req.query;

    const queryFilter = { isActive: true };

    // Category filter
    if (category && category !== 'all') {
      if (category === 'combos') {
        queryFilter.isCombo = true;
      } else {
        queryFilter.category = category.toLowerCase().trim();
      }
    }

    if (isCombo !== undefined) {
      queryFilter.isCombo = isCombo === 'true';
    }

    // Veg filter
    if (isVeg !== undefined) {
      queryFilter.isVeg = isVeg === 'true';
    }

    // Price range filter
    if (minPrice || maxPrice) {
      queryFilter.price = {};
      if (minPrice) queryFilter.price.$gte = Number(minPrice);
      if (maxPrice) queryFilter.price.$lte = Number(maxPrice);
    }

    // Search query filter (matches name, description, ingredients, or shortDescription)
    const searchTerm = (q || search || '').trim();
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i');
      queryFilter.$or = [
        { name: regex },
        { shortDescription: regex },
        { description: regex },
        { ingredients: { $in: [regex] } }
      ];
    }

    // Sorting
    let sortOptions = { isFeatured: -1, createdAt: -1 };
    switch (sortBy) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'featured':
      default:
        sortOptions = { isFeatured: -1, rating: -1 };
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(queryFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(queryFilter)
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: 'Products fetched successfully',
      data: {
        products,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
          hasMore: skip + products.length < totalCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get single product by MongoDB ID or slug
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findOne({ _id: id, isActive: true });
    }

    if (!product) {
      product = await Product.findOne({ slug: id, isActive: true });
    }

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Product details fetched successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get product specifically by slug
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug: slug.toLowerCase(), isActive: true });

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: `Product with slug '${slug}' not found`,
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Product fetched successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get all active categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });

    return successResponse(res, {
      statusCode: 200,
      message: 'Categories fetched successfully',
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// PROTECTED ADMIN PRODUCT MANAGEMENT
// ==============================================================================

/**
 * Admin: Create a new product
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const existing = await Product.findOne({ slug: productData.slug });
    if (existing) {
      return errorResponse(res, {
        statusCode: 409,
        message: `A product with slug '${productData.slug}' already exists.`,
        errorCode: ERROR_CODES.DUPLICATE_ENTRY
      });
    }

    const newProduct = await Product.create(productData);

    return successResponse(res, {
      statusCode: 201,
      message: 'Product created successfully',
      data: { product: newProduct }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update existing product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete / Deactivate product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive: false
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Product deactivated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update product stock
 */
export const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(stock) || stock < 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please provide a valid non-negative stock number',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { stock: parseInt(stock, 10), available: parseInt(stock, 10) > 0 },
      { new: true }
    );

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Stock for ${product.name} updated to ${stock}`,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};
