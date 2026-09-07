import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';
import { BUSINESS_RULES, ERROR_CODES } from '../config/constants.js';

/**
 * Authentication Service for JWT & Refresh Token Rotation
 */
class AuthService {
  /**
   * Generate Short-Lived Access Token
   */
  generateAccessToken(user) {
    const payload = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || BUSINESS_RULES.ACCESS_TOKEN_EXPIRY
    });
  }

  /**
   * Generate Refresh Token, save hash to DB, return raw token string
   */
  async generateRefreshToken(user, ipAddress = '', userAgent = '') {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = RefreshToken.hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + BUSINESS_RULES.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    await RefreshToken.create({
      user: user._id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent
    });

    return { rawToken, expiresAt };
  }

  /**
   * Rotate Refresh Token with Automatic Reuse Detection
   */
  async rotateRefreshToken(oldRawToken, ipAddress = '', userAgent = '') {
    if (!oldRawToken) {
      const err = new Error('No refresh token provided');
      err.statusCode = 401;
      err.errorCode = ERROR_CODES.UNAUTHORIZED;
      throw err;
    }

    const oldTokenHash = RefreshToken.hashToken(oldRawToken);
    const existingToken = await RefreshToken.findOne({ tokenHash: oldTokenHash }).populate('user');

    // 1. Reuse Detection: If token is revoked or was already replaced, someone might have stolen it!
    if (existingToken && (existingToken.isRevoked || existingToken.replacedByTokenHash)) {
      console.warn(`🚨 [SECURITY ALERT] Refresh token reuse detected for User ${existingToken.user?._id}! Revoking all active sessions.`);
      // Invalidate all tokens for this user
      await RefreshToken.updateMany({ user: existingToken.user._id }, { isRevoked: true });

      const err = new Error('Session security violation detected. Please sign in again.');
      err.statusCode = 401;
      err.errorCode = ERROR_CODES.UNAUTHORIZED;
      throw err;
    }

    // 2. Token Not Found or Expired
    if (!existingToken || existingToken.expiresAt < new Date()) {
      const err = new Error('Invalid or expired refresh token. Please sign in again.');
      err.statusCode = 401;
      err.errorCode = ERROR_CODES.UNAUTHORIZED;
      throw err;
    }

    const user = existingToken.user;
    if (!user || !user.isActive) {
      const err = new Error('Account is inactive or no longer exists.');
      err.statusCode = 403;
      err.errorCode = ERROR_CODES.ACCOUNT_INACTIVE;
      throw err;
    }

    // 3. Generate new tokens
    const newAccessToken = this.generateAccessToken(user);
    const { rawToken: newRawRefreshToken, expiresAt } = await this.generateRefreshToken(
      user,
      ipAddress,
      userAgent
    );

    // 4. Mark old token as revoked and record replacement
    existingToken.isRevoked = true;
    existingToken.replacedByTokenHash = RefreshToken.hashToken(newRawRefreshToken);
    await existingToken.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      user
    };
  }

  /**
   * Revoke a refresh token on logout
   */
  async revokeRefreshToken(rawToken) {
    if (!rawToken) return;
    const tokenHash = RefreshToken.hashToken(rawToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { isRevoked: true });
  }

  /**
   * Set HttpOnly Secure Cookie with Refresh Token
   */
  setRefreshTokenCookie(res, rawRefreshToken) {
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSitePolicy = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: isProduction || sameSitePolicy === 'none',
      sameSite: sameSitePolicy,
      path: '/api/auth',
      maxAge: BUSINESS_RULES.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    });
  }

  /**
   * Clear Refresh Token Cookie
   */
  clearRefreshTokenCookie(res) {
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSitePolicy = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction || sameSitePolicy === 'none',
      sameSite: sameSitePolicy,
      path: '/api/auth'
    });
  }
}

export const authService = new AuthService();
export default authService;
