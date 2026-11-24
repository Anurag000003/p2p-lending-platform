const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, unique: true, index: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'],
    required: true
  },
  defaultProbability: { type: Number, required: true, min: 0, max: 1 },
  factors: {
    incomeStabilityScore: { type: Number, default: 80 },
    debtToIncomeRatio: { type: Number, default: 0.25 },
    repaymentHistoryScore: { type: Number, default: 85 },
    platformReputationScore: { type: Number, default: 90 },
    loanAmountToIncomeRatio: { type: Number, default: 0.3 }
  },
  recommendedInterestRate: { type: Number, default: 12 },
  assessedAt: { type: Date, default: Date.now },
  assessmentNotes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
