const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  employment: {
    status: { type: String, enum: ['employed', 'self_employed', 'business', 'student', 'retired', 'other'], default: 'employed' },
    employerName: { type: String, default: '' },
    monthlyIncome: { type: Number, default: 0 },
    annualIncome: { type: Number, default: 0 }
  },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankName: { type: String, default: '' }
  },
  creditScore: { type: Number, default: 720, min: 300, max: 900 },
  reputationRating: { type: Number, default: 5.0, min: 0, max: 5 },
  completedLoansCount: { type: Number, default: 0 },
  defaultedLoansCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
