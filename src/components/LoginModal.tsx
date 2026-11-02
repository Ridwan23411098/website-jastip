import React, { useState } from 'react';
import {
  User,
  Shield,
  Bike,
  X,
  CheckCircle2,
  LogIn,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  KeyRound,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { UserRole, AuthUser } from '../types';
import { loginUser, registerCustomer, fastDemoLogin, getCurrentUser } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onLoginSuccess?: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status and error
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const user = loginUser(loginIdentifier, loginPassword);
      setSuccessMsg(`Berhasil masuk sebagai ${user.name} (${user.role.toUpperCase()})`);
      onSelectRole(user.role);
      if (onLoginSuccess) onLoginSuccess(user);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa kembali email dan kata sandi.');
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const user = registerCustomer(regName, regPhone, regEmail, regPassword);
      setSuccessMsg('Pendaftaran berhasil! Anda langsung masuk.');
      onSelectRole(user.role);
      if (onLoginSuccess) onLoginSuccess(user);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Pendaftaran gagal. Periksa data Anda.');
    }
  };

  // Quick 1-click Fast Demo Login
  const handleFastLogin = (role: UserRole) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const user = fastDemoLogin(role);
      setSuccessMsg(`Masuk cepat sebagai ${user.name}`);
      onSelectRole(role);
      if (onLoginSuccess) onLoginSuccess(user);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat akun demo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center transition absolute right-5 top-5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header with Profile Logo */}
        <div className="pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/mas-jastip-logo.png"
              alt="Logo Profil MAS JASTIP - purbolinggo -"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/50 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  MAS JASTIP
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                  - purbolinggo -
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Masuk ke akun pemesan, rider, atau admin
              </p>
            </div>
          </div>

          {/* Tab Switcher: Login vs Daftar */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg transition ${
                activeTab === 'login'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg transition ${
                activeTab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: FORM LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email / No. WhatsApp
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="admin@antaraja.id atau 081234567890"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md shadow-blue-600/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Masuk ke Akun</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: FORM REGISTER PELANGGAN */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Rina Kusuma"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="081234567890"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rina@gmail.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi (Min 4 karakter)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-blue-600/25 active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              <span>Daftar Sekarang</span>
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 1-CLICK FAST DEMO LOGIN BUTTONS */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Akses Cepat 1-Klik (Akun Demo)</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFastLogin('admin')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-left transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <Shield className="w-4 h-4 text-purple-700" />
                <span className="text-[9px] bg-purple-200 px-1 py-0.5 rounded font-mono font-bold">Admin</span>
              </div>
              <div className="font-bold text-xs mt-1">Admin</div>
              <span className="text-[9px] text-purple-600 font-mono truncate">admin123</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin('courier')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-left transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <Bike className="w-4 h-4 text-emerald-700" />
                <span className="text-[9px] bg-emerald-200 px-1 py-0.5 rounded font-mono font-bold">Kurir</span>
              </div>
              <div className="font-bold text-xs mt-1">Budi Kurir</div>
              <span className="text-[9px] text-emerald-600 font-mono truncate">kurir123</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin('customer')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-left transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <User className="w-4 h-4 text-blue-700" />
                <span className="text-[9px] bg-blue-200 px-1 py-0.5 rounded font-mono font-bold">User</span>
              </div>
              <div className="font-bold text-xs mt-1">Pelanggan</div>
              <span className="text-[9px] text-blue-600 font-mono truncate">user123</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
