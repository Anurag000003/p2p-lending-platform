import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { TrendingUp, Layers, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const LenderDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await API.get('/lending/portfolio');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading investment portfolio analytics...
      </div>
    );
  }

  const { portfolio, contributions } = data || {
    portfolio: { totalInvested: 0, principalRecovered: 0, interestReceived: 0, activeLoansCount: 0 },
    contributions: []
  };

  // Mock monthly yield projection curve
  const chartData = [
    { month: 'Jan', return: portfolio.interestReceived * 0.2 },
    { month: 'Feb', return: portfolio.interestReceived * 0.4 },
    { month: 'Mar', return: portfolio.interestReceived * 0.7 },
    { month: 'Apr', return: portfolio.interestReceived },
    { month: 'May (Proj)', return: portfolio.interestReceived + (portfolio.expectedInterestTotal * 0.2) },
    { month: 'Jun (Proj)', return: portfolio.interestReceived + (portfolio.expectedInterestTotal * 0.45) }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">Lender Portfolio</h1>
          <p className="text-slate-400 text-xs mt-1">Review active investments, principal returns, and interest distributions.</p>
        </div>
        <Link
          to="/marketplace"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 w-fit"
        >
          <Layers className="h-4 w-4" /> Discover New Loans
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80">
          <div className="text-xs text-slate-400 font-medium">Total Capital Lent</div>
          <div className="text-2xl font-bold font-display text-white mt-1">
            ₹{portfolio.totalInvested.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">{portfolio.totalInvestmentsCount} total loans funded</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80">
          <div className="text-xs text-slate-400 font-medium">Principal Recovered</div>
          <div className="text-2xl font-bold font-display text-teal-400 mt-1">
            ₹{portfolio.principalRecovered.toLocaleString()}
          </div>
          <div className="text-[11px] text-teal-500/80 mt-2">Returned safely to balance</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80">
          <div className="text-xs text-slate-400 font-medium">Total Interest Received</div>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
            ₹{portfolio.interestReceived.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-2">Net investment profit</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80">
          <div className="text-xs text-slate-400 font-medium">Active Outstanding Principal</div>
          <div className="text-2xl font-bold font-display text-cyan-400 mt-1">
            ₹{portfolio.activeOutstandingPrincipal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">In {portfolio.activeLoansCount} ongoing loans</div>
        </div>
      </div>

      {/* Visual Analytics Chart */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
        <h3 className="text-base font-bold text-white font-display">Cumulative Interest & Return Curve</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val) => [`₹${Math.round(val).toLocaleString()}`, 'Interest Received']}
              />
              <Area type="monotone" dataKey="return" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReturn)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
        <h3 className="text-base font-bold text-white font-display">My Funded Loan Contributions</h3>

        {contributions.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No loan contributions yet. Browse the marketplace to fund your first loan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="pb-3">Ref</th>
                  <th className="pb-3">Loan Title</th>
                  <th className="pb-3">Contributed</th>
                  <th className="pb-3">Pool Share</th>
                  <th className="pb-3">Expected Interest</th>
                  <th className="pb-3">Recovered (P + I)</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {contributions.map((c) => (
                  <tr key={c._id} className="text-slate-300">
                    <td className="py-3 font-mono font-medium text-white">{c.contributionReference}</td>
                    <td className="py-3 font-semibold text-white">{c.loanId?.title || 'Loan Request'}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{c.amount.toLocaleString()}</td>
                    <td className="py-3 text-slate-400">{c.sharePercentage}%</td>
                    <td className="py-3 text-teal-400 font-semibold">₹{c.expectedInterestReturn?.toLocaleString()}</td>
                    <td className="py-3 font-medium text-white">
                      ₹{((c.principalRecovered || 0) + (c.interestReceived || 0)).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 uppercase">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {c.loanId?._id && (
                        <Link to={`/loans/${c.loanId._id}`} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mandatory Regulatory Risk Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
        <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Important Risk Disclosure for Peer-to-Peer Lenders</div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5">
            P2P lending involves credit risk. Expected returns are estimated based on agreed loan terms and are not bank-guaranteed deposits. Borrowers may delay or default. Diversification across multiple loans is strongly recommended.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
