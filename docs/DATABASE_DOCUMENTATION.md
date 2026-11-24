# Database Documentation: Mongoose Data Models

The platform implements 19 dedicated Mongoose data models with relational cross-referencing and indexed fields.

| # | Model Name | Description & Key Fields |
|---|---|---|
| 1 | `User` | Core user identity, role permissions (`borrower`, `lender`, `organizer`, `admin`), wallet balance, KYC status. |
| 2 | `UserProfile` | Financial profile, employer, monthly/annual income, bank details, credit score (300-900). |
| 3 | `KYCApplication` | Aadhaar/PAN document references, document fronts/backs, verification photos, approval logs. |
| 4 | `Loan` | Core borrowing entity: amount, fundedAmount, remainingAmount, risk grade, status, interest rate, duration. |
| 5 | `LoanApplication` | Affordability verification, debt-to-income (DTI) metrics, supporting salary slips. |
| 6 | `LendingContribution` | Fractional or full lender investments: amount, pool share %, expected principal and interest return. |
| 7 | `FundingGroup` | Collaborative entity: groupModel (`model_a`, `model_b`, `model_c`), targetAmount, inviteCode. |
| 8 | `GroupMember` | Group participants, allocated debt, individual repayment obligation tracking. |
| 9 | `FundingCampaign` | Public/private campaign instance: goal, confirmed contributions, contributor count, deadline. |
| 10 | `CampaignContribution` | Contributor records (donation, loan contribution, or investment pledge). |
| 11 | `RepaymentSchedule` | Amortization schedule: installment number, due date, principal/interest split, status. |
| 12 | `Repayment` | Payment transaction receipt, method, and breakdown of distribution to each participating lender. |
| 13 | `PaymentTransaction` | Gateway-agnostic payment record (Razorpay simulated / captured, server-side verified signatures). |
| 14 | `LedgerAccount` | Internal double-entry chart of accounts: user wallets, system escrow, borrower payables. |
| 15 | `LedgerEntry` | Immutable debit/credit transactions ensuring zero balance reconciliation discrepancy. |
| 16 | `Notification` | System notifications, loan updates, payment reminders, KYC alerts. |
| 17 | `Dispute` | User and campaign dispute resolution workflow with admin assignment. |
| 18 | `AuditLog` | Comprehensive security audit trail (IP address, action type, entity modified, status). |
| 19 | `RiskAssessment` | Automated heuristic credit score, risk grading (A+ to D), default probability. |
