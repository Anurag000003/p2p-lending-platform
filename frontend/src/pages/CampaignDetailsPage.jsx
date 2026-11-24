import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, HeartHandshake, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contribution Form State
  const [amount, setAmount] = useState(1000);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/groups/campaigns/${id}`);
      if (res.data.success) {
        setCampaign(res.data.campaign);
        setContributions(res.data.contributions || []);
        setMembers(res.data.members || []);
      }
    } catch (err) {
      console.error('Failed to load campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      let contributionType = 'loan_contribution';
      if (campaign.fundingNature === 'donation') contributionType = 'donation';
      else if (campaign.fundingNature === 'investment') contributionType = 'investment_pledge';

      const res = await API.post('/groups/campaigns/contribute', {
        campaignId: campaign._id,
        amount: Number(amount),
        contributionType,
        isAnonymous
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Thank you! Your contribution of ₹${Number(amount).toLocaleString()} has been confirmed.`
        });
        fetchCampaign();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit contribution'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading campaign...
      </div>
    );
  }

  if (!campaign) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">Campaign not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Campaigns
      </button>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700/80 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase">
                {campaign.modelType.replace('_', ' ')}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                {campaign.fundingNature}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">{campaign.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Organized by <span className="text-white font-semibold">{campaign.organizerId?.name}</span> · Group Ref: <span className="font-mono text-teal-400">{campaign.groupId?.groupReference}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Target Amount</div>
            <div className="text-3xl font-bold font-display text-teal-400">₹{campaign.targetAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Funding Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Collected: ₹{campaign.confirmedAmount.toLocaleString()} ({campaign.progressPercent}%)</span>
            <span className="text-teal-400 font-semibold">Remaining: ₹{campaign.remainingAmount.toLocaleString()}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${campaign.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Description & Contribution Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-3">
            <h3 className="text-base font-bold text-white font-display">Campaign Objective & Purpose</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{campaign.description}</p>
          </div>

          {/* Contributors History */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-4">
            <h3 className="text-base font-bold text-white font-display flex items-center justify-between">
              <span>Backers & Contributions</span>
              <span className="text-xs font-normal text-slate-400">{contributions.length} total contributions</span>
            </h3>

            {contributions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Be the first to contribute to this campaign!</p>
            ) : (
              <div className="space-y-2">
                {contributions.map((c) => (
                  <div key={c._id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">
                        {c.isAnonymous ? 'Anonymous Supporter' : c.contributorId?.name || 'Supporter'}
                      </div>
                      <div className="text-[11px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="font-bold text-teal-400">₹{c.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contribution Action Widget */}
        <div>
          {campaign.status === 'active' ? (
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-teal-500/40 shadow-2xl space-y-5">
              <h3 className="text-base font-bold text-white font-display">Back This Campaign</h3>

              {message.text && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleContribute} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contribution Amount (₹)</label>
                  <input
                    type="number"
                    min="50"
                    max={campaign.remainingAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-teal-500"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1">Min ₹50 · Max ₹{campaign.remainingAmount.toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
                  />
                  <label htmlFor="anon" className="text-slate-400 select-none cursor-pointer">
                    Contribute anonymously
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm Contribution'}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700 text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-teal-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Target Goal Reached</h4>
              <p className="text-xs text-slate-400">This campaign has met its funding target and is being prepared for disbursement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsPage;
