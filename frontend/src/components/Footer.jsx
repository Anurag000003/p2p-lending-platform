import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, HeartHandshake } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                P
              </div>
              <span className="font-display font-bold text-base text-white">PeerFund Platform</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Modern, secure, and regulatory-aware P2P lending, borrowing, and community group funding architecture with verified server-side ledgers.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" /> 100% Verified Accounts & KYC
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Borrowers</h4>
            <ul className="space-y-2">
              <li><Link to="/borrower/create-loan" className="hover:text-emerald-400">Request a Loan</Link></li>
              <li><Link to="/borrower/dashboard" className="hover:text-emerald-400">Borrower Dashboard</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400">Repayment Calculators</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Lenders & Groups</h4>
            <ul className="space-y-2">
              <li><Link to="/marketplace" className="hover:text-emerald-400">Lending Marketplace</Link></li>
              <li><Link to="/campaigns" className="hover:text-emerald-400">Group Funding Campaigns</Link></li>
              <li><Link to="/lender/dashboard" className="hover:text-emerald-400">Portfolio & Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Legal & Risk Notice</h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Expected returns are not guaranteed returns. Loans carry inherent credit risk including possible delayed repayment or borrower default. Double-entry internal ledger enforces strict balance reconciliation.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} PeerFund P2P Platform. All rights reserved.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
