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
  Sparkles
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Top Professional Announcement Bar with Discreet Testing Mode */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3.5 sm:px-6 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        
        {/* Left: Live Status & Hours */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">Buka 10.00 - 21.00 WIB</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">Melayani Seluruh Purbolinggo &amp; Rute Kota Metro</span>
        </div>

        {/* Center / Right: Hotline & Subtle Role Mode Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-amber-200 transition font-bold flex items-center gap-1"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>WA: 0857-8952-8805</span>
          </a>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Discreet Testing Switcher for User, Admin, Courier */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80">
            <button
              onClick={() => handleRoleSelect('customer')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                currentRole === 'customer'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Pelanggan</span>
            </button>
            <button
              onClick={() => handleRoleSelect('courier')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                currentRole === 'courier'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>Kurir</span>
            </button>
            <button
              onClick={() => handleRoleSelect('admin')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                currentRole === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
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

            {/* Quick Live Tracking Search Callout */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  <Search className="w-3.5 h-3.5" />
                  <span>Pelacakan Realtime</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl font-heading">
                  Sudah Memiliki Nomor Pesanan?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
                  Pantau posisi perjalanan kurir dan perkiraan tiba langsung di peta interaktif secara transparan.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('tracking');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
                >
                  <span>Buka Pelacakan Pesanan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
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

        {/* VIEW: CARA KERJA */}
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

      {/* Mobile App-Style Bottom Navigation Bar (Thumbs Friendly) */}
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

        {/* Center Primary Action: Pesan */}
        <button
          type="button"
          onClick={() => {
            setCurrentTab('order');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="relative -top-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-3.5 rounded-full shadow-lg shadow-orange-500/35 active:scale-95 transition-transform flex flex-col items-center"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="sr-only">Pesan</span>
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

        <a
          href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 p-1 rounded-xl text-emerald-600 hover:text-emerald-700 transition"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-bold">CS WA</span>
        </a>
      </nav>

      {/* Persistent Floating WhatsApp Button for Desktop Screens */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-2.5">
        <a
          href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-black group cursor-pointer"
          title="Chat WhatsApp MAS JASTIP (0857-8952-8805)"
        >
          <Phone className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" />
          <span>Chat WhatsApp Rider</span>
        </a>
      </div>

    </div>
  );
};
