const { v4: uuidv4 } = require('uuid');
const { Loan, LoanApplication, UserProfile, RepaymentSchedule, RiskAssessment, Notification, User } = require('../models');
const CalculationEngine = require('../services/calculationEngine');
const { createLoanSchema } = require('../validators/schemas');

class LoanController {
  /**
   * Borrower creates a new loan request
   */
  static async createLoan(req, res) {
    try {
      const validated = createLoanSchema.parse(req.body);

      const profile = await UserProfile.findOne({ userId: req.user._id });
      const risk = CalculationEngine.evaluateLoanRisk(profile, validated.amount, validated.durationMonths);

      const amortization = CalculationEngine.generateAmortizationSchedule(
        validated.amount,
        validated.interestRateAnnual,
        validated.durationMonths
      );

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (validated.fundingDurationDays || 30));

      const loan = new Loan({
        loanReference: `LOAN-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
        borrowerId: req.user._id,
        title: validated.title,
        amount: validated.amount,
        remainingAmount: validated.amount,
        fundedAmount: 0,
        purpose: validated.purpose,
        description: validated.description,
        durationMonths: validated.durationMonths,
        interestRateAnnual: validated.interestRateAnnual,
        repaymentFrequency: validated.repaymentFrequency,
        fundingType: validated.fundingType,
        fundingDeadline: deadline,
        riskGrade: risk.grade,
        status: 'open_for_funding', // open for demo testing immediately
        totalInterestPayable: amortization.totalInterestPayable,
        outstandingPrincipal: validated.amount
      });

      await loan.save();

      // Create linked application record & risk assessment
      await LoanApplication.create({
        loanId: loan._id,
        borrowerId: req.user._id,
        incomeDetails: {
          monthlyIncome: profile?.employment?.monthlyIncome || 45000,
          monthlyExpenses: 15000,
          existingEmiTotal: 0
        },
        creditHistorySummary: {
          score: profile?.creditScore || 720
        },
        automatedRiskScore: risk.overallScore,
        status: 'approved'
      });

      await RiskAssessment.create({
        loanId: loan._id,
        borrowerId: req.user._id,
        overallScore: risk.overallScore,
        grade: risk.grade,
        defaultProbability: risk.defaultProbability,
        recommendedInterestRate: validated.interestRateAnnual,
        assessmentNotes: `Automated assessment: DTI ratio ${risk.dtiRatio}. Grade: ${risk.grade}`
      });

      // Notification to borrower
      await Notification.create({
        recipientId: req.user._id,
        title: 'Loan Request Published',
        message: `Your loan request for ₹${validated.amount.toLocaleString()} is live on the lending marketplace.`,
        type: 'loan_update',
        relatedEntityId: loan._id,
        relatedEntityType: 'Loan'
      });

      return res.status(201).json({
        success: true,
        message: 'Loan request created and published to marketplace',
        loan,
        amortizationSummary: {
          monthlyEmi: amortization.monthlyEmi,
          totalInterestPayable: amortization.totalInterestPayable,
          totalPayable: amortization.totalPayable
        }
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Get all active marketplace loans (Public/Lender view)
   */
  static async getMarketplaceLoans(req, res) {
    try {
      const { purpose, minRate, maxRate, riskGrade, page = 1, limit = 20, search } = req.query;

      const query = { status: 'open_for_funding' };
      if (purpose && purpose !== 'all') query.purpose = purpose;
      if (riskGrade && riskGrade !== 'all') query.riskGrade = riskGrade;
      if (minRate || maxRate) {
        query.interestRateAnnual = {};
        if (minRate) query.interestRateAnnual.$gte = Number(minRate);
        if (maxRate) query.interestRateAnnual.$lte = Number(maxRate);
      }
      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      const loans = await Loan.find(query)
        .populate('borrowerId', 'name kycStatus')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const total = await Loan.countDocuments(query);

      return res.json({
        success: true,
        loans,
        pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Get single loan details with masked borrower identity
   */
  static async getLoanById(req, res) {
    try {
      const loan = await Loan.findById(req.params.id)
        .populate('borrowerId', 'name kycStatus createdAt');

      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      const risk = await RiskAssessment.findOne({ loanId: loan._id });
      const schedule = await RepaymentSchedule.find({ loanId: loan._id }).sort({ installmentNumber: 1 });

      return res.json({
        success: true,
        loan,
        riskAssessment: risk,
        repaymentSchedule: schedule
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Borrower Dashboard: loans created by logged in borrower
   */
  static async getMyBorrowings(req, res) {
    try {
      const loans = await Loan.find({ borrowerId: req.user._id }).sort({ createdAt: -1 });

      const totalRequested = loans.reduce((sum, l) => sum + l.amount, 0);
      const totalFunded = loans.reduce((sum, l) => sum + l.fundedAmount, 0);
      const activeOutstanding = loans
        .filter(l => ['open_for_funding', 'fully_funded', 'disbursed', 'active_repaying'].includes(l.status))
        .reduce((sum, l) => sum + (l.outstandingPrincipal || l.amount), 0);

      const upcomingInstallments = await RepaymentSchedule.find({
        borrowerId: req.user._id,
        status: { $in: ['upcoming', 'overdue'] }
      }).sort({ dueDate: 1 }).limit(5).populate('loanId', 'title loanReference');

      return res.json({
        success: true,
        summary: {
          totalRequested,
          totalFunded,
          activeOutstanding,
          loansCount: loans.length
        },
        loans,
        upcomingInstallments
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = LoanController;
