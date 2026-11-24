const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const KycController = require('../controllers/kycController');
const VerificationController = require('../controllers/verificationController');
const LoanController = require('../controllers/loanController');
const LendingController = require('../controllers/lendingController');
const GroupFundingController = require('../controllers/groupFundingController');
const RepaymentController = require('../controllers/repaymentController');
const AdminController = require('../controllers/adminController');
const { Notification, PaymentTransaction } = require('../models');

const { authenticate, requireRole, requireKyc, auditTrail } = require('../middleware/auth');

// ================= AUTH ROUTES =================
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticate, AuthController.getMe);
router.post('/auth/switch-role', authenticate, AuthController.switchRole);

// ================= KYC & IDENTITY VERIFICATION ROUTES =================
router.post('/kyc/submit', authenticate, KycController.submitKYC);
router.get('/kyc/status', authenticate, KycController.getKYCStatus);
router.post('/kyc/instant-verify-dev', authenticate, KycController.instantVerifyDev);

// Aadhaar, PAN, and Mobile Verification Endpoints
router.get('/verify/summary', authenticate, VerificationController.getVerificationSummary);
router.post('/verify/mobile/send-otp', authenticate, VerificationController.sendMobileOtp);
router.post('/verify/mobile/verify-otp', authenticate, VerificationController.verifyMobileOtp);
router.post('/verify/aadhaar/request-otp', authenticate, VerificationController.requestAadhaarOtp);
router.post('/verify/aadhaar/verify', authenticate, VerificationController.verifyAadhaar);
router.post('/verify/pan/verify', authenticate, VerificationController.verifyPan);

// ================= BORROWING / LOAN ROUTES =================
router.post('/loans', authenticate, requireKyc, auditTrail('CREATE_LOAN', 'Loan'), LoanController.createLoan);
router.get('/loans/marketplace', LoanController.getMarketplaceLoans);
router.get('/loans/my-borrowings', authenticate, LoanController.getMyBorrowings);
router.get('/loans/:id', LoanController.getLoanById);

// ================= LENDING ROUTES =================
router.post('/lending/fund', authenticate, requireKyc, auditTrail('FUND_LOAN', 'LendingContribution'), LendingController.fundLoan);
router.get('/lending/portfolio', authenticate, LendingController.getLenderPortfolio);

// ================= GROUP FUNDING ROUTES =================
router.post('/groups', authenticate, requireKyc, auditTrail('CREATE_GROUP', 'FundingGroup'), GroupFundingController.createGroup);
router.get('/groups/campaigns', GroupFundingController.browseCampaigns);
router.get('/groups/campaigns/:id', GroupFundingController.getCampaignById);
router.post('/groups/campaigns/contribute', authenticate, requireKyc, auditTrail('CONTRIBUTE_CAMPAIGN', 'CampaignContribution'), GroupFundingController.contributeToCampaign);
router.post('/groups/join', authenticate, GroupFundingController.joinGroupWithCode);

// ================= REPAYMENT ROUTES =================
router.post('/repayments/pay', authenticate, auditTrail('MAKE_REPAYMENT', 'Repayment'), RepaymentController.makeRepayment);
router.get('/repayments/schedule/:loanId', RepaymentController.getScheduleByLoan);

// ================= NOTIFICATIONS & WALLET =================
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id }).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/wallet/transactions', authenticate, async (req, res) => {
  try {
    const txns = await PaymentTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, transactions: txns, balance: req.user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/wallet/deposit', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 10) return res.status(400).json({ success: false, message: 'Minimum ₹10 required' });
    req.user.walletBalance = Math.round((req.user.walletBalance + Number(amount)) * 100) / 100;
    await req.user.save();

    await PaymentTransaction.create({
      transactionReference: `DEP-${Date.now()}`,
      userId: req.user._id,
      amount: Number(amount),
      type: 'deposit',
      status: 'captured',
      verifiedServerSide: true
    });

    res.json({ success: true, balance: req.user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= ADMIN ROUTES =================
router.get('/admin/stats', authenticate, requireRole('admin'), AdminController.getDashboardStats);
router.get('/admin/users', authenticate, requireRole('admin'), AdminController.getAllUsers);
router.put('/admin/users/:userId/status', authenticate, requireRole('admin'), AdminController.updateUserStatus);
router.get('/admin/kyc/pending', authenticate, requireRole('admin'), AdminController.getPendingKYCs);
router.post('/admin/kyc/:kycId/review', authenticate, requireRole('admin'), AdminController.reviewKYC);
router.get('/admin/audit-logs', authenticate, requireRole('admin'), AdminController.getAuditLogs);

module.exports = router;
