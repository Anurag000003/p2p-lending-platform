import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Users, Search, Plus, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelType, setModelType] = useState('all');
  const [fundingNature, setFundingNature] = useState('all');
  const [search, setSearch] = useState('');

  // Join group with invite code modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinMessage, setJoinMessage] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, [modelType, fundingNature]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (modelType !== 'all') params.modelType = modelType;
      if (fundingNature !== 'all') params.fundingNature = fundingNature;
      if (search) params.search = search;

      const res = await API.get('/groups/campaigns', { params });
      if (res.data.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWithCode = async (e) => {
    e.preventDefault();
    try {
      setJoinMessage('');
      const res = await API.post('/groups/join', { inviteCode });
      if (res.data.success) {
        setJoinMessage(res.data.message);
        setTimeout(() => setJoinModalOpen(false), 2000);
      }
    } catch (err) {
      setJoinMessage(err.response?.data?.message || 'Failed to join group');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-semibold mb-2">
            <Users className="h-3.5 w-3.5" /> Community & Shared Borrowing
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Group Funding Campaigns</h1>
          <p className="text-slate-400 text-xs mt-1">
            Back student education, medical assistance, co-borrower projects, and community micro-finance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setJoinModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Join with Invite Code
          </button>
          <Link
            to="/campaigns/create"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Start a Group Campaign
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCampaigns()}
            placeholder="Search campaigns by keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto text-xs">
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Group Models</option>
            <option value="model_a">Model A: Single Borrower (Crowd)</option>
            <option value="model_b">Model B: Group Co-Borrowing</option>
            <option value="model_c">Model C: Community Impact</option>
          </select>

          <select
            value={fundingNature}
            onChange={(e) => setFundingNature(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Funding Natures</option>
            <option value="loan">Loan (Repayment Required)</option>
            <option value="donation">Donation (Grant / Relief)</option>
            <option value="investment">Investment Return</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-slate-800/40 border border-slate-700 animate-pulse p-6" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-slate-800/20 border border-dashed border-slate-800">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No campaigns found</h3>
          <p className="text-xs text-slate-400 mt-1">Start a campaign to rally support for a community or personal goal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(camp => (
            <div
              key={camp._id}
              className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/70 hover:border-teal-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase">
                    {camp.modelType.replace('_', ' ')}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    camp.fundingNature === 'donation' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {camp.fundingNature.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-display line-clamp-1">{camp.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{camp.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Funding Target</span>
                    <div className="font-bold text-white">₹{camp.targetAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Contributors</span>
                    <div className="font-bold text-teal-400">{camp.contributorCount} Backers</div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Collected: ₹{camp.confirmedAmount.toLocaleString()} ({camp.progressPercent}%)</span>
                    <span className="text-teal-400 font-semibold">Remaining: ₹{camp.remainingAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${camp.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-700/60 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  By: <span className="text-slate-300 font-medium">{camp.organizerId?.name || 'Organizer'}</span>
                </div>
                <Link
                  to={`/campaigns/${camp._id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  View Campaign <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join with Invite Code Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white font-display">Join Private Group / Borrowing Circle</h3>
            <p className="text-xs text-slate-400">Enter the 8-character invite code provided by the group organizer.</p>

            {joinMessage && (
              <div className="p-3 rounded-xl bg-slate-800 text-xs text-emerald-400 border border-emerald-500/30">
                {joinMessage}
              </div>
            )}

            <form onSubmit={handleJoinWithCode} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Invite Code</label>
                <input
                  type="text"
                  maxLength={8}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GRP-4A9X"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase tracking-widest text-center text-sm font-bold focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                >
                  Confirm & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
