import mongoose from 'mongoose';
import crypto from 'crypto';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically cleans expired sessions
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    replacedByTokenHash: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

/**
 * Hash raw refresh token for secure database storage
 */
refreshTokenSchema.statics.hashToken = function (rawToken) {
  return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
