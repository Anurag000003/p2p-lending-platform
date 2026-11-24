# API Documentation: Peer-to-Peer Lending, Borrowing & Group Funding Platform

Base URL: `http://localhost:5000/api`

## 1. Authentication & User Profile
- `POST /auth/register` : Create borrower, lender or organizer account.
- `POST /auth/login` : Login with JWT token response.
- `GET /auth/me` : Fetch current authenticated user, wallet balance, and KYC status.
- `POST /auth/switch-role` : Dynamically toggle between borrower, lender, and organizer modes.

## 2. KYC Application & Compliance
- `POST /kyc/submit` : Upload Aadhaar, PAN, or Passport verification files.
- `GET /kyc/status` : Inspect verification approval status.
- `POST /kyc/instant-verify-dev` : Instant auto-verify helper for testing/development.

## 3. Individual Borrowing
- `POST /loans` : Create loan request (with requested amount, interest, duration, repayment frequency).
- `GET /loans/marketplace` : Discover public loans with filters (purpose, risk grade, rate).
- `GET /loans/my-borrowings` : Fetch borrower dashboard metrics and upcoming EMIs.
- `GET /loans/:id` : Fetch detailed loan spec, risk assessment, and amortization schedule.

## 4. Individual Lending
- `POST /lending/fund` : Fund an open loan fully or partially. Atomically updates ledger and loan progress.
- `GET /lending/portfolio` : Retrieve lender portfolio, returns, principal recovered, and expected interest.

## 5. Group Funding & Shared Borrowing
- `POST /groups` : Create funding group & linked campaign (Model A, Model B, Model C).
- `GET /groups/campaigns` : Browse active group campaigns.
- `GET /groups/campaigns/:id` : Retrieve campaign metrics, backers, and progress.
- `POST /groups/campaigns/contribute` : Back a campaign (Donation, Loan, or Investment).
- `POST /groups/join` : Join private group or co-borrowing circle with 8-character invite code.

## 6. Repayments & Double-Entry Distribution
- `POST /repayments/pay` : Pay scheduled loan installment. Distributes returns proportionally to lenders.
- `GET /repayments/schedule/:loanId` : Retrieve amortization schedule and past payment receipts.

## 7. Administrative Oversight
- `GET /admin/stats` : Platform overview (disbursed volume, active loans, open disputes).
- `GET /admin/users` : Manage and filter platform users.
- `PUT /admin/users/:userId/status` : Activate or suspend suspicious accounts.
- `GET /admin/kyc/pending` : Review pending identity verification applications.
- `POST /admin/kyc/:kycId/review` : Approve or reject KYC requests.
- `GET /admin/audit-logs` : Real-time immutable double-entry financial audit logs.
