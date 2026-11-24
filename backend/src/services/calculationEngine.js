/**
 * Financial Calculation Engine for P2P Lending, Repayments and Returns
 */

class CalculationEngine {
  /**
   * Monthly reducing balance EMI calculation formula
   * EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
   */
  static calculateMonthlyEmi(principal, annualRatePercent, durationMonths) {
    if (annualRatePercent <= 0) {
      return Math.round(principal / durationMonths);
    }
    const monthlyRate = (annualRatePercent / 12) / 100;
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
    const denominator = Math.pow(1 + monthlyRate, durationMonths) - 1;
    const emi = numerator / denominator;
    return Math.round(emi * 100) / 100;
  }

  /**
   * Generates a complete amortization schedule for a loan
   */
  static generateAmortizationSchedule(principal, annualRatePercent, durationMonths, startDate = new Date()) {
    const monthlyRate = (annualRatePercent / 12) / 100;
    const monthlyEmi = this.calculateMonthlyEmi(principal, annualRatePercent, durationMonths);
    
    let remainingBalance = principal;
    const schedule = [];
    let totalInterest = 0;

    for (let i = 1; i <= durationMonths; i++) {
      const interestForMonth = Math.round(remainingBalance * monthlyRate * 100) / 100;
      let principalForMonth = Math.round((monthlyEmi - interestForMonth) * 100) / 100;

      // Adjustment for the last installment to reconcile fractional cents
      if (i === durationMonths || principalForMonth > remainingBalance) {
        principalForMonth = remainingBalance;
      }

      const totalInstallment = Math.round((principalForMonth + interestForMonth) * 100) / 100;
      remainingBalance = Math.max(0, Math.round((remainingBalance - principalForMonth) * 100) / 100);
      totalInterest = Math.round((totalInterest + interestForMonth) * 100) / 100;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        installmentNumber: i,
        dueDate,
        principalAmount: principalForMonth,
        interestAmount: interestForMonth,
        totalInstallmentAmount: totalInstallment,
        remainingLoanBalance: remainingBalance,
        status: 'upcoming'
      });
    }

    return {
      monthlyEmi,
      totalInterestPayable: totalInterest,
      totalPayable: Math.round((principal + totalInterest) * 100) / 100,
      installments: schedule
    };
  }

  /**
   * Distributes a borrower repayment proportionally to all lenders
   */
  static distributeRepaymentToLenders(principalRepaid, interestRepaid, contributions) {
    const totalFunded = contributions.reduce((sum, c) => sum + c.amount, 0);

    return contributions.map(contrib => {
      const shareFraction = contrib.amount / totalFunded;
      const lenderPrincipal = Math.round(principalRepaid * shareFraction * 100) / 100;
      const lenderInterest = Math.round(interestRepaid * shareFraction * 100) / 100;

      return {
        lenderId: contrib.lenderId,
        contributionId: contrib._id,
        principalAmount: lenderPrincipal,
        interestAmount: lenderInterest,
        totalDistributed: Math.round((lenderPrincipal + lenderInterest) * 100) / 100
      };
    });
  }

  /**
   * Calculate group campaign progress
   */
  static calculateFundingProgress(confirmedAmount, targetAmount) {
    if (!targetAmount || targetAmount <= 0) return 0;
    const progress = (confirmedAmount / targetAmount) * 100;
    return Math.min(100, Math.round(progress * 10) / 10);
  }

  /**
   * Automated Risk Scoring Engine (Heuristic & Financial Analytics)
   */
  static evaluateLoanRisk(borrowerProfile, loanAmount, durationMonths) {
    const monthlyIncome = borrowerProfile?.employment?.monthlyIncome || 35000;
    const creditScore = borrowerProfile?.creditScore || 700;
    const completedLoans = borrowerProfile?.completedLoansCount || 0;
    const defaultedLoans = borrowerProfile?.defaultedLoansCount || 0;

    const monthlyEmiEstimate = this.calculateMonthlyEmi(loanAmount, 14, durationMonths);
    const dtiRatio = monthlyEmiEstimate / Math.max(1, monthlyIncome);

    let score = 50; // base score

    // Credit score weighting (max +30)
    if (creditScore >= 780) score += 30;
    else if (creditScore >= 720) score += 22;
    else if (creditScore >= 650) score += 12;
    else score -= 10;

    // Debt to income ratio (max +20)
    if (dtiRatio <= 0.20) score += 20;
    else if (dtiRatio <= 0.35) score += 12;
    else if (dtiRatio <= 0.50) score += 4;
    else score -= 15;

    // Past repayment track record
    score += Math.min(15, completedLoans * 5);
    score -= (defaultedLoans * 25);

    score = Math.max(15, Math.min(98, score));

    let grade = 'B';
    let defaultProbability = 0.05;

    if (score >= 88) { grade = 'A+'; defaultProbability = 0.015; }
    else if (score >= 80) { grade = 'A'; defaultProbability = 0.025; }
    else if (score >= 72) { grade = 'B+'; defaultProbability = 0.045; }
    else if (score >= 62) { grade = 'B'; defaultProbability = 0.075; }
    else if (score >= 50) { grade = 'C+'; defaultProbability = 0.12; }
    else if (score >= 38) { grade = 'C'; defaultProbability = 0.18; }
    else { grade = 'D'; defaultProbability = 0.28; }

    return {
      overallScore: score,
      grade,
      defaultProbability,
      dtiRatio: Math.round(dtiRatio * 100) / 100,
      monthlyEmiEstimate
    };
  }
}

module.exports = CalculationEngine;
