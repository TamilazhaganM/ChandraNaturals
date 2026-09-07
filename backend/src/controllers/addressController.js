import Address from '../models/Address.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../config/constants.js';

/**
 * Get all addresses for authenticated user
 */
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

    return successResponse(res, {
      statusCode: 200,
      message: 'Addresses fetched successfully',
      data: { addresses }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new shipping address
 */
export const createAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine, city, state, pincode, landmark, addressType, isDefault } = req.body;

    // Validate Indian PIN code (6 digits) and Mobile (10 digits)
    if (!/^[6-9]\d{9}$/.test(String(phone).trim())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please enter a valid 10-digit Indian mobile number',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    if (!/^\d{6}$/.test(String(pincode).trim())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please enter a valid 6-digit postal pincode',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    // Check if this is the user's first address, make it default automatically
    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: req.user._id,
      fullName: fullName.trim(),
      phone: String(phone).trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: (state || 'Tamil Nadu').trim(),
      pincode: String(pincode).trim(),
      landmark: landmark ? landmark.trim() : '',
      addressType: addressType || 'home',
      isDefault: shouldBeDefault
    });

    // Add to User's addresses array
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { addresses: newAddress._id }
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Address added successfully',
      data: { address: newAddress }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing address
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, addressLine, city, state, pincode, landmark, addressType, isDefault } = req.body;

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Address not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    if (phone && !/^[6-9]\d{9}$/.test(String(phone).trim())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please enter a valid 10-digit Indian mobile number',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    if (pincode && !/^\d{6}$/.test(String(pincode).trim())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please enter a valid 6-digit postal pincode',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: id } }, { isDefault: false });
      address.isDefault = true;
    }

    if (fullName) address.fullName = fullName.trim();
    if (phone) address.phone = String(phone).trim();
    if (addressLine) address.addressLine = addressLine.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (pincode) address.pincode = String(pincode).trim();
    if (landmark !== undefined) address.landmark = landmark.trim();
    if (addressType) address.addressType = addressType;

    await address.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
    if (!address) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Address not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: id }
    });

    // If deleted address was default, set another address as default if exists
    if (address.isDefault) {
      const remaining = await Address.findOne({ user: req.user._id });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set an address as default
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Address not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Default address updated successfully',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};
