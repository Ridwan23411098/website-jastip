import React, { useState } from 'react';
import {
  Bike,
  Menu,
  X,
  Search,
  PlusCircle,
  HelpCircle,
  Clock,
  User,
  Shield,
  LogIn,
  LogOut,
  ChevronDown,
  Phone
} from 'lucide-react';
import { UserRole } from '../types';
import { getCurrentUser, logoutUser, AuthUser } from '../services/authService';

interface NavbarProps {
  currentTab: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier';
  onNavigate: (tab: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier') => void;
  currentRole: UserRole;
  onOpenLogin: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  currentRole,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loggedInUser = getCurrentUser();

  const handleNav = (tab: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier') => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    logoutUser();
    if (onLogout) onLogout();
    handleNav('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Profile Identity */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <img
                src="/mas-jastip-logo.png"
                alt="Logo Profil MAS JASTIP - purbolinggo -"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md shadow-orange-500/25 ring-2 ring-orange-500/50 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-slate-900 font-heading">
                  MAS <span className="text-blue-600">JASTIP</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs tracking-wider">
                  - purbolinggo -
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden xs:block">
                Mudahnya serahin ke MAS JASTIP • 10.00 - 21.00 WIB
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-slate-600">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-xl transition ${
                currentTab === 'home'
                  ? 'text-blue-600 bg-blue-50/70 font-bold'
                  : 'hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => handleNav('order')}
              className={`px-3 py-2 rounded-xl transition ${
                currentTab === 'order'
                  ? 'text-blue-600 bg-blue-50/70 font-bold'
                  : 'hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Pesan
            </button>
            <button
              onClick={() => handleNav('tracking')}
              className={`px-3 py-2 rounded-xl transition ${
                currentTab === 'tracking'
                  ? 'text-blue-600 bg-blue-50/70 font-bold'
                  : 'hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Lacak Pesanan
            </button>
            <button
              onClick={() => handleNav('howItWorks')}
              className={`px-3 py-2 rounded-xl transition ${
                currentTab === 'howItWorks'
                  ? 'text-blue-600 bg-blue-50/70 font-bold'
                  : 'hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Cara Kerja
            </button>
            <button
              onClick={() => handleNav('history')}
              className={`px-3 py-2 rounded-xl transition ${
                currentTab === 'history'
                  ? 'text-blue-600 bg-blue-50/70 font-bold'
                  : 'hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Riwayat
            </button>
          </nav>

          {/* Right Actions: Role / Profile & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Profile / Login Indicator */}
            {loggedInUser ? (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 text-slate-800 hover:text-blue-600 transition"
                  title="Ganti Akun"
                >
                  {loggedInUser.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                  ) : loggedInUser.role === 'courier' ? (
                    <Bike className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span className="font-bold truncate max-w-[90px] sm:max-w-[130px]">{loggedInUser.name}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition"
                  title="Keluar (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                title="Masuk / Daftar"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Masuk</span>
              </button>
            )}

            {/* Direct shortcuts for Admin & Courier */}
            {currentRole === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Dashboard Admin</span>
              </button>
            )}

            {currentRole === 'courier' && (
              <button
                onClick={() => handleNav('courier')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Dashboard Kurir</span>
              </button>
            )}

            {/* WhatsApp Contact */}
            <a
              href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs hover:scale-105 active:scale-95"
              title="Chat WhatsApp Resmi MAS JASTIP"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>0813-6976-7697</span>
            </a>

            {/* TikTok Link */}
            <a
              href="https://www.tiktok.com/@masjastippurbolinggo01"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-black transition shadow-2xs hover:scale-105 active:scale-95"
              title="Buka TikTok Resmi MAS JASTIP PURBOLINGGO 01"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 4.8 1.52V6.69z"/>
              </svg>
              <span>TikTok</span>
            </a>

            {/* Main CTA: Buat Pesanan */}
            <button
              onClick={() => handleNav('order')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl transition text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Pesanan</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 text-sm font-semibold animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between ${
              currentTab === 'home' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            <span>Beranda</span>
          </button>
          <button
            onClick={() => handleNav('order')}
            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between ${
              currentTab === 'order' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            <span>Pesan (Buat Pesanan)</span>
          </button>
          <button
            onClick={() => handleNav('tracking')}
            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between ${
              currentTab === 'tracking' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            <span>Lacak Pesanan</span>
          </button>
          <button
            onClick={() => handleNav('howItWorks')}
            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between ${
              currentTab === 'howItWorks' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            <span>Cara Kerja</span>
          </button>
          <button
            onClick={() => handleNav('history')}
            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between ${
              currentTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            <span>Riwayat Pesanan</span>
          </button>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {/* Quick Contact WhatsApp & TikTok in Mobile Drawer */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://www.tiktok.com/@masjastippurbolinggo01"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 4.8 1.52V6.69z"/>
                </svg>
                <span>TikTok</span>
              </a>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>Ganti Akun / Login ({loggedInUser ? loggedInUser.name : 'Tamu'})</span>
            </button>

            {currentRole === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Buka Dashboard Admin
              </button>
            )}

            {currentRole === 'courier' && (
              <button
                onClick={() => handleNav('courier')}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Buka Dashboard Kurir
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
