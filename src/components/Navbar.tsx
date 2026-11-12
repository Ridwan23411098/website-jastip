import React, { useState } from 'react';
import {
  Menu,
  X,
  Bike,
  PlusCircle,
  Search,
  History,
  Info,
  Shield,
  User,
  LogIn,
  LogOut,
  Phone,
  Home,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types';
import { getCurrentUser } from '../services/authService';

interface NavbarProps {
  currentTab: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier';
  onNavigate: (tab: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier') => void;
  currentRole: UserRole;
  onOpenLogin: () => void;
  onLogout: () => void;
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

  const navLinks: { tab: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history'; label: string; icon: any }[] = [
    { tab: 'home', label: 'Beranda', icon: Home },
    { tab: 'order', label: 'Pesan Jastip', icon: PlusCircle },
    { tab: 'tracking', label: 'Lacak Pesanan', icon: Search },
    { tab: 'howItWorks', label: 'Panduan & FAQ', icon: HelpCircle },
    { tab: 'history', label: 'Riwayat', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
          
          {/* Brand Identity with Logo and Local Subtitle */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="relative">
              <img
                src="/mas-jastip-logo.png"
                alt="MAS JASTIP Purbolinggo"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover ring-1 ring-slate-200 shadow-xs group-hover:scale-105 transition-transform bg-white"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('jsp-logo.png')) target.src = '/jsp-logo.png';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Rider Aktif"></span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight font-heading leading-none">
                  MAS <span className="text-orange-600">JASTIP</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80">
                  Purbolinggo
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  Mudahnya Serahin ke MAS JASTIP
                </span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Buka 10-21 WIB</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Pill Style) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-600">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => handleNav(item.tab)}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-orange-600 bg-orange-50 font-bold border border-orange-200/60 shadow-2xs'
                      : 'hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick WhatsApp Support (Desktop) */}
            <a
              href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200 shadow-2xs"
              title="Konsultasi CS WhatsApp Resmi"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>0857-8952-8805</span>
            </a>

            {/* Profile / Account Trigger */}
            {loggedInUser ? (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 text-slate-800 hover:text-orange-600 transition"
                  title="Ganti Akun"
                >
                  {loggedInUser.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                  ) : loggedInUser.role === 'courier' ? (
                    <Bike className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span className="font-bold truncate max-w-[70px] sm:max-w-[120px]">{loggedInUser.name}</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
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
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shrink-0 shadow-2xs cursor-pointer"
                title="Masuk Akun"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Masuk</span>
              </button>
            )}

            {/* Dashboard Shortcut Buttons if logged in as Admin or Courier */}
            {currentRole === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition shrink-0 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {currentRole === 'courier' && (
              <button
                onClick={() => handleNav('courier')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Kurir</span>
              </button>
            )}

            {/* Primary CTA: Buat Pesanan (Grab/Gojek Brand Orange) */}
            <button
              onClick={() => handleNav('order')}
              className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl transition text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-sm shadow-orange-600/20 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span className="hidden xs:inline">Pesan Sekarang</span>
              <span className="xs:hidden">Pesan</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 text-sm font-semibold animate-in slide-in-from-top-2 duration-150 shadow-xl">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => handleNav(item.tab)}
                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200/80'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>Ganti Akun / Login ({loggedInUser ? loggedInUser.name : 'Tamu'})</span>
            </button>

            {currentRole === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Buka Dashboard Admin</span>
              </button>
            )}

            {currentRole === 'courier' && (
              <button
                onClick={() => handleNav('courier')}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bike className="w-4 h-4" />
                <span>Buka Dashboard Kurir</span>
              </button>
            )}

            <a
              href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Chat WhatsApp: 0857-8952-8805</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
