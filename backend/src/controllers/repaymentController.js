const { v4: uuidv4 } = require('uuid');
const {
  RepaymentSchedule,
  Repayment,
  Loan,
  LendingContribution,
  User,
  Notification
} = require('../models');
const CalculationEngine = require('../services/calculationEngine');
const LedgerService = require('../ledger/ledgerService');
const PaymentService = require('../integrations/paymentService');

class RepaymentController {
  /**
   * Borrower pays a scheduled loan installment
   */
  static async makeRepayment(req, res) {
    try {
      const { scheduleId, paymentMethod = 'simulated_gateway' } = req.body;

      const schedule = await RepaymentSchedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Installment schedule item not found' });
      }

      if (schedule.status === 'paid') {
        return res.status(400).json({ success: false, message: 'This installment has already been paid in full' });
      }

      const loan = await Loan.findById(schedule.loanId);
      if (!loan) {
        return res.status(404).json({ success: false, message: 'Associated loan not found' });
      }

      if (String(loan.borrowerId) !== String(req.user._id) && !req.user.roles.includes('admin')) {
        return res.status(403).json({ success: false, message: 'Not authorized to pay installments for this loan' });
      }

      const amountToPay = schedule.totalInstallmentAmount;

      // 1. Process payment authorization
      const paymentTxn = await PaymentService.initiateTransaction({
        userId: req.user._id,
        amount: amountToPay,
        type: 'repayment_payment',
        relatedEntityId: loan._id,
        relatedEntityType: 'Loan',
        metadata: { installmentNumber: schedule.installmentNumber, loanRef: loan.loanReference }
      });

      await PaymentService.verifyAndCompleteTransaction(paymentTxn.transactionReference, true);

      // 2. Fetch all contributing lenders for this loan
      const contributions = await LendingContribution.find({
        loanId: loan._id,
        status: { $in: ['confirmed', 'disbursed', 'active_earning'] }
      });

      // 3. Calculate exact distribution to each lender
      const lenderDistributions = CalculationEngine.distributeRepaymentToLenders(
        schedule.principalAmount,
        schedule.interestAmount,
        contributions
      );

      // 4. Update each lender's balance & contribution stats
      const escrowAcc = await LedgerService.getSystemEscrowAccount();

      for (const dist of lenderDistributions) {
        const lenderWallet = await LedgerService.getOrCreateAccount(dist.lenderId, 'user_wallet');

        // Credit lender wallet in DB
        await User.findByIdAndUpdate(dist.lenderId, {
          $inc: { walletBalance: dist.totalDistributed }
        });

        // Update lending contribution recovered amounts
        await LendingContribution.findByIdAndUpdate(dist.contributionId, {
          $inc: {
            principalRecovered: dist.principalAmount,
            interestReceived: dist.interestAmount
          }
        });

        // Double-entry record: Escrow -> Lender
        await LedgerService.recordDoubleEntry({
          debitAccountId: escrowAcc._id,
          creditAccountId: lenderWallet._id,
          amount: dist.totalDistributed,
          entryType: 'repayment_principal',
          narrative: `Payout for loan ${loan.loanReference} inst #${schedule.installmentNumber}`,
          transactionId: paymentTxn._id
        });

        // Notify lender
        await Notification.create({
          recipientId: dist.lenderId,
          title: 'Repayment Received!',
          message: `Received ₹${dist.totalDistributed.toLocaleString()} (Principal: ₹${dist.principalAmount}, Interest: ₹${dist.interestAmount}) from loan ${loan.loanReference}.`,
          type: 'repayment_reminder',
          relatedEntityId: loan._id
        });
      }

      // 5. Create Repayment record
      const repayment = new Repayment({
        repaymentReference: `REP-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
        loanId: loan._id,
        scheduleId: schedule._id,
        borrowerId: req.user._id,
        amountPaid: amountToPay,
        principalPortion: schedule.principalAmount,
        interestPortion: schedule.interestAmount,
        paymentMethod,
        paymentTransactionId: paymentTxn._id,
        lenderDistributions,
        status: 'completed'
      });

      await repayment.save();

      // 6. Update schedule item
      schedule.status = 'paid';
      schedule.paidAmount = amountToPay;
      schedule.paidDate = new Date();
      await schedule.save();

      // 7. Update loan totals
      loan.totalRepaidAmount = Math.round((loan.totalRepaidAmount + amountToPay) * 100) / 100;
      loan.outstandingPrincipal = Math.max(0, Math.round((loan.outstandingPrincipal - schedule.principalAmount) * 100) / 100);
      loan.totalInterestRepaid = Math.round((loan.totalInterestRepaid + schedule.interestAmount) * 100) / 100;

      // Check if all installments paid
      const unpaidCount = await RepaymentSchedule.countDocuments({
        loanId: loan._id,
        status: { $in: ['upcoming', 'overdue', 'partially_paid'] }
      });

      if (unpaidCount === 0) {
        loan.status = 'completed';
      } else {
        loan.status = 'active_repaying';
      }

      await loan.save();

      return res.json({
        success: true,
        message: 'Installment repaid successfully and distributed to lenders',
        repayment,
        loanStatus: loan.status,
        remainingBalance: schedule.remainingLoanBalance
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Get Repayment Schedule for a loan
   */
  static async getScheduleByLoan(req, res) {
    try {
      const schedule = await RepaymentSchedule.find({ loanId: req.params.loanId })
        .sort({ installmentNumber: 1 });

      const repayments = await Repayment.find({ loanId: req.params.loanId })
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        schedule,
        repayments
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = RepaymentController;
