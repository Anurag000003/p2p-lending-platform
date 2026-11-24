import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldCheck, Users, AlertCircle, CheckCircle, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingKycs, setPendingKycs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, kycRes, logsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/kyc/pending'),
        API.get('/admin/audit-logs')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (kycRes.data.success) setPendingKycs(kycRes.data.kycs);
      if (logsRes.data.success) setAuditLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKycReview = async (kycId, decision) => {
    try {
      const res = await API.post(`/admin/kyc/${kycId}/review`, { decision });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await API.put(`/admin/users/${userId}/status`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading administrative control center...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> Platform Governance & Oversight
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Administrator Control Panel</h1>
          <p className="text-slate-400 text-xs mt-1">Audit transactions, verify KYC identities, and monitor platform compliance.</p>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold">
          {['overview', 'kyc', 'users', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                activeTab === tab ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'kyc' ? `KYC (${pendingKycs.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-400 text-xs">Total Users</span>
              <div className="text-2xl font-bold font-display text-white mt-1">{stats?.totalUsers || 0}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-400 text-xs">Active Loans</span>
              <div className="text-2xl font-bold font-display text-emerald-400 mt-1">{stats?.activeLoans || 0}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-400 text-xs">Pending KYCs</span>
              <div className="text-2xl font-bold font-display text-amber-400 mt-1">{stats?.pendingKYCs || 0}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-400 text-xs">Total Disbursed Volume</span>
              <div className="text-2xl font-bold font-display text-teal-400 mt-1">₹{(stats?.totalVolumeDisbursed || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* KYC REVIEWS TAB */}
      {activeTab === 'kyc' && (
        <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-white font-display">Pending Identity Applications</h3>
          {pendingKycs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No KYC submissions waiting for manual review.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="pb-3">User</th>
                    <th className="pb-3">Document Type</th>
                    <th className="pb-3">Doc Number</th>
                    <th className="pb-3">Submitted Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {pendingKycs.map((k) => (
                    <tr key={k._id} className="text-slate-300">
                      <td className="py-3 font-semibold text-white">
                        {k.userId?.name} <div className="text-[10px] text-slate-500 font-normal">{k.userId?.email}</div>
                      </td>
                      <td className="py-3 uppercase font-mono">{k.documentType}</td>
                      <td className="py-3 font-mono">{k.documentNumber}</td>
                      <td className="py-3 text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => handleKycReview(k._id, 'approved')}
                          className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleKycReview(k._id, 'rejected')}
                          className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-white font-display">Registered User Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Roles</th>
                  <th className="pb-3">KYC Status</th>
                  <th className="pb-3">Wallet</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="text-slate-300">
                    <td className="py-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3 uppercase text-[10px] text-teal-400 font-bold">{u.roles?.join(', ')}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.kycStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">₹{(u.walletBalance || 0).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u._id, u.status)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          u.status === 'active' ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-white font-display">System Audit Logs (Double-Entry Events)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Entity</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="text-slate-300 text-[11px]">
                    <td className="py-2.5 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 text-amber-300 font-bold">{log.action}</td>
                    <td className="py-2.5 text-slate-400">{log.entityType}</td>
                    <td className="py-2.5 text-white">{log.userId?.name || 'System'}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
