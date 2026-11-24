import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Percent, Clock, Calendar, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const LoanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loan, setLoan] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [repaymentSchedule, setRepaymentSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Funding modal / form state
  const [fundingOption, setFundingOption] = useState('partial_funding');
  const [fundAmount, setFundAmount] = useState(5000);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLoan();
  }, [id]);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/loans/${id}`);
      if (res.data.success) {
        setLoan(res.data.loan);
        setRiskAssessment(res.data.riskAssessment);
        setRepaymentSchedule(res.data.repaymentSchedule || []);
        if (res.data.loan.remainingAmount > 0) {
          setFundAmount(Math.min(5000, res.data.loan.remainingAmount));
        }
      }
    } catch (err) {
      console.error('Failed to load loan details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFundSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      const amountToFund = fundingOption === 'full_funding' ? loan.remainingAmount : Number(fundAmount);

      const res = await API.post('/lending/fund', {
        loanId: loan._id,
        amount: amountToFund,
        fundingOption
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Success! You funded ₹${amountToFund.toLocaleString()} toward this loan.`
        });
        fetchLoan(); // refresh state
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to complete lending contribution'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading loan specifications...
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        Loan record not found.
      </div>
    );
  }

  const fundedPercent = Math.min(100, Math.round((loan.fundedAmount / loan.amount) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Marketplace
      </button>

      {/* Header Info */}
      <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700/80 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                {loan.loanReference}
              </span>
              <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Status: {loan.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">{loan.title}</h1>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Requested Amount</div>
            <div className="text-3xl font-bold font-display text-emerald-400">₹{loan.amount.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Funded: ₹{loan.fundedAmount.toLocaleString()} ({fundedPercent}%)</span>
            <span className="text-emerald-400 font-semibold">Remaining to Goal: ₹{loan.remainingAmount.toLocaleString()}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${fundedPercent}%` }}
            />
          </div>
        </div>

        {/* Key Loan Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/80 text-xs">
          <div>
            <span className="text-slate-400">Interest Rate</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{loan.interestRateAnnual}% p.a.</div>
          </div>
          <div>
            <span className="text-slate-400">Duration</span>
            <div className="text-base font-bold text-white mt-0.5">{loan.durationMonths} Months</div>
          </div>
          <div>
            <span className="text-slate-400">Risk Grade</span>
            <div className="text-base font-bold text-teal-400 mt-0.5">{loan.riskGrade}</div>
          </div>
          <div>
            <span className="text-slate-400">Repayment Mode</span>
            <div className="text-base font-bold text-white mt-0.5 capitalize">{loan.repaymentFrequency}</div>
          </div>
        </div>
      </div>

      {/* Main Content & Contribution Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Loan Purpose & Risk Insights */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-3">
            <h3 className="text-base font-bold text-white font-display">Loan Purpose & Details</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{loan.description}</p>
          </div>

          {riskAssessment && (
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Automated Risk & Credit Score
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60">
                  <div className="text-slate-400">Credit Rating Score</div>
                  <div className="text-lg font-bold text-white mt-0.5">{riskAssessment.overallScore} / 100</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60">
                  <div className="text-slate-400">Default Probability</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {(riskAssessment.defaultProbability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">{riskAssessment.assessmentNotes}</p>
            </div>
          )}
        </div>

        {/* Right Column: Funding Widget */}
        <div>
          {loan.status === 'open_for_funding' ? (
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-emerald-500/40 shadow-2xl space-y-5">
              <h3 className="text-base font-bold text-white font-display">Fund This Loan</h3>

              {message.text && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleFundSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Select Contribution Option</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFundingOption('partial_funding')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        fundingOption === 'partial_funding'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-slate-700 bg-slate-900 text-slate-400'
                      }`}
                    >
                      Partial Funding
                    </button>
                    <button
                      type="button"
                      onClick={() => setFundingOption('full_funding')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        fundingOption === 'full_funding'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-slate-700 bg-slate-900 text-slate-400'
                      }`}
                    >
                      Full Funding
                    </button>
                  </div>
                </div>

                {fundingOption === 'partial_funding' ? (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Contribution Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max={loan.remainingAmount}
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">Min ₹100 · Max ₹{loan.remainingAmount.toLocaleString()}</div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                    <div className="text-slate-400 text-[11px]">Total Remaining to Fund:</div>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">₹{loan.remainingAmount.toLocaleString()}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Confirming Transaction...' : 'Confirm Lending Contribution'}
                </button>
              </form>

              <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-700/60 pt-3">
                * Simulated server-side ledger transaction. Monthly repayments are automatically distributed to your wallet.
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700 text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Loan is Fully Funded</h4>
              <p className="text-xs text-slate-400">This request has completed funding and is in the active repayment stage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsPage;
