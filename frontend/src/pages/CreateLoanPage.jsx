import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Coins, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const CreateLoanPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    amount: 50000,
    purpose: 'education',
    durationMonths: 12,
    interestRateAnnual: 12,
    repaymentFrequency: 'monthly',
    fundingType: 'individual',
    description: '',
    fundingDurationDays: 30
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateEstimate = () => {
    const P = Number(formData.amount);
    const N = Number(formData.durationMonths);
    const R = (Number(formData.interestRateAnnual) / 12) / 100;
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPayable = emi * N;
    const totalInterest = totalPayable - P;
    return {
      emi: isNaN(emi) ? 0 : Math.round(emi),
      totalPayable: isNaN(totalPayable) ? 0 : Math.round(totalPayable),
      totalInterest: isNaN(totalInterest) ? 0 : Math.round(totalInterest)
    };
  };

  const estimates = calculateEstimate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await API.post('/loans', {
        ...formData,
        amount: Number(formData.amount),
        durationMonths: Number(formData.durationMonths),
        interestRateAnnual: Number(formData.interestRateAnnual),
        fundingDurationDays: Number(formData.fundingDurationDays)
      });

      if (res.data.success) {
        navigate('/borrower/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to create loan application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
          <Coins className="h-3.5 w-3.5" /> Borrowing Module
        </div>
        <h1 className="text-3xl font-extrabold font-display text-white">Create a Loan Request</h1>
        <p className="text-slate-400 text-xs mt-1">Specify your loan terms, reason, and interest rate. Lenders will fund your request directly.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Loan Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Higher Education Semester Fees"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Requested Amount (₹)</label>
              <input
                type="number"
                min="1000"
                max="5000000"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Loan Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="education">Education</option>
                <option value="business">Business Expansion</option>
                <option value="medical">Medical Treatment</option>
                <option value="home_improvement">Home Improvement</option>
                <option value="debt_consolidation">Debt Consolidation</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Repayment Duration (Months)</label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Proposed Annual Interest Rate (%)</label>
              <input
                type="number"
                min="1"
                max="36"
                step="0.5"
                required
                value={formData.interestRateAnnual}
                onChange={(e) => setFormData({ ...formData, interestRateAnnual: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Loan Description & Background</label>
            <textarea
              rows="4"
              required
              placeholder="Describe what the funds will be used for and your repayment plan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Publish Loan Request'}
          </button>
        </div>

        {/* Live Calculation Estimator */}
        <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-6 h-fit text-xs">
          <h3 className="text-base font-bold text-white font-display">Repayment Projection</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700">
              <span className="text-slate-400 text-[11px]">Estimated Monthly EMI</span>
              <div className="text-2xl font-bold font-display text-emerald-400 mt-0.5">
                ₹{estimates.emi.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Principal Amount:</span>
                <span className="font-semibold text-white">₹{Number(formData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest:</span>
                <span className="font-semibold text-emerald-400">₹{estimates.totalInterest.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white text-sm">
                <span>Total Payable:</span>
                <span>₹{estimates.totalPayable.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              * Monthly reducing balance calculation. No pre-closure penalty applies on this platform.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateLoanPage;
