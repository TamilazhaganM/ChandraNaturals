import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: [true, 'Category identifier is required'],
      index: true,
      trim: true
    },
    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare-at price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0
    },
    weight: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Product primary image is required']
    },
    images: {
      type: [String],
      default: []
    },
    shortDescription: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    ingredients: {
      type: [String],
      default: []
    },
    howToUse: {
      type: String,
      trim: true
    },
    storage: {
      type: String,
      trim: true
    },
    shelfLife: {
      type: String,
      trim: true
    },
    isVeg: {
      type: Boolean,
      default: true
    },
    badge: {
      type: String,
      trim: true
    },
    available: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, 'Stock cannot be negative']
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isCombo: {
      type: Boolean,
      default: false
    },
    productIds: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for searching & filtering
productSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });

// Helper to calculate savings
productSchema.virtual('savings').get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return this.compareAtPrice - this.price;
  }
  return 0;
});

// Include virtuals in toJSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
