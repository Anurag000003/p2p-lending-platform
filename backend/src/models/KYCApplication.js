const mongoose = require('mongoose');

const kycApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Aadhaar details
  aadhaarNumber: { type: String, trim: true },
  aadhaarHolderName: { type: String, trim: true },
  aadhaarStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  aadhaarVerifiedAt: { type: Date },
  aadhaarCardFrontUrl: { type: String },
  aadhaarCardBackUrl: { type: String },

  // PAN details
  panNumber: { type: String, uppercase: true, trim: true },
  panHolderName: { type: String, trim: true },
  panStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  panVerifiedAt: { type: Date },
  panCardUrl: { type: String },

  // Selfie / Face match
  selfieUrl: { type: String },

  // Legacy / generic fields compatibility
  documentType: {
    type: String,
    enum: ['aadhaar', 'pan', 'both', 'passport', 'voter_id', 'driving_license'],
    default: 'both'
  },
  documentNumber: { type: String },
  documentFrontUrl: { type: String },
  documentBackUrl: { type: String },
  proofOfIncomeUrl: { type: String },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('KYCApplication', kycApplicationSchema);
