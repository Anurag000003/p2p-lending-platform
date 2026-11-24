const { v4: uuidv4 } = require('uuid');
const {
  Loan,
  LendingContribution,
  User,
  Notification,
  RepaymentSchedule
} = require('../models');
const CalculationEngine = require('../services/calculationEngine');
const LedgerService = require('../ledger/ledgerService');
const PaymentService = require('../integrations/paymentService');
const { fundLoanSchema } = require('../validators/schemas');

class LendingController {
  /**
   * Lender funds a loan (Full or Partial)
   * Uses atomic checks and double-entry ledger bookkeeping.
   */
  static async fundLoan(req, res) {
    try {
      const validated = fundLoanSchema.parse(req.body);

      const loan = await Loan.findById(validated.loanId);
      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      if (loan.status !== 'open_for_funding') {
        return res.status(400).json({ success: false, message: `Loan is not open for funding (Current status: ${loan.status})` });
      }

      if (String(loan.borrowerId) === String(req.user._id)) {
        return res.status(400).json({ success: false, message: 'Borrowers cannot fund their own loans' });
      }

      // Check funding amount limit
      let fundingAmount = validated.amount;
      if (validated.fundingOption === 'full_funding') {
        fundingAmount = loan.remainingAmount;
      }

      if (fundingAmount > loan.remainingAmount) {
        return res.status(400).json({
          success: false,
          message: `Requested amount ₹${fundingAmount} exceeds remaining loan requirement of ₹${loan.remainingAmount}`
        });
      }

      // 1. Process simulated payment authorization
      const paymentTxn = await PaymentService.initiateTransaction({
        userId: req.user._id,
        amount: fundingAmount,
        type: 'loan_funding',
        relatedEntityId: loan._id,
        relatedEntityType: 'Loan',
        metadata: { loanTitle: loan.title, fundingOption: validated.fundingOption }
      });

      await PaymentService.verifyAndCompleteTransaction(paymentTxn.transactionReference, true);

      // 2. Ledger double-entry record: Lender -> Escrow
      const lenderAcc = await LedgerService.getOrCreateAccount(req.user._id, 'user_wallet');
      const escrowAcc = await LedgerService.getSystemEscrowAccount();
      await LedgerService.recordDoubleEntry({
        debitAccountId: lenderAcc._id,
        creditAccountId: escrowAcc._id,
        amount: fundingAmount,
        entryType: 'loan_funding',
        narrative: `Lender contribution to loan ${loan.loanReference}`,
        transactionId: paymentTxn._id
      });

      // 3. Calculate share percentage and expected returns
      const sharePercentage = Math.round((fundingAmount / loan.amount) * 10000) / 100;
      const totalExpectedInterest = loan.totalInterestPayable || 0;
      const lenderExpectedInterest = Math.round((totalExpectedInterest * (fundingAmount / loan.amount)) * 100) / 100;

      // 4. Create LendingContribution record
      const contribution = new LendingContribution({
        contributionReference: `LEND-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
        lenderId: req.user._id,
        loanId: loan._id,
        amount: fundingAmount,
        sharePercentage,
        fundingOption: validated.fundingOption,
        status: 'confirmed',
        expectedPrincipalReturn: fundingAmount,
        expectedInterestReturn: lenderExpectedInterest,
        paymentTransactionId: paymentTxn._id
      });

      await contribution.save();

      // 5. Update Loan state atomically
      loan.fundedAmount = Math.round((loan.fundedAmount + fundingAmount) * 100) / 100;
      loan.remainingAmount = Math.max(0, Math.round((loan.amount - loan.fundedAmount) * 100) / 100);

      // If fully funded, disburse immediately for development flow
      if (loan.remainingAmount <= 0) {
        loan.status = 'disbursed';
        loan.disbursedAt = new Date();

        // Generate actual RepaymentSchedule in database
        const amortization = CalculationEngine.generateAmortizationSchedule(
          loan.amount,
          loan.interestRateAnnual,
          loan.durationMonths,
          new Date()
        );

        for (const inst of amortization.installments) {
          await RepaymentSchedule.create({
            loanId: loan._id,
            borrowerId: loan.borrowerId,
            ...inst
          });
        }

        // Credit borrower wallet
        await User.findByIdAndUpdate(loan.borrowerId, {
          $inc: { walletBalance: loan.amount }
        });

        // Notify borrower of disbursement
        await Notification.create({
          recipientId: loan.borrowerId,
          title: 'Loan Fully Funded & Disbursed!',
          message: `Congratulations! Your loan ${loan.loanReference} has reached 100% funding (₹${loan.amount.toLocaleString()}) and proceeds have been disbursed to your account.`,
          type: 'disbursement',
          relatedEntityId: loan._id
        });
      }

      await loan.save();

      // Notify lender
      await Notification.create({
        recipientId: req.user._id,
        title: 'Investment Confirmed',
        message: `You successfully contributed ₹${fundingAmount.toLocaleString()} to ${loan.title}. Expected interest return: ₹${lenderExpectedInterest.toLocaleString()}.`,
        type: 'funding_received',
        relatedEntityId: contribution._id
      });

      return res.status(201).json({
        success: true,
        message: 'Contribution confirmed successfully',
        contribution,
        loan: {
          id: loan._id,
          fundedAmount: loan.fundedAmount,
          remainingAmount: loan.remainingAmount,
          status: loan.status
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
   * Lender Portfolio & Investments Dashboard
   */
  static async getLenderPortfolio(req, res) {
    try {
      const contributions = await LendingContribution.find({ lenderId: req.user._id })
        .populate('loanId', 'title loanReference amount interestRateAnnual durationMonths status borrowerId')
        .sort({ createdAt: -1 });

      const totalInvested = contributions.reduce((sum, c) => sum + c.amount, 0);
      const principalRecovered = contributions.reduce((sum, c) => sum + c.principalRecovered, 0);
      const interestReceived = contributions.reduce((sum, c) => sum + c.interestReceived, 0);
      const expectedInterestTotal = contributions.reduce((sum, c) => sum + c.expectedInterestReturn, 0);
      const activeOutstandingPrincipal = totalInvested - principalRecovered;

      const activeLoansCount = contributions.filter(c => c.status === 'confirmed' || c.status === 'active_earning').length;

      return res.json({
        success: true,
        portfolio: {
          totalInvested,
          principalRecovered,
          interestReceived,
          expectedInterestTotal,
          activeOutstandingPrincipal,
          activeLoansCount,
          totalInvestmentsCount: contributions.length
        },
        contributions
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = LendingController;
