import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Layers, Search, Filter, ShieldCheck, ArrowRight, Clock, Percent, Coins } from 'lucide-react';

const MarketplacePage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [purpose, setPurpose] = useState('all');
  const [riskGrade, setRiskGrade] = useState('all');

  useEffect(() => {
    fetchLoans();
  }, [purpose, riskGrade]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (purpose !== 'all') params.purpose = purpose;
      if (riskGrade !== 'all') params.riskGrade = riskGrade;
      if (search) params.search = search;

      const res = await API.get('/loans/marketplace', { params });
      if (res.data.success) {
        setLoans(res.data.loans);
      }
    } catch (err) {
      console.error('Failed to load marketplace loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLoans();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <Layers className="h-3.5 w-3.5" /> P2P Lending Marketplace
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Open Borrowing Opportunities</h1>
          <p className="text-slate-400 text-xs mt-1">Review verified loan listings and fund individual requests fully or partially.</p>
        </div>
        <Link
          to="/lender/dashboard"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-colors w-fit"
        >
          View My Portfolio
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by purpose, loan title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Purposes</option>
            <option value="education">Education</option>
            <option value="business">Business Expansion</option>
            <option value="medical">Medical</option>
            <option value="home_improvement">Home Renovation</option>
            <option value="personal">Personal</option>
          </select>

          <select
            value={riskGrade}
            onChange={(e) => setRiskGrade(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Risk Grades</option>
            <option value="A+">Grade A+ (Prime)</option>
            <option value="A">Grade A (High Quality)</option>
            <option value="B+">Grade B+ (Good)</option>
            <option value="B">Grade B (Standard)</option>
            <option value="C">Grade C (Higher Yield)</option>
          </select>
        </div>
      </div>

      {/* Loans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-slate-800/40 border border-slate-700 animate-pulse p-6" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-slate-800/20 border border-dashed border-slate-800">
          <Coins className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No active loans found matching criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try relaxing filters or check back shortly for new requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map(loan => {
            const fundedPercent = Math.min(100, Math.round((loan.fundedAmount / loan.amount) * 100));
            return (
              <div
                key={loan._id}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/70 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                      {loan.loanReference}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      loan.riskGrade.startsWith('A') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      loan.riskGrade.startsWith('B') ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      Risk Grade: {loan.riskGrade}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-display line-clamp-1">{loan.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{loan.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 text-xs">
                    <div>
                      <div className="text-[11px] text-slate-400">Target Amount</div>
                      <div className="text-sm font-bold text-white mt-0.5">₹{loan.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Annual Return</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">{loan.interestRateAnnual}% p.a.</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Duration</div>
                      <div className="text-slate-300 font-semibold">{loan.durationMonths} Months</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Frequency</div>
                      <div className="text-slate-300 capitalize">{loan.repaymentFrequency}</div>
                    </div>
                  </div>

                  {/* Funding Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Funded: ₹{loan.fundedAmount.toLocaleString()} ({fundedPercent}%)</span>
                      <span className="text-emerald-400 font-semibold">Remaining: ₹{loan.remainingAmount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${fundedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> KYC Verified
                  </div>
                  <Link
                    to={`/loans/${loan._id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    Fund Loan <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
