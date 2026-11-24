import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Coins, Plus, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const BorrowerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repayingId, setRepayingId] = useState(null);
  const [repayMessage, setRepayMessage] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/loans/my-borrowings');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load borrower dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (scheduleId) => {
    try {
      setRepayingId(scheduleId);
      setRepayMessage('');
      const res = await API.post('/repayments/pay', { scheduleId });
      if (res.data.success) {
        setRepayMessage('Payment successful! Installment marked as paid.');
        fetchDashboard();
      }
    } catch (err) {
      setRepayMessage(err.response?.data?.message || 'Payment failed');
    } finally {
      setRepayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading borrower financial metrics...
      </div>
    );
  }

  const { summary, loans, upcomingInstallments } = data || {
    summary: { totalRequested: 0, totalFunded: 0, activeOutstanding: 0 },
    loans: [],
    upcomingInstallments: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">Borrower Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Track funding progress, pending installments, and repayment schedules.</p>
        </div>
        <Link
          to="/borrower/create-loan"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 w-fit"
        >
          <Plus className="h-4 w-4" /> Request New Loan
        </Link>
      </div>

      {repayMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          {repayMessage}
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80">
          <div className="text-xs text-slate-400 font-medium">Total Amount Borrowed</div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
            ₹{summary.totalRequested.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">{summary.loansCount} loan requests created</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80">
          <div className="text-xs text-slate-400 font-medium">Total Funded by Peers</div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-400 mt-1">
            ₹{summary.totalFunded.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-2">Disbursed to wallet upon 100% funding</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80">
          <div className="text-xs text-slate-400 font-medium">Active Outstanding Principal</div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-teal-400 mt-1">
            ₹{summary.activeOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Scheduled across active loans</div>
        </div>
      </div>

      {/* Upcoming Repayment Installments */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
        <h3 className="text-base font-bold text-white font-display">Upcoming Installments</h3>
        {upcomingInstallments.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No upcoming installments due at this time.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="pb-3">Loan Reference</th>
                  <th className="pb-3">Installment #</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Principal</th>
                  <th className="pb-3">Interest</th>
                  <th className="pb-3">Total Due</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {upcomingInstallments.map((inst) => (
                  <tr key={inst._id} className="text-slate-300">
                    <td className="py-3 font-mono font-medium text-white">{inst.loanId?.loanReference}</td>
                    <td className="py-3 font-semibold">Installment #{inst.installmentNumber}</td>
                    <td className="py-3 text-slate-400">{new Date(inst.dueDate).toLocaleDateString()}</td>
                    <td className="py-3">₹{inst.principalAmount.toLocaleString()}</td>
                    <td className="py-3 text-emerald-400">₹{inst.interestAmount.toLocaleString()}</td>
                    <td className="py-3 font-bold text-white">₹{inst.totalInstallmentAmount.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handlePayInstallment(inst._id)}
                        disabled={repayingId === inst._id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50"
                      >
                        {repayingId === inst._id ? 'Processing...' : 'Pay EMI'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loan History List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white font-display">My Loan Requests</h3>
        {loans.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-800/20 border border-slate-800 text-center text-xs text-slate-400">
            You haven't requested any loans yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loans.map((loan) => {
              const progress = Math.min(100, Math.round((loan.fundedAmount / loan.amount) * 100));
              return (
                <div key={loan._id} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-400">{loan.loanReference}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                      {loan.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{loan.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Amount: ₹{loan.amount.toLocaleString()} · {loan.durationMonths}m @ {loan.interestRateAnnual}%</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Funded: ₹{loan.fundedAmount.toLocaleString()} ({progress}%)</span>
                      <span>Target: ₹{loan.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link to={`/loans/${loan._id}`} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1">
                      View Full Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowerDashboard;
