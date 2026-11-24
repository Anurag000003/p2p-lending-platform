const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  role: z.enum(['borrower', 'lender', 'organizer']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

const kycSubmitSchema = z.object({
  documentType: z.enum(['aadhaar', 'pan', 'both', 'passport', 'voter_id', 'driving_license']).optional(),
  documentNumber: z.string().optional(),
  documentFrontUrl: z.string().optional(),
  documentBackUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
  proofOfIncomeUrl: z.string().optional(),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be a valid 12-digit number').optional(),
  aadhaarHolderName: z.string().min(2).optional(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be valid (e.g. ABCDE1234F)').optional(),
  panHolderName: z.string().min(2).optional()
});

const verifyAadhaarSchema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be a 12-digit number'),
  holderName: z.string().min(2, 'Holder name is required'),
  otp: z.string().optional() // simulated UIDAI OTP
});

const verifyPanSchema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
  holderName: z.string().min(2, 'Name on PAN is required'),
  dateOfBirth: z.string().optional()
});

const sendMobileOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Must be a valid 10-digit mobile number')
});

const verifyMobileOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Must be a valid 10-digit mobile number'),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

const createLoanSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  amount: z.number().min(1000, 'Minimum loan amount is ₹1,000').max(10000000, 'Maximum loan amount is ₹1,00,00,000'),
  purpose: z.enum(['education', 'business', 'medical', 'personal', 'home_improvement', 'debt_consolidation', 'other']),
  description: z.string().min(20, 'Please provide an adequate description'),
  durationMonths: z.number().int().min(1).max(60),
  interestRateAnnual: z.number().min(1).max(36),
  repaymentFrequency: z.enum(['monthly', 'quarterly', 'one_time']).default('monthly'),
  fundingType: z.enum(['individual', 'group_shared', 'community']).default('individual'),
  fundingDurationDays: z.number().int().min(1).max(90).default(30)
});

const fundLoanSchema = z.object({
  loanId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Loan ID'),
  amount: z.number().min(100, 'Minimum contribution amount is ₹100'),
  fundingOption: z.enum(['full_funding', 'partial_funding']).default('partial_funding')
});

const createFundingGroupSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  description: z.string().min(15, 'Description is required'),
  groupModel: z.enum(['model_a_one_borrower', 'model_b_group_borrowing', 'model_c_community_funding']),
  category: z.enum(['education', 'small_business', 'emergency_relief', 'community_project', 'agriculture', 'healthcare', 'other']),
  targetAmount: z.number().min(1000, 'Target amount must be at least ₹1,000'),
  durationDays: z.number().int().min(1).max(180).default(30),
  privacy: z.enum(['public', 'private_invite_only']).default('public'),
  financialCategory: z.enum(['donation_based', 'loan_based', 'investment_based']).default('loan_based'),
  interestRateAnnual: z.number().min(0).max(36).default(0),
  durationMonths: z.number().int().min(1).max(60).default(12)
});

const contributeCampaignSchema = z.object({
  campaignId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Campaign ID'),
  amount: z.number().min(50, 'Minimum contribution is ₹50'),
  contributionType: z.enum(['donation', 'loan_contribution', 'investment_pledge']),
  isAnonymous: z.boolean().default(false)
});

module.exports = {
  registerSchema,
  loginSchema,
  kycSubmitSchema,
  verifyAadhaarSchema,
  verifyPanSchema,
  sendMobileOtpSchema,
  verifyMobileOtpSchema,
  createLoanSchema,
  fundLoanSchema,
  createFundingGroupSchema,
  contributeCampaignSchema
};
