import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  CreditCard,
  FileText,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const VerificationPage = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Mobile verification state
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [simulatedMobileOtp, setSimulatedMobileOtp] = useState('');

  // Aadhaar verification state
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarHolderName, setAadhaarHolderName] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [simulatedAadhaarOtp, setSimulatedAadhaarOtp] = useState('');

  // PAN verification state
  const [panNumber, setPanNumber] = useState('');
  const [panHolderName, setPanHolderName] = useState('');
  const [panLoading, setPanLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await API.get('/verify/summary');
      if (res.data.success) {
        setData(res.data.data);
        if (res.data.data.phone?.number) {
          setMobileNumber(res.data.data.phone.number);
        }
      }
    } catch (err) {
      console.error('Error fetching verification status', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Mobile Handlers
  const handleSendMobileOtp = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      setNotification({ type: 'error', message: 'Enter a valid 10-digit mobile number' });
      return;
    }
    try {
      setMobileLoading(true);
      setNotification({ type: '', message: '' });
      const res = await API.post('/verify/mobile/send-otp', { phone: mobileNumber });
      if (res.data.success) {
        setMobileOtpSent(true);
        setSimulatedMobileOtp(res.data.simulatedOtp || '');
        setNotification({ type: 'success', message: res.data.message });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setMobileLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (!mobileOtp) {
      setNotification({ type: 'error', message: 'Please enter the 6-digit OTP' });
      return;
    }
    try {
      setMobileLoading(true);
      setNotification({ type: '', message: '' });
      const res = await API.post('/verify/mobile/verify-otp', {
        phone: mobileNumber,
        otp: mobileOtp
      });
      if (res.data.success) {
        setNotification({ type: 'success', message: res.data.message });
        setMobileOtpSent(false);
        setMobileOtp('');
        fetchSummary();
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Invalid OTP' });
    } finally {
      setMobileLoading(false);
    }
  };

  // 2. Aadhaar Handlers
  const handleRequestAadhaarOtp = async () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setNotification({ type: 'error', message: 'Enter a valid 12-digit Aadhaar number' });
      return;
    }
    try {
      setAadhaarLoading(true);
      setNotification({ type: '', message: '' });
      const res = await API.post('/verify/aadhaar/request-otp', { aadhaarNumber });
      if (res.data.success) {
        setAadhaarOtpSent(true);
        setSimulatedAadhaarOtp(res.data.simulatedOtp || '');
        setNotification({ type: 'success', message: res.data.message });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to request UIDAI OTP' });
    } finally {
      setAadhaarLoading(false);
    }
  };

  const handleVerifyAadhaar = async () => {
    if (!aadhaarHolderName) {
      setNotification({ type: 'error', message: 'Enter name as on Aadhaar card' });
      return;
    }
    try {
      setAadhaarLoading(true);
      setNotification({ type: '', message: '' });
      const res = await API.post('/verify/aadhaar/verify', {
        aadhaarNumber,
        holderName: aadhaarHolderName,
        otp: aadhaarOtp
      });
      if (res.data.success) {
        setNotification({ type: 'success', message: res.data.message });
        setAadhaarOtpSent(false);
        setAadhaarOtp('');
        setAadhaarNumber('');
        fetchSummary();
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Aadhaar verification failed' });
    } finally {
      setAadhaarLoading(false);
    }
  };

  // 3. PAN Handlers
  const handleVerifyPan = async () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      setNotification({ type: 'error', message: 'Enter valid PAN (e.g. ABCDE1234F)' });
      return;
    }
    if (!panHolderName) {
      setNotification({ type: 'error', message: 'Enter full name as on PAN card' });
      return;
    }
    try {
      setPanLoading(true);
      setNotification({ type: '', message: '' });
      const res = await API.post('/verify/pan/verify', {
        panNumber: panNumber.toUpperCase(),
        holderName: panHolderName
      });
      if (res.data.success) {
        setNotification({ type: 'success', message: res.data.message });
        setPanNumber('');
        setPanHolderName('');
        fetchSummary();
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'PAN verification failed' });
    } finally {
      setPanLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="h-4 w-4" /> RBI & Regulatory Compliant KYC
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Identity & Trust Verification</h1>
          <p className="text-sm text-slate-400 mt-1">
            Verify your Mobile Number, Aadhaar Card, and PAN Card to unlock full peer-to-peer lending and borrowing features.
          </p>
        </div>

        {/* Overall Status Badge */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-right">
            <div className="text-xs text-slate-400">KYC Status</div>
            <div className={`text-sm font-bold capitalize ${
              data?.overallKycStatus === 'verified' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {data?.overallKycStatus === 'verified' ? 'Fully Verified' : 'Action Required'}
            </div>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
            data?.overallKycStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {data?.overallKycStatus === 'verified' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification.message && (
        <div className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 3 Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1: MOBILE VERIFICATION */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              {data?.phone?.isVerified ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                  Pending
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white text-base">Mobile Number OTP</h3>
              <p className="text-xs text-slate-400 mt-1">2-Factor authentication and instant transaction alerts.</p>
            </div>

            {data?.phone?.isVerified ? (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Verified Number</div>
                <div className="font-mono text-emerald-400 font-bold mt-0.5">+91 {data.phone.number}</div>
              </div>
            ) : (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">10-Digit Mobile Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {!mobileOtpSent ? (
                  <button
                    onClick={handleSendMobileOtp}
                    disabled={mobileLoading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50"
                  >
                    {mobileLoading ? 'Sending OTP...' : 'Send SMS OTP'}
                  </button>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {simulatedMobileOtp && (
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                        Demo OTP: <strong className="font-mono text-white text-xs">{simulatedMobileOtp}</strong> (or 123456)
                      </div>
                    )}
                    <label className="block text-slate-400 font-medium">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleVerifyMobileOtp}
                        disabled={mobileLoading}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-50"
                      >
                        {mobileLoading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                      <button
                        onClick={handleSendMobileOtp}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: AADHAAR CARD VERIFICATION */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              {data?.aadhaar?.status === 'verified' ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                  Pending
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white text-base">Aadhaar Card (UIDAI)</h3>
              <p className="text-xs text-slate-400 mt-1">Instant digital e-KYC authentication with UIDAI database.</p>
            </div>

            {data?.aadhaar?.status === 'verified' ? (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Aadhaar Verified</div>
                <div className="font-mono text-purple-400 font-bold">{data.aadhaar.number}</div>
                {data.aadhaar.name && <div className="text-slate-400 text-[11px]">Name: {data.aadhaar.name}</div>}
              </div>
            ) : (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">12-Digit Aadhaar Number</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="123456789012"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Legal Name as on Aadhaar</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={aadhaarHolderName}
                    onChange={(e) => setAadhaarHolderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {!aadhaarOtpSent ? (
                  <button
                    onClick={handleRequestAadhaarOtp}
                    disabled={aadhaarLoading}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all disabled:opacity-50"
                  >
                    {aadhaarLoading ? 'Requesting OTP...' : 'Request UIDAI OTP'}
                  </button>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {simulatedAadhaarOtp && (
                      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
                        UIDAI OTP: <strong className="font-mono text-white text-xs">{simulatedAadhaarOtp}</strong> (or 123456)
                      </div>
                    )}
                    <label className="block text-slate-400 font-medium">Enter UIDAI OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter UIDAI OTP"
                      value={aadhaarOtp}
                      onChange={(e) => setAadhaarOtp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono tracking-widest text-center focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleVerifyAadhaar}
                      disabled={aadhaarLoading}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50"
                    >
                      {aadhaarLoading ? 'Verifying...' : 'Complete Aadhaar e-KYC'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: PAN CARD VERIFICATION */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              {data?.pan?.status === 'verified' ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                  Pending
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white text-base">PAN Card (Income Tax)</h3>
              <p className="text-xs text-slate-400 mt-1">Direct verification against NSDL & Income Tax Department databases.</p>
            </div>

            {data?.pan?.status === 'verified' ? (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">PAN Verified</div>
                <div className="font-mono text-emerald-400 font-bold">{data.pan.number}</div>
                {data.pan.name && <div className="text-slate-400 text-[11px]">Name: {data.pan.name}</div>}
              </div>
            ) : (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Permanent Account Number (PAN)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name as on PAN Card</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={panHolderName}
                    onChange={(e) => setPanHolderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleVerifyPan}
                  disabled={panLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                >
                  {panLoading ? 'Verifying with NSDL...' : 'Verify PAN Card'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Safety & Compliance Information */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <Lock className="h-4 w-4 text-emerald-400" /> Bank-grade 256-bit Encryption & Data Privacy Guarantee
        </div>
        <p>
          Your Aadhaar and PAN numbers are transmitted securely via encrypted channels and verified directly with official government portals (UIDAI & Income Tax Department/NSDL). In compliance with UIDAI regulations, your full Aadhaar number is never stored in plaintext on our platform.
        </p>
      </div>
    </div>
  );
};

export default VerificationPage;
