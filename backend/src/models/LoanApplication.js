const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  incomeDetails: {
    monthlyIncome: { type: Number, required: true },
    monthlyExpenses: { type: Number, default: 0 },
    existingEmiTotal: { type: Number, default: 0 }
  },
  creditHistorySummary: {
    score: { type: Number, default: 700 },
    delinquenciesLast2Years: { type: Number, default: 0 }
  },
  statementDocumentUrl: { type: String },
  salarySlipUrl: { type: String },
  verificationRemarks: { type: String },
  automatedRiskScore: { type: Number, default: 75 },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'additional_docs_requested', 'approved', 'rejected'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
