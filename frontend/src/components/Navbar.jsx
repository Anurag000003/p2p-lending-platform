import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Wallet,
  Bell,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [roleDropdown, setRoleDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg shadow-emerald-500/20">
            P
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1">
            PeerFund <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">FINTECH</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/marketplace" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-emerald-400" /> Loan Marketplace
          </Link>
          <Link to="/campaigns" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Users className="h-4 w-4 text-teal-400" /> Group Campaigns
          </Link>
          <Link to="/verification" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> KYC & Verification
          </Link>
          <Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">
            How It Works
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Wallet indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-emerald-400">
                <Wallet className="h-3.5 w-3.5" />
                ₹{(user.walletBalance || 0).toLocaleString()}
              </div>

              {/* Role Switcher Pill */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdown(!roleDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/40 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Role: <span className="uppercase text-white">{user.activeRole}</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                </button>

                {roleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-1 text-xs z-50">
                    <div className="px-3 py-2 text-slate-400 border-b border-slate-700 font-medium">Switch Active Role</div>
                    {['borrower', 'lender', 'organizer'].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setRoleDropdown(false);
                          if (r === 'borrower') navigate('/borrower/dashboard');
                          if (r === 'lender') navigate('/lender/dashboard');
                          if (r === 'organizer') navigate('/campaigns');
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-700/50 flex items-center justify-between ${
                          user.activeRole === r ? 'text-emerald-400 font-bold bg-slate-700/30' : 'text-slate-200'
                        }`}
                      >
                        <span className="capitalize">{r}</span>
                        {user.activeRole === r && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    ))}
                    {user.roles?.includes('admin') && (
                      <Link
                        to="/admin"
                        onClick={() => setRoleDropdown(false)}
                        className="block px-3 py-2 text-amber-400 font-semibold hover:bg-slate-700/50 border-t border-slate-700"
                      >
                        Admin Control Panel
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Dashboard Action Link */}
              <Link
                to={user.activeRole === 'admin' ? '/admin' : user.activeRole === 'lender' ? '/lender/dashboard' : '/borrower/dashboard'}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                Dashboard
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Link to="/login" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white transition-colors">
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
