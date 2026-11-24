import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle,
  Coins,
  FileCheck2,
  Lock,
  PieChart,
  Scale
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Decentralized P2P Lending, Borrowing & Group Funding
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
            Transparent Financial Access for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Individuals & Groups</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Borrow at fair rates, lend directly to credit-verified peers for monthly returns, or collaborate in multi-contributor community group funding campaigns.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              Explore Loan Marketplace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/campaigns"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Browse Group Campaigns
            </Link>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 text-left">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-2xl font-bold font-display text-white">₹1.85 Cr+</div>
              <div className="text-xs text-slate-400 mt-1">Total Loan Volume Funded</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-2xl font-bold font-display text-emerald-400">12.5% - 18%</div>
              <div className="text-xs text-slate-400 mt-1">Avg. Historical Lender Returns</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-2xl font-bold font-display text-teal-400">99.2%</div>
              <div className="text-xs text-slate-400 mt-1">Verified On-Time Repayments</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-2xl font-bold font-display text-cyan-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Server-Side Verified Ledger</div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars: Individual Borrowing, Lending, Group Funding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Comprehensive Financial Architecture</h2>
          <p className="text-3xl font-extrabold font-display text-white">Three Distinct Funding Paradigms</p>
          <p className="text-slate-400 text-sm">Engineered with atomic database locks and automated repayment allocations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: Borrowing */}
          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">1. Individual Borrowing</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Submit custom loan requests with specific amounts, repayment frequencies, and proposed interest. Our automated risk scoring evaluates affordability to match you with individual or fractional lenders.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Fast verification & credit profiling</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Monthly reducing balance EMI schedule</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Transparent fees, zero hidden charges</li>
              </ul>
            </div>
            <Link to="/borrower/create-loan" className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300">
              Apply for a Loan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pillar 2: Lending */}
          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 hover:border-teal-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">2. Individual Lending</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Browse pre-vetted loan opportunities on the marketplace. Choose between full funding or fractional lending starting from ₹100. Automated payouts route monthly principal and interest returns to your wallet.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-400" /> Full or fractional loan participation</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-400" /> Detailed risk grades & verified records</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-400" /> Automated monthly lender return splits</li>
              </ul>
            </div>
            <Link to="/marketplace" className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300">
              Explore Marketplace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pillar 3: Group Funding */}
          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">3. Group Funding</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Support three flexible models: single borrower crowd loans, multi-participant shared borrowing, or community initiatives for education, health, and agriculture with clear legal boundaries.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-cyan-400" /> Model A: Multi-lender crowd funding</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-cyan-400" /> Model B: Co-borrower group debt splits</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-cyan-400" /> Model C: Community impact campaigns</li>
              </ul>
            </div>
            <Link to="/campaigns" className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300">
              Discover Campaigns <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Safety & Compliance Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" /> Enterprise Security & Verification
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Double-Entry Ledger & Verified Identity Protocols
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Every loan contribution, disbursement, and repayment is verified server-side through cryptographic signatures and logged onto an immutable double-entry ledger. All participants complete Aadhaar/PAN identity checks prior to funding.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm whitespace-nowrap shadow-lg shadow-emerald-500/20"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
