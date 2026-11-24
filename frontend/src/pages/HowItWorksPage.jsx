import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShieldCheck, ArrowRight, Layers, Users, Coins } from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold font-display text-white">How PeerFund Works</h1>
        <p className="text-slate-400 text-sm">
          A transparent financial bridge connecting verified borrowers, peer lenders, and collective community funding campaigns.
        </p>
      </div>

      {/* Process Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
        <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/70 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center font-mono">01</div>
          <h3 className="text-base font-bold text-white">Identity & KYC Verification</h3>
          <p className="text-slate-400 leading-relaxed">
            All users verify their identity using official Aadhaar/PAN documentation and income records to safeguard the lender pool.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/70 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-400 font-bold flex items-center justify-center font-mono">02</div>
          <h3 className="text-base font-bold text-white">Direct Marketplace Match</h3>
          <p className="text-slate-400 leading-relaxed">
            Loans are published with verified risk ratings. Multiple lenders can contribute fractional shares until 100% target is reached.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/70 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center font-mono">03</div>
          <h3 className="text-base font-bold text-white">Automated Double-Entry Repayment</h3>
          <p className="text-slate-400 leading-relaxed">
            Borrowers pay monthly EMIs on schedule. Our backend engine splits principal and interest proportionally across each lender's balance.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700 text-center space-y-4">
        <h3 className="text-xl font-bold font-display text-white">Ready to begin?</h3>
        <p className="text-xs text-slate-400">Join thousands of individuals achieving financial freedom and transparent yield.</p>
        <div className="flex justify-center gap-4 pt-2">
          <Link to="/register" className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400">
            Sign Up Now
          </Link>
          <Link to="/marketplace" className="px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs hover:bg-slate-700">
            View Loans
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
