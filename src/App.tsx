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
  getOrders
} from './services/storageService';
import { getCurrentUser, AuthUser } from './services/authService';
import { UserRole, Order } from './types';
import { Shield, Bike, User, ArrowLeft, ArrowRight, PlusCircle, CheckCircle, Phone } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation tab state: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier'
  const [currentTab, setCurrentTab] = useState<'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier'>('home');

  // Role state: 'customer' | 'admin' | 'courier'
  const [currentRole, setRole] = useState<UserRole>(getCurrentRole());

  // Logged in user state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());

  // Login Modal
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Newly created order for confirmation modal
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Tracking target code
  const [activeTrackingCode, setActiveTrackingCode] = useState<string>('MJ-2026-001');

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Role Navigation Top Switcher Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Akses Cepat Mode:</span>
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => handleRoleSelect('customer')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                currentRole === 'customer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pelanggan</span>
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                currentRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => handleRoleSelect('courier')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                currentRole === 'courier'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Kurir</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Login: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            </span>
          )}

          {currentRole !== 'customer' && (
            <button
              onClick={() => handleRoleSelect('customer')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Pelanggan</span>
            </button>
          )}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
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
              onStartOrder={() => {
                setCurrentTab('order');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenTracking={() => {
                setCurrentTab('tracking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Quick Live Tracking Preview */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg font-heading">
                  Sudah Memiliki Nomor Pesanan?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Lacak posisi perjalanan kurir dan perkiraan tiba langsung di Google Maps / OpenStreetMap.
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentTab('tracking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-5 py-3 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 border border-blue-200"
              >
                <span>Buka Pelacakan Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW: BUAT PESANAN */}
        {currentTab === 'order' && (
          <OrderForm
            onOrderCreated={handleOrderCreated}
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

      {/* Persistent Floating Contact Buttons: WhatsApp & TikTok */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        {/* TikTok Floating Button */}
        <a
          href="https://www.tiktok.com/@masjastippurbolinggo01"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-black text-white px-3.5 py-2 rounded-full shadow-lg backdrop-blur-md border border-slate-700/60 transition-all hover:scale-105 active:scale-95 text-xs font-bold group"
          title="Buka TikTok Resmi MAS JASTIP PURBOLINGGO 01"
        >
          <svg className="w-4 h-4 fill-current text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 4.8 1.52V6.69z"/>
          </svg>
          <span className="hidden sm:inline">TikTok</span>
        </a>

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-black group"
          title="Chat WhatsApp MAS JASTIP (0813-6976-7697)"
        >
          <Phone className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" />
          <span>WhatsApp MAS JASTIP</span>
        </a>
      </div>

    </div>
  );
};
