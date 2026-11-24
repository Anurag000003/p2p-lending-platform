/**
 * Automated Test Suite for P2P Lending, Borrowing and Group Funding Engine
 */

const CalculationEngine = require('../src/services/calculationEngine');

let passedCount = 0;
let totalCount = 0;

function assert(condition, testName) {
  totalCount++;
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
  }
}

console.log('\n======================================================');
console.log(' RUNNING P2P FINANCIAL ENGINE AUTOMATED TESTS');
console.log('======================================================\n');

// 1. Test Monthly Reducing Balance EMI
console.log('[Test Suite 1: EMI Calculation Engine]');
const emi1 = CalculationEngine.calculateMonthlyEmi(100000, 12, 12);
assert(emi1 >= 8880 && emi1 <= 8890, 'Monthly EMI for ₹1,00,000 at 12% for 12m is ~₹8,885');

const emiZeroRate = CalculationEngine.calculateMonthlyEmi(60000, 0, 6);
assert(emiZeroRate === 10000, 'Zero-interest loan EMI equals exact principal division');

// 2. Test Amortization Schedule Reconciliation
console.log('\n[Test Suite 2: Amortization Schedule Reconciliation]');
const scheduleObj = CalculationEngine.generateAmortizationSchedule(50000, 14, 6);
assert(scheduleObj.installments.length === 6, 'Generates exact 6 monthly installments');
assert(scheduleObj.installments[5].remainingLoanBalance === 0, 'Last installment reduces remaining principal balance to exactly 0');
assert(scheduleObj.totalInterestPayable > 0, 'Total interest payable is accurately computed');

// 3. Test Proportional Repayment Distribution to Lenders
console.log('\n[Test Suite 3: Proportional Lender Payout Splits]');
const mockContributions = [
  { lenderId: 'L1', _id: 'C1', amount: 40000 },
  { lenderId: 'L2', _id: 'C2', amount: 60000 }
];
const payoutSplits = CalculationEngine.distributeRepaymentToLenders(10000, 1000, mockContributions);
assert(payoutSplits.length === 2, 'Distributes returns across all contributing lenders');
assert(payoutSplits[0].principalAmount === 4000, 'Lender 1 (40% pool) receives ₹4,000 principal');
assert(payoutSplits[1].principalAmount === 6000, 'Lender 2 (60% pool) receives ₹6,000 principal');
assert(payoutSplits[0].interestAmount === 400, 'Lender 1 receives 40% of interest (₹400)');
assert(payoutSplits[1].interestAmount === 600, 'Lender 2 receives 60% of interest (₹600)');

// 4. Test Group Funding Progress Math
console.log('\n[Test Suite 4: Group Funding Progress Mathematics]');
const prog1 = CalculationEngine.calculateFundingProgress(50000, 100000);
assert(prog1 === 50, '₹50,000 of ₹1,00,000 computes to exactly 50% progress');
const progCapped = CalculationEngine.calculateFundingProgress(120000, 100000);
assert(progCapped === 100, 'Funding progress is capped at 100%');

// 5. Test Risk Scoring Heuristic
console.log('\n[Test Suite 5: Automated Credit Risk Assessment]');
const primeProfile = {
  creditScore: 820,
  employment: { monthlyIncome: 120000 },
  completedLoansCount: 4,
  defaultedLoansCount: 0
};
const primeRisk = CalculationEngine.evaluateLoanRisk(primeProfile, 50000, 12);
assert(primeRisk.grade.startsWith('A'), 'High credit profile assigned Grade A/A+');
assert(primeRisk.defaultProbability < 0.05, 'Low default probability (< 5%) for prime borrowers');

console.log('\n======================================================');
console.log(` SUMMARY: ${passedCount} of ${totalCount} tests passed (${Math.round((passedCount/totalCount)*100)}%)`);
console.log('======================================================\n');

if (passedCount !== totalCount) {
  process.exit(1);
}
