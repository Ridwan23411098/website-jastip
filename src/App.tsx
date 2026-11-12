import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { OrderForm } from './components/OrderForm';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { TrackingPage } from './components/TrackingPage';
import { OrderHistory } from './components/OrderHistory';
import { HowItWorksSection } from './components/HowItWorksSection';
import { AdminDashboard } from './components/AdminDashboard';
import { CourierDashboard } from './components/CourierDashboard';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import {
  getCurrentRole,
  setCurrentRole,
  subscribeToStore,
} from './services/storageService';
import { getCurrentUser, AuthUser } from './services/authService';
import { UserRole, Order, ServiceType } from './types';
import {
  Shield,
  Bike,
  User,
  ArrowRight,
  PlusCircle,
  Phone,
  Home,
  Search,
  History,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
  MapPin,
  Lock
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier'>('home');

  // Role state
  const [currentRole, setRole] = useState<UserRole>(getCurrentRole());

  // Logged in user
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());

  // Login Modal
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Newly created order for confirmation modal
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Tracking target code
  const [activeTrackingCode, setActiveTrackingCode] = useState<string>('MJ-2026-001');

  // Selected service type when clicked from Hero
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | undefined>(undefined);

  // Quick Tracking input on Home
  const [quickTrackInput, setQuickTrackInput] = useState('');

  useEffect(() => {
    return subscribeToStore(() => {
      setRole(getCurrentRole());
      setCurrentUser(getCurrentUser());
    });
  }, []);

  const handleRoleSelect = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setRole(newRole);
    if (newRole === 'admin') {
      setCurrentTab('admin');
    } else if (newRole === 'courier') {
      setCurrentTab('courier');
    } else {
      setCurrentTab('home');
    }
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    handleRoleSelect(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleRoleSelect('customer');
  };

  const handleOrderCreated = (order: Order) => {
    setConfirmedOrder(order);
    setActiveTrackingCode(order.orderCode);
  };

  const handleTrackFromConfirmation = (orderCode: string) => {
    setConfirmedOrder(null);
    setActiveTrackingCode(orderCode);
    setCurrentTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackFromHistory = (orderCode: string) => {
    setActiveTrackingCode(orderCode);
    setCurrentTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartOrder = (serviceType?: ServiceType) => {
    setSelectedServiceType(serviceType);
    setCurrentTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackInput.trim()) return;
    setActiveTrackingCode(quickTrackInput.trim());
    setCurrentTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Top Professional Consumer Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-slate-300 text-[11px] sm:text-xs py-2 px-3.5 sm:px-6 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        
        {/* Left: Live Status & Hours */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold text-white">Buka Setiap Hari (10.00 - 21.00 WIB)</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline flex items-center gap-1">
            <MapPin className="w-3 h-3 text-orange-400 inline" />
            <span>Melayani 12 Desa Purbolinggo &amp; Rute Kota Metro</span>
          </span>
        </div>

        {/* Center / Right: Hotline & Clean Staff Access Link */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-amber-200 transition font-bold flex items-center gap-1"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>Hotline: 0857-8952-8805</span>
          </a>

          <span className="text-slate-700 hidden md:inline">|</span>

          {/* Discrete Staff / Role Portal */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition px-2 py-0.5 rounded-md hover:bg-slate-800"
            title="Masuk sebagai Kurir atau Admin"
          >
            <Lock className="w-2.5 h-2.5" />
            <span>Portal Petugas</span>
          </button>
        </div>

      </div>

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentRole={currentRole}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 sm:pb-16">
        
        {/* VIEW: ADMIN DASHBOARD */}
        {currentTab === 'admin' && (
          <AdminDashboard />
        )}

        {/* VIEW: COURIER DASHBOARD */}
        {currentTab === 'courier' && (
          <CourierDashboard />
        )}

        {/* VIEW: HOME (HERO + CORE FEATURES) */}
        {currentTab === 'home' && (
          <div className="space-y-12">
            <HeroSection
              onStartOrder={handleStartOrder}
              onOpenTracking={() => {
                setCurrentTab('tracking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Quick Live Tracking Search Callout Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  <Search className="w-3.5 h-3.5" />
                  <span>Pelacakan Realtime</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl font-heading">
                  Sudah Memiliki Nomor Pesanan?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
                  Masukkan kode pesanan Anda (contoh: <code>MJ-2026-001</code>) untuk memantau pergerakan motor kurir di peta secara langsung.
                </p>
              </div>

              <form onSubmit={handleQuickTrackSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={quickTrackInput}
                    onChange={(e) => setQuickTrackInput(e.target.value)}
                    placeholder="Contoh: MJ-2026-001"
                    className="w-full text-xs sm:text-sm p-3 pl-9 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
                >
                  <span>Lacak Pesanan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: BUAT PESANAN */}
        {currentTab === 'order' && (
          <OrderForm
            onOrderCreated={handleOrderCreated}
            initialServiceType={selectedServiceType}
            onCancel={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: LACAK PESANAN */}
        {currentTab === 'tracking' && (
          <TrackingPage
            initialCode={activeTrackingCode}
            onNavigateOrder={() => {
              setCurrentTab('order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: CARA KERJA & FAQ */}
        {currentTab === 'howItWorks' && (
          <HowItWorksSection
            onStartOrder={() => {
              setCurrentTab('order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: RIWAYAT PESANAN */}
        {currentTab === 'history' && (
          <OrderHistory
            onSelectOrder={handleTrackFromHistory}
            onNavigateOrder={() => {
              setCurrentTab('order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={!!confirmedOrder}
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={handleTrackFromConfirmation}
      />

      {/* Login / Role Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleRoleSelect}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Mobile App-Style Bottom Navigation Bar (Ultra-Friendly Thumbs Reach) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 flex items-center justify-around lg:hidden shadow-xl">
        <button
          type="button"
          onClick={() => {
            setCurrentTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition ${
            currentTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCurrentTab('tracking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition ${
            currentTab === 'tracking' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Lacak</span>
        </button>

        {/* Center Primary Action: Pesan (Floating) */}
        <button
          type="button"
          onClick={() => {
            setCurrentTab('order');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="relative -top-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-3.5 rounded-full shadow-lg shadow-orange-500/35 active:scale-95 transition-transform flex flex-col items-center cursor-pointer"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => {
            setCurrentTab('howItWorks');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition ${
            currentTab === 'howItWorks' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px]">Panduan</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCurrentTab('history');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition ${
            currentTab === 'history' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Riwayat</span>
        </button>
      </nav>

    </div>
  );
};
