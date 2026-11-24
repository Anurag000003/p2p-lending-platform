import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Users, AlertCircle } from 'lucide-react';

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    groupModel: 'model_a_one_borrower',
    category: 'education',
    targetAmount: 100000,
    durationDays: 30,
    privacy: 'public',
    financialCategory: 'loan_based',
    interestRateAnnual: 12,
    durationMonths: 12
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await API.post('/groups', {
        ...formData,
        targetAmount: Number(formData.targetAmount),
        durationDays: Number(formData.durationDays),
        interestRateAnnual: Number(formData.interestRateAnnual),
        durationMonths: Number(formData.durationMonths)
      });

      if (res.data.success) {
        navigate('/campaigns');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-semibold mb-2">
          <Users className="h-3.5 w-3.5" /> Campaign Organizer
        </div>
        <h1 className="text-3xl font-extrabold font-display text-white">Start a Group Funding Campaign</h1>
        <p className="text-slate-400 text-xs mt-1">Configure your target goal, funding framework, and contribution terms.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Campaign Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Rural Health Center Solar Microgrid & Oxygen Project"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Group Funding Model</label>
            <select
              value={formData.groupModel}
              onChange={(e) => setFormData({ ...formData, groupModel: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="model_a_one_borrower">Model A: One Borrower (Crowd Funding)</option>
              <option value="model_b_group_borrowing">Model B: Group Co-Borrowing (Shared Debt)</option>
              <option value="model_c_community_funding">Model C: Community Impact / Project</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Financial Category</label>
            <select
              value={formData.financialCategory}
              onChange={(e) => setFormData({ ...formData, financialCategory: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="loan_based">Loan-Based (Subject to Repayment)</option>
              <option value="donation_based">Donation-Based (Grants / Relief)</option>
              <option value="investment_based">Investment-Based (Yield Contract)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Amount (₹)</label>
            <input
              type="number"
              min="1000"
              required
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="education">Education</option>
              <option value="small_business">Small Business</option>
              <option value="emergency_relief">Emergency Relief</option>
              <option value="community_project">Community Development</option>
              <option value="agriculture">Agriculture</option>
              <option value="healthcare">Healthcare</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deadline (Days)</label>
            <input
              type="number"
              min="1"
              max="180"
              required
              value={formData.durationDays}
              onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Campaign Narrative & Milestones</label>
          <textarea
            rows="4"
            required
            placeholder="Explain the background, why funding is needed, and accountability mechanisms..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Group Campaign'}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaignPage;
