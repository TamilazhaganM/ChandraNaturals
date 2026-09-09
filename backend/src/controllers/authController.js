import User from '../models/User.js';
import OTPVerification from '../models/OTPVerification.js';
import RefreshToken from '../models/RefreshToken.js';
import authService from '../services/authService.js';
import notificationService from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES, OTP_PURPOSE, BUSINESS_RULES, ROLES } from '../config/constants.js';

/**
 * Customer Registration
 * Flow: Validate -> Check duplicate -> Create user (unverified) -> Generate OTP -> Hash OTP -> Send OTP -> Response
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // 1. Check if user already exists with email or phone
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }]
    });

    if (existingUser) {
      const field = existingUser.email === cleanEmail ? 'email address' : 'mobile number';
      return errorResponse(res, {
        statusCode: 409,
        message: `An account with this ${field} already exists. Please sign in or use another ${field}.`,
        errorCode: ERROR_CODES.DUPLICATE_ENTRY
      });
    }

    // 2. Create unverified user
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      emailVerified: false,
      phoneVerified: false,
      isActive: true // User can proceed to verify OTP
    });

    // 3. Generate secure OTP
    const rawOTP = OTPVerification.generateSecureOTP();
    const otpHash = OTPVerification.hashOTP(rawOTP);
    const expiresAt = new Date(Date.now() + BUSINESS_RULES.OTP_EXPIRY_MS);
    const resendAvailableAt = new Date(Date.now() + BUSINESS_RULES.OTP_RESEND_COOLDOWN_MS);

    // 4. Invalidate any prior active OTPs for this identifier
    await OTPVerification.updateMany(
      { identifier: cleanEmail, purpose: OTP_PURPOSE.REGISTRATION, isUsed: false },
      { isUsed: true }
    );

    // 5. Store hashed OTP
    await OTPVerification.create({
      identifier: cleanEmail,
      otpHash,
      purpose: OTP_PURPOSE.REGISTRATION,
      expiresAt,
      resendAvailableAt
    });

    // 6. Send OTP via configured communication service
    await notificationService.sendOTP({
      identifier: cleanEmail,
      otp: rawOTP,
      purpose: 'registration',
      recipientName: newUser.name
    });

    // Also send SMS to phone if available
    await notificationService.sendOTP({
      identifier: cleanPhone,
      otp: rawOTP,
      purpose: 'registration',
      recipientName: newUser.name
    });

    // 7. Safe response (NEVER return the OTP in production API responses)
    return successResponse(res, {
      statusCode: 201,
      message: 'Account created! A 6-digit verification code has been sent to your email and mobile number.',
      data: {
        requiresVerification: true,
        identifier: cleanEmail,
        phone: cleanPhone,
        purpose: OTP_PURPOSE.REGISTRATION
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 * Supports registration verification, login verification, or forgot password verification
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { identifier, otp, purpose } = req.body;
    const cleanIdentifier = identifier.trim().toLowerCase();

    // 1. Locate active OTP record
    const otpRecord = await OTPVerification.findOne({
      identifier: cleanIdentifier,
      purpose,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'No active verification code found for this request. Please request a new code.',
        errorCode: ERROR_CODES.OTP_INVALID
      });
    }

    // 2. Check maximum verification attempts (Brute-force protection)
    if (otpRecord.attempts >= BUSINESS_RULES.OTP_MAX_ATTEMPTS) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return errorResponse(res, {
        statusCode: 429,
        message: 'Maximum verification attempts exceeded. This OTP has been invalidated. Please request a new code.',
        errorCode: ERROR_CODES.OTP_MAX_ATTEMPTS_EXCEEDED
      });
    }

    // 3. Check expiration
    if (new Date() > otpRecord.expiresAt) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return errorResponse(res, {
        statusCode: 400,
        message: 'Verification code has expired. Please request a new code.',
        errorCode: ERROR_CODES.OTP_EXPIRED
      });
    }

    // 4. Verify candidate OTP hash
    const candidateHash = OTPVerification.hashOTP(otp);
    if (candidateHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = BUSINESS_RULES.OTP_MAX_ATTEMPTS - otpRecord.attempts;
      return errorResponse(res, {
        statusCode: 400,
        message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
        errorCode: ERROR_CODES.OTP_INVALID
      });
    }

    // 5. Invalidate OTP upon successful match
    otpRecord.isUsed = true;
    await otpRecord.save();

    // 6. Handle specific purpose actions
    if (purpose === OTP_PURPOSE.REGISTRATION) {
      // Find and activate user
      const user = await User.findOne({
        $or: [{ email: cleanIdentifier }, { phone: cleanIdentifier }]
      });

      if (!user) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'User account not found.',
          errorCode: ERROR_CODES.NOT_FOUND
        });
      }

      user.emailVerified = true;
      user.phoneVerified = true;
      user.isActive = true;
      await user.save();

      // Issue authenticated session tokens
      const accessToken = authService.generateAccessToken(user);
      const { rawToken: refreshToken } = await authService.generateRefreshToken(
        user,
        req.ip,
        req.headers['user-agent']
      );

      authService.setRefreshTokenCookie(res, refreshToken);

      return successResponse(res, {
        statusCode: 200,
        message: 'Account successfully verified! Welcome to Chandra Naturals.',
        data: {
          user,
          accessToken
        }
      });
    }

    if (purpose === OTP_PURPOSE.FORGOT_PASSWORD) {
      return successResponse(res, {
        statusCode: 200,
        message: 'Verification code confirmed. You can now reset your password.',
        data: {
          verified: true,
          identifier: cleanIdentifier
        }
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'OTP verified successfully.',
      data: { verified: true }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP with cooldown enforcement
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { identifier, purpose } = req.body;
    const cleanIdentifier = identifier.trim().toLowerCase();

    // Check if active OTP exists and cooldown is still active
    const activeOTP = await OTPVerification.findOne({
      identifier: cleanIdentifier,
      purpose,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (activeOTP && new Date() < activeOTP.resendAvailableAt) {
      const remainingSeconds = Math.ceil((activeOTP.resendAvailableAt - new Date()) / 1000);
      return errorResponse(res, {
        statusCode: 429,
        message: `Please wait ${remainingSeconds} seconds before requesting a new code.`,
        errorCode: ERROR_CODES.OTP_COOLDOWN_ACTIVE
      });
    }

    // Invalidate previous OTPs
    await OTPVerification.updateMany(
      { identifier: cleanIdentifier, purpose, isUsed: false },
      { isUsed: true }
    );

    // Generate new OTP
    const rawOTP = OTPVerification.generateSecureOTP();
    const otpHash = OTPVerification.hashOTP(rawOTP);
    const expiresAt = new Date(Date.now() + BUSINESS_RULES.OTP_EXPIRY_MS);
    const resendAvailableAt = new Date(Date.now() + BUSINESS_RULES.OTP_RESEND_COOLDOWN_MS);

    await OTPVerification.create({
      identifier: cleanIdentifier,
      otpHash,
      purpose,
      expiresAt,
      resendAvailableAt
    });

    // Send notification
    await notificationService.sendOTP({
      identifier: cleanIdentifier,
      otp: rawOTP,
      purpose
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'A new verification code has been dispatched.',
      data: { identifier: cleanIdentifier, purpose }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Sign In
 */
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const cleanIdentifier = identifier.trim().toLowerCase();

    // 1. Locate user by email or phone
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { phone: identifier.trim() }]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Invalid email/mobile or password. Please try again.',
        errorCode: ERROR_CODES.INVALID_CREDENTIALS
      });
    }

    // 2. Check if account is active
    if (!user.isActive) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Your account has been deactivated. Please reach out to customer support.',
        errorCode: ERROR_CODES.ACCOUNT_INACTIVE
      });
    }

    // Ensure designated store administrators are always recognized with ADMIN privileges
    const authorizedAdmins = ['mtamilazhagan30@gmail.com', (process.env.ADMIN_EMAIL || '').toLowerCase().trim()].filter(Boolean);
    if (authorizedAdmins.includes(user.email.toLowerCase()) && user.role !== ROLES.ADMIN) {
      user.role = ROLES.ADMIN;
      user.emailVerified = true;
      user.isActive = true;
      await user.save();
      console.log(`👑 [Auth] Administrator role confirmed and saved for: ${user.email}`);
    }

    // 3. Generate tokens
    const accessToken = authService.generateAccessToken(user);
    const { rawToken: refreshToken } = await authService.generateRefreshToken(
      user,
      req.ip,
      req.headers['user-agent']
    );

    // 4. Set HttpOnly Secure Refresh Token Cookie
    authService.setRefreshTokenCookie(res, refreshToken);

    return successResponse(res, {
      statusCode: 200,
      message: `Welcome back, ${user.name}!`,
      data: {
        user,
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token using Refresh Token Cookie (with token rotation)
 */
export const refreshToken = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (!rawRefreshToken) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'No active refresh session found. Please sign in.',
        errorCode: ERROR_CODES.UNAUTHORIZED
      });
    }

    const { accessToken, refreshToken: newRefreshToken, user } = await authService.rotateRefreshToken(
      rawRefreshToken,
      req.ip,
      req.headers['user-agent']
    );

    authService.setRefreshTokenCookie(res, newRefreshToken);

    return successResponse(res, {
      statusCode: 200,
      message: 'Access session refreshed successfully.',
      data: {
        accessToken,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Sign Out
 */
export const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (rawRefreshToken) {
      await authService.revokeRefreshToken(rawRefreshToken);
    }
    authService.clearRefreshTokenCookie(res);

    return successResponse(res, {
      statusCode: 200,
      message: 'Successfully signed out.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch Current Authenticated User Profile
 */
export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, {
      statusCode: 200,
      message: 'Profile fetched successfully.',
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password Request (Prevents account enumeration)
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { phone: identifier.trim() }]
    });

    // Regardless of whether user exists, return generic success message to prevent enumeration
    if (user) {
      const rawOTP = OTPVerification.generateSecureOTP();
      const otpHash = OTPVerification.hashOTP(rawOTP);
      const expiresAt = new Date(Date.now() + BUSINESS_RULES.OTP_EXPIRY_MS);
      const resendAvailableAt = new Date(Date.now() + BUSINESS_RULES.OTP_RESEND_COOLDOWN_MS);

      await OTPVerification.updateMany(
        { identifier: cleanIdentifier, purpose: OTP_PURPOSE.FORGOT_PASSWORD, isUsed: false },
        { isUsed: true }
      );

      await OTPVerification.create({
        identifier: cleanIdentifier,
        otpHash,
        purpose: OTP_PURPOSE.FORGOT_PASSWORD,
        expiresAt,
        resendAvailableAt
      });

      await notificationService.sendOTP({
        identifier: cleanIdentifier,
        otp: rawOTP,
        purpose: 'forgot_password',
        recipientName: user.name
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'If an account matches those details, a 6-digit password reset code has been sent.',
      data: { identifier: cleanIdentifier }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password with Verified OTP
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const cleanIdentifier = identifier.trim().toLowerCase();

    // 1. Verify OTP record
    const otpRecord = await OTPVerification.findOne({
      identifier: cleanIdentifier,
      purpose: OTP_PURPOSE.FORGOT_PASSWORD,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'No active password reset request found. Please initiate a new request.',
        errorCode: ERROR_CODES.OTP_INVALID
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return errorResponse(res, {
        statusCode: 400,
        message: 'Password reset code has expired. Please request a new one.',
        errorCode: ERROR_CODES.OTP_EXPIRED
      });
    }

    const candidateHash = OTPVerification.hashOTP(otp);
    if (candidateHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid verification code.',
        errorCode: ERROR_CODES.OTP_INVALID
      });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    // 2. Find user & update password
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { phone: cleanIdentifier }]
    });

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Account not found.',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    user.password = newPassword;
    await user.save();

    // 3. Invalidate all active refresh tokens for this user for security
    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });
    authService.clearRefreshTokenCookie(res);

    return successResponse(res, {
      statusCode: 200,
      message: 'Your password has been successfully reset! Please sign in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send Email OTP for Account Verification
 * Sends verification OTP specifically to the user's email via MSG91 Email service
 */
export const sendEmailOTPVerification = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check cooldown for active OTP
    const activeOTP = await OTPVerification.findOne({
      identifier: cleanEmail,
      purpose: OTP_PURPOSE.REGISTRATION,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (activeOTP && new Date() < activeOTP.resendAvailableAt) {
      const remainingSeconds = Math.ceil((activeOTP.resendAvailableAt - new Date()) / 1000);
      return errorResponse(res, {
        statusCode: 429,
        message: `Please wait ${remainingSeconds} seconds before requesting a new code.`,
        errorCode: ERROR_CODES.OTP_COOLDOWN_ACTIVE
      });
    }

    // Invalidate any prior active OTPs for this email
    await OTPVerification.updateMany(
      { identifier: cleanEmail, purpose: OTP_PURPOSE.REGISTRATION, isUsed: false },
      { isUsed: true }
    );

    // Generate secure OTP
    const rawOTP = OTPVerification.generateSecureOTP();
    const otpHash = OTPVerification.hashOTP(rawOTP);
    const expiresAt = new Date(Date.now() + BUSINESS_RULES.OTP_EXPIRY_MS);
    const resendAvailableAt = new Date(Date.now() + BUSINESS_RULES.OTP_RESEND_COOLDOWN_MS);

    await OTPVerification.create({
      identifier: cleanEmail,
      otpHash,
      purpose: OTP_PURPOSE.REGISTRATION,
      expiresAt,
      resendAvailableAt
    });

    // Send email using MSG91 Email service (with SMTP / simulator fallback)
    const sendResult = await notificationService.sendEmailOTP({
      email: cleanEmail,
      otp: rawOTP,
      purpose: 'registration',
      recipientName: name || 'Valued Customer'
    });

    return successResponse(res, {
      statusCode: 200,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      data: {
        email: cleanEmail,
        channel: sendResult.channel,
        cooldownSeconds: 60
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email OTP
 */
export const verifyEmailOTPVerification = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const otpRecord = await OTPVerification.findOne({
      identifier: cleanEmail,
      purpose: OTP_PURPOSE.REGISTRATION,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'No active verification code found for this email. Please request a new code.',
        errorCode: ERROR_CODES.OTP_INVALID
      });
    }

    if (otpRecord.attempts >= BUSINESS_RULES.OTP_MAX_ATTEMPTS) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return errorResponse(res, {
        statusCode: 429,
        message: 'Maximum verification attempts exceeded. Please request a new code.',
        errorCode: ERROR_CODES.OTP_MAX_ATTEMPTS_EXCEEDED
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return errorResponse(res, {
        statusCode: 400,
        message: 'Verification code has expired. Please request a new code.',
        errorCode: ERROR_CODES.OTP_EXPIRED
      });
    }

    const candidateHash = OTPVerification.hashOTP(otp);
    if (candidateHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = BUSINESS_RULES.OTP_MAX_ATTEMPTS - otpRecord.attempts;
      return errorResponse(res, {
        statusCode: 400,
        message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
        errorCode: ERROR_CODES.OTP_INVALID
      });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    // If a user account already exists with this email, mark as verified
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      user.emailVerified = true;
      await user.save();
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Email address successfully verified!',
      data: {
        verified: true,
        email: cleanEmail
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile Details (Name, Phone)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User account not found.',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    if (name && typeof name === 'string') {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Name must be at least 2 characters long.',
          errorCode: ERROR_CODES.VALIDATION_ERROR
        });
      }
      user.name = trimmedName;
    }

    if (phone && typeof phone === 'string') {
      const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Please provide a valid 10-digit Indian mobile number.',
          errorCode: ERROR_CODES.VALIDATION_ERROR
        });
      }

      if (cleanPhone !== user.phone) {
        const existing = await User.findOne({ phone: cleanPhone, _id: { $ne: user._id } });
        if (existing) {
          return errorResponse(res, {
            statusCode: 409,
            message: 'This mobile number is already linked to another account.',
            errorCode: ERROR_CODES.DUPLICATE_ENTRY
          });
        }
        user.phone = cleanPhone;
        user.phoneVerified = false; // reset phone verification if changed
      }
    }

    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Profile updated successfully!',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password (for logged-in users)
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Both current password and new password are required.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    if (newPassword.length < 6) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'New password must be at least 6 characters long.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    // Retrieve user with password hash
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User account not found.',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Incorrect current password. Please enter your existing password correctly.',
        errorCode: ERROR_CODES.UNAUTHORIZED
      });
    }

    // Ensure new password is not identical to old password
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'New password cannot be the same as your current password.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Generate fresh access token so the active session continues without interruption
    const newAccessToken = authService.generateAccessToken(user);

    return successResponse(res, {
      statusCode: 200,
      message: 'Password changed successfully! Your account credentials have been updated.',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};
