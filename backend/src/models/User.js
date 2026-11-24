const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, trim: true, index: true },
  roles: [{
    type: String,
    enum: ['borrower', 'lender', 'organizer', 'admin'],
    default: ['borrower', 'lender']
  }],
  activeRole: {
    type: String,
    enum: ['borrower', 'lender', 'organizer', 'admin'],
    default: 'borrower'
  },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  phoneOtp: { type: String },
  phoneOtpExpiry: { type: Date },
  aadhaarStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  aadhaarNumber: { type: String },
  panStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  panNumber: { type: String },
  kycStatus: {
    type: String,
    enum: ['unsubmitted', 'pending', 'verified', 'rejected'],
    default: 'unsubmitted',
    index: true
  },
  kycApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'KYCApplication' },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending_review'],
    default: 'active'
  },
  walletBalance: { type: Number, default: 0, min: 0 },
  emailOtp: { type: String },
  emailOtpExpiry: { type: Date },
  phoneOtp: { type: String },
  phoneOtpExpiry: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
