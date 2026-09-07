import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number']
    },
    addressLine: {
      type: String,
      required: [true, 'Flat / House No. and Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      default: 'Tamil Nadu'
    },
    pincode: {
      type: String,
      required: [true, 'Postal pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit postal pincode']
    },
    landmark: {
      type: String,
      trim: true
    },
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Address = mongoose.model('Address', addressSchema);
export default Address;
