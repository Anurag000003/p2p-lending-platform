const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const {
  User,
  UserProfile,
  Loan,
  LoanApplication,
  LendingContribution,
  FundingGroup,
  GroupMember,
  FundingCampaign,
  CampaignContribution,
  RepaymentSchedule,
  Repayment,
  PaymentTransaction,
  LedgerAccount,
  LedgerEntry,
  Notification,
  RiskAssessment
} = require('../models');

const CalculationEngine = require('../services/calculationEngine');

async function seed() {
  console.log('Seeding P2P Lending Platform development database...');
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/p2p_lending_platform';

  await mongoose.connect(MONGODB_URI);
  console.log('[Connected to MongoDB]');

  // Clean existing collections
  await Promise.all([
    User.deleteMany({}),
    UserProfile.deleteMany({}),
    Loan.deleteMany({}),
    LoanApplication.deleteMany({}),
    LendingContribution.deleteMany({}),
    FundingGroup.deleteMany({}),
    GroupMember.deleteMany({}),
    FundingCampaign.deleteMany({}),
    CampaignContribution.deleteMany({}),
    RepaymentSchedule.deleteMany({}),
    Repayment.deleteMany({}),
    PaymentTransaction.deleteMany({}),
    LedgerAccount.deleteMany({}),
    LedgerEntry.deleteMany({}),
    Notification.deleteMany({}),
    RiskAssessment.deleteMany({})
  ]);
  console.log('[Cleared old records]');

  // 1. Create Core Users
  const adminUser = new User({
    name: 'Chief Platform Administrator',
    email: 'admin@p2p.com',
    password: 'Admin@1234',
    phone: '9876543210',
    roles: ['admin', 'borrower', 'lender'],
    activeRole: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
    kycStatus: 'verified',
    walletBalance: 250000
  });
  await adminUser.save();

  const borrowerUser = new User({
    name: 'Ananya Sharma',
    email: 'borrower@demo.com',
    password: 'Pass@1234',
    phone: '9876543211',
    roles: ['borrower'],
    activeRole: 'borrower',
    isEmailVerified: true,
    isPhoneVerified: true,
    kycStatus: 'verified',
    walletBalance: 35000
  });
  await borrowerUser.save();

  const lenderUser1 = new User({
    name: 'Vikram Malhotra',
    email: 'lender@demo.com',
    password: 'Pass@1234',
    phone: '9876543212',
    roles: ['lender'],
    activeRole: 'lender',
    isEmailVerified: true,
    isPhoneVerified: true,
    kycStatus: 'verified',
    walletBalance: 500000
  });
  await lenderUser1.save();

  const lenderUser2 = new User({
    name: 'Suresh Patel',
    email: 'suresh@demo.com',
    password: 'Pass@1234',
    phone: '9876543213',
    roles: ['lender'],
    activeRole: 'lender',
    isEmailVerified: true,
    isPhoneVerified: true,
    kycStatus: 'verified',
    walletBalance: 400000
  });
  await lenderUser2.save();

  const organizerUser = new User({
    name: 'Kavita Iyer',
    email: 'organizer@demo.com',
    password: 'Pass@1234',
    phone: '9876543214',
    roles: ['organizer', 'borrower'],
    activeRole: 'organizer',
    isEmailVerified: true,
    isPhoneVerified: true,
    kycStatus: 'verified',
    walletBalance: 75000
  });
  await organizerUser.save();

  // Create UserProfiles
  await UserProfile.create([
    {
      userId: borrowerUser._id,
      employment: { status: 'employed', monthlyIncome: 65000, annualIncome: 780000 },
      creditScore: 745,
      completedLoansCount: 2
    },
    {
      userId: lenderUser1._id,
      employment: { status: 'business', monthlyIncome: 250000, annualIncome: 3000000 },
      creditScore: 810
    },
    {
      userId: organizerUser._id,
      employment: { status: 'self_employed', monthlyIncome: 85000, annualIncome: 1020000 },
      creditScore: 760
    }
  ]);

  console.log('[Users & Profiles created]');

  // 2. Create Sample Marketplace Loans
  const loan1 = new Loan({
    loanReference: 'LOAN-EDU-2026-001',
    borrowerId: borrowerUser._id,
    title: 'Masters in Data Science Semester Tuition',
    amount: 100000,
    fundedAmount: 40000,
    remainingAmount: 60000,
    purpose: 'education',
    description: 'Funding required for second semester tuition fees at University. Steady monthly repayment supported by salaried employment.',
    durationMonths: 12,
    interestRateAnnual: 12.5,
    repaymentFrequency: 'monthly',
    fundingType: 'individual',
    fundingDeadline: new Date(Date.now() + 20 * 86400000),
    status: 'open_for_funding',
    riskGrade: 'A',
    totalInterestPayable: 6940,
    outstandingPrincipal: 100000
  });
  await loan1.save();

  // Create initial partial contribution for loan 1
  await LendingContribution.create({
    contributionReference: 'LEND-INIT-001',
    lenderId: lenderUser1._id,
    loanId: loan1._id,
    amount: 40000,
    sharePercentage: 40,
    fundingOption: 'partial_funding',
    status: 'confirmed',
    expectedPrincipalReturn: 40000,
    expectedInterestReturn: 2776
  });

  const loan2 = new Loan({
    loanReference: 'LOAN-BIZ-2026-002',
    borrowerId: borrowerUser._id,
    title: 'Eco-Packaging Small Enterprise Inventory Expansion',
    amount: 250000,
    fundedAmount: 0,
    remainingAmount: 250000,
    purpose: 'business',
    description: 'Working capital to procure bulk biodegradable raw materials for confirmed B2B supply orders.',
    durationMonths: 18,
    interestRateAnnual: 14,
    repaymentFrequency: 'monthly',
    fundingType: 'individual',
    fundingDeadline: new Date(Date.now() + 25 * 86400000),
    status: 'open_for_funding',
    riskGrade: 'B+',
    totalInterestPayable: 29120,
    outstandingPrincipal: 250000
  });
  await loan2.save();

  // Fully Funded & Disbursed Loan with Active Schedule
  const loan3 = new Loan({
    loanReference: 'LOAN-MED-2026-003',
    borrowerId: borrowerUser._id,
    title: 'Knee Surgery & Rehabilitation Medical Loan',
    amount: 60000,
    fundedAmount: 60000,
    remainingAmount: 0,
    purpose: 'medical',
    description: 'Immediate surgical procedure and hospital recovery package.',
    durationMonths: 6,
    interestRateAnnual: 11,
    repaymentFrequency: 'monthly',
    fundingType: 'individual',
    fundingDeadline: new Date(Date.now() - 5 * 86400000),
    status: 'disbursed',
    riskGrade: 'A+',
    disbursedAt: new Date(Date.now() - 5 * 86400000),
    totalInterestPayable: 1945,
    outstandingPrincipal: 60000
  });
  await loan3.save();

  // Contributions for Loan 3
  await LendingContribution.create({
    contributionReference: 'LEND-INIT-002',
    lenderId: lenderUser2._id,
    loanId: loan3._id,
    amount: 60000,
    sharePercentage: 100,
    fundingOption: 'full_funding',
    status: 'disbursed',
    expectedPrincipalReturn: 60000,
    expectedInterestReturn: 1945
  });

  // Generate repayment schedule for Loan 3
  const amort3 = CalculationEngine.generateAmortizationSchedule(60000, 11, 6, new Date(Date.now() - 5 * 86400000));
  for (const inst of amort3.installments) {
    await RepaymentSchedule.create({
      loanId: loan3._id,
      borrowerId: borrowerUser._id,
      ...inst
    });
  }

  console.log('[Sample Loans & Contributions created]');

  // 3. Create Sample Group Funding Campaigns
  const group1 = new FundingGroup({
    groupReference: 'GRP-COMM-001',
    title: 'Community Skill Center Digital Literacy Lab',
    description: 'Equipping a local youth center with 15 refurbished workstations and internet access.',
    organizerId: organizerUser._id,
    groupModel: 'model_c_community_funding',
    category: 'community_project',
    targetAmount: 150000,
    collectedAmount: 65000,
    remainingAmount: 85000,
    deadline: new Date(Date.now() + 45 * 86400000),
    status: 'active',
    privacy: 'public',
    inviteCode: 'SKILL101',
    financialCategory: 'donation_based'
  });
  await group1.save();

  const camp1 = new FundingCampaign({
    campaignReference: 'CMP-SKILL-001',
    groupId: group1._id,
    organizerId: organizerUser._id,
    title: 'Community Skill Center Digital Literacy Lab',
    description: 'Equipping a local youth center with 15 refurbished workstations and internet access.',
    modelType: 'model_c',
    fundingNature: 'donation',
    targetAmount: 150000,
    confirmedAmount: 65000,
    remainingAmount: 85000,
    contributorCount: 2,
    deadline: new Date(Date.now() + 45 * 86400000),
    status: 'active'
  });
  await camp1.save();

  await CampaignContribution.create([
    {
      contributionReference: 'CCON-001',
      campaignId: camp1._id,
      groupId: group1._id,
      contributorId: lenderUser1._id,
      amount: 40000,
      contributionType: 'donation',
      status: 'confirmed'
    },
    {
      contributionReference: 'CCON-002',
      campaignId: camp1._id,
      groupId: group1._id,
      contributorId: lenderUser2._id,
      amount: 25000,
      contributionType: 'donation',
      status: 'confirmed'
    }
  ]);

  // Model B: Group Co-Borrowing
  const group2 = new FundingGroup({
    groupReference: 'GRP-AGRI-002',
    title: 'Organic Farmers Shared Cold-Storage Co-op',
    description: 'Four cooperative agricultural producers funding a shared solar cold-storage unit.',
    organizerId: organizerUser._id,
    groupModel: 'model_b_group_borrowing',
    category: 'agriculture',
    targetAmount: 200000,
    collectedAmount: 50000,
    remainingAmount: 150000,
    deadline: new Date(Date.now() + 30 * 86400000),
    status: 'active',
    privacy: 'public',
    inviteCode: 'AGRI2026',
    financialCategory: 'loan_based',
    interestRateAnnual: 10,
    durationMonths: 12
  });
  await group2.save();

  const camp2 = new FundingCampaign({
    campaignReference: 'CMP-AGRI-002',
    groupId: group2._id,
    organizerId: organizerUser._id,
    title: 'Organic Farmers Shared Cold-Storage Co-op',
    description: 'Four cooperative agricultural producers funding a shared solar cold-storage unit.',
    modelType: 'model_b',
    fundingNature: 'loan',
    targetAmount: 200000,
    confirmedAmount: 50000,
    remainingAmount: 150000,
    contributorCount: 1,
    deadline: new Date(Date.now() + 30 * 86400000),
    status: 'active'
  });
  await camp2.save();

  console.log('[Sample Group Campaigns & Contributions created]');

  console.log('====================================================');
  console.log(' P2P LENDING & GROUP FUNDING PLATFORM SEEDED');
  console.log(' Demo Accounts:');
  console.log('   Admin:    admin@p2p.com       / Admin@1234');
  console.log('   Borrower: borrower@demo.com   / Pass@1234');
  console.log('   Lender:   lender@demo.com     / Pass@1234');
  console.log('====================================================');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
