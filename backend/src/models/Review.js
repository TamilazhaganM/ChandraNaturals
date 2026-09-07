import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      trim: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * Static method to recalculate and update product aggregate rating and review count
 */
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].numReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 4.8,
      reviewCount: 0
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
