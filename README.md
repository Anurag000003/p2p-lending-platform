# Peer-to-Peer (P2P) Lending, Borrowing and Group Funding Platform

> Complete full-stack MERN platform supporting **Individual Borrowing**, **Individual Lending**, and **Group Funding** (Model A, B, and C) with an automated financial calculation engine and double-entry accounting ledger.

---

## 1. Features Summary

### A. Individual Borrowing
- Submit custom loan requests with specific amount, purpose, duration, and interest rate.
- Automated heuristic credit risk grading (`A+` to `D`) and default probability assessment.
- Borrower dashboard tracking total requested, funded progress, upcoming monthly EMIs, and repayment history.

### B. Individual Lending
- Public lending marketplace with search and filters (purpose, risk grade, interest rates).
- Support for **Full Funding** and **Partial / Fractional Funding** starting from ₹100.
- Lender dashboard with expected returns analytics, principal recovered, interest earned, and portfolio charts.

### C. Group Funding (Three Supported Models)
- **Model A (Single Borrower Crowd-Lending):** Multiple contributors fund a single borrower goal.
- **Model B (Group Co-Borrowing):** Multiple co-borrowers share an approved group debt with tracked individual obligations.
- **Model C (Community Funding):** Community impact campaigns with strict legal separation between **Donation-based**, **Loan-based**, and **Investment-based** structures.
- Private circles with 8-character invite codes and progress tracking.

### D. Financial Engine & Double-Entry Ledger
- Reducing balance amortization schedule calculation.
- Proportional repayment distribution among all participating lenders upon borrower EMI payment.
- Internal double-entry ledger (`LedgerAccount` and `LedgerEntry`) enforcing strict reconciliation across user wallets and escrows.
- Atomic transaction protection against over-funding race conditions.

### E. Administrative Governance
- Comprehensive dashboard: platform loan volume, disbursed capital, and active users.
- Identity KYC verification review queue with instant approval/rejection.
- User management with instant account suspension controls.
- Immutable security audit logs tracking every financial action.

---

## 2. Project Structure

```
p2p-lending-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth, KYC, Loan, Lending, Group, Repayment, Admin
│   │   ├── integrations/     # Payment gateway service (Simulated / Razorpay)
│   │   ├── ledger/           # Double-entry accounting service
│   │   ├── middleware/       # JWT authentication, role guards, audit trails
│   │   ├── models/           # All 19 Mongoose data schemas
│   │   ├── routes/           # RESTful API routing
│   │   ├── services/         # Financial calculation engine & risk scoring
│   │   ├── validators/       # Zod schema input validation
│   │   └── server.js         # Express app & Socket.io server
│   ├── tests/
│   │   └── runTests.js       # Automated test suite for calculations & ledger splits
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Footer
│   │   ├── context/          # Auth & user state context
│   │   ├── pages/            # 10 Responsive modern pages
│   │   └── services/         # Axios API client
│   ├── index.html
│   └── vite.config.js
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── DATABASE_DOCUMENTATION.md
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017` or via Docker.

### Installation

1. **Install Backend Dependencies:**
   ```bash
   cd p2p-lending-platform/backend
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

3. **Seed Sample Data:**
   ```bash
   cd ../backend
   npm run seed
   ```

4. **Run Automated Test Suite:**
   ```bash
   npm test
   ```

5. **Start Development Servers:**
   - **Backend API (Port 5000):**
     ```bash
     cd backend
     npm run dev
     ```
   - **Frontend (Port 5173):**
     ```bash
     cd frontend
     npm run dev
     ```

---

## 4. Default Seeded Test Accounts

| Role | Email | Password | Purpose |
|---|---|---|---|
| **Admin** | `admin@p2p.com` | `Admin@1234` | Full platform governance, KYC approvals, audit logs |
| **Borrower** | `borrower@demo.com` | `Pass@1234` | Request loans, pay EMIs, track upcoming schedule |
| **Lender** | `lender@demo.com` | `Pass@1234` | Fund loans partially or fully, monitor returns |
