import React, { useState } from 'react';
import {
  Utensils,
  Package,
  UserCheck,
  Heart,
  Bike,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Phone,
  Search,
  Navigation,
  CheckCircle2,
  Calculator,
  MapPin,
  Route,
  Zap,
  Receipt
} from 'lucide-react';
import { ServiceType } from '../types';
import { formatRupiah } from '../services/storageService';

interface HeroSectionProps {
  onStartOrder: (serviceType?: ServiceType) => void;
  onOpenTracking: () => void;
}

// 7 Layanan Resmi Sesuai Poster MAS JASTIP Purbolinggo
const CORE_SERVICES: {
  id: string;
  type: ServiceType;
  title: string;
  desc: string;
  tag: string;
  icon: any;
  color: string;
  bgLight: string;
}[] = [
  {
    id: 'food',
    type: 'Pesanin Makanan/Minuman',
    title: 'Pesan Makanan & Minuman',
    desc: 'Titip beli kuliner resto, warung makan, pecel, bakso & jajanan pasar terdekat.',
    tag: 'FAVORIT',
    icon: Utensils,
    color: 'text-orange-600',
    bgLight: 'bg-orange-50 group-hover:bg-orange-600 group-hover:text-white',
  },
  {
    id: 'package',
    type: 'Ambil / Antar Barang',
    title: 'Ambil & Antar Paket',
    desc: 'Ambil paket ekspedisi (J&T, SiCepat, Shopee, JNE), berkas kantor, atau barang titipan.',
    tag: 'PRAKTIS',
    icon: Package,
    color: 'text-blue-600',
    bgLight: 'bg-blue-50 group-hover:bg-blue-600 group-hover:text-white',
  },
  {
    id: 'shopping',
    type: 'Order (Titip Belanja)',
    title: 'Titip Belanja Pasar & Toko',
    desc: 'Belanja sayur, sembako pasar, apotek, swalayan, atau belanja kebutuhan ke Kota Metro.',
    tag: 'HEMAT WAKTU',
    icon: ShoppingCart,
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
  },
  {
    id: 'ojek',
    type: 'Jemput / Antar Orang',
    title: 'Ojek Antar Jemput Warga',
    desc: 'Ojek lokal terpercaya untuk antar jemput anak sekolah, puskesmas, pasar & balai desa.',
    tag: 'AMANAH',
    icon: UserCheck,
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white',
  },
  {
    id: 'pet',
    type: 'Ambil / Antar Hewan Peliharaan',
    title: 'Antar Jemput Hewan',
    desc: 'Bawa hewan peliharaan (kucing/anjing) dengan aman ke petshop, grooming, atau dokter.',
    tag: 'KHUSUS',
    icon: Heart,
    color: 'text-rose-600',
    bgLight: 'bg-rose-50 group-hover:bg-rose-600 group-hover:text-white',
  },
  {
    id: 'delivery',
    type: 'Delivery',
    title: 'Delivery Olshop & Toko',
    desc: 'Pengantaran paket pesanan bagi pedagang online & UMKM se-Kecamatan Purbolinggo.',
    tag: 'BISNIS LOKAL',
    icon: Bike,
    color: 'text-cyan-600',
    bgLight: 'bg-cyan-50 group-hover:bg-cyan-600 group-hover:text-white',
  },
  {
    id: 'metro',
    type: 'Order (Titip Belanja)',
    title: 'Rute Khusus Kota Metro',
    desc: 'Titip belanja ke Chandra Superstore, PB Swalayan, Pasar Metro, atau RS Kota Metro.',
    tag: 'RUTE METRO',
    icon: Navigation,
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 group-hover:bg-amber-600 group-hover:text-white',
  },
];

// Quick Estimator Route Presets
const ESTIMATOR_ROUTES = [
  { label: 'Pasar Purbolinggo ➔ Desa Taman Endah', km: 3.4, fee: 12500, time: '10 mnt' },
  { label: 'Chandra Superstore Metro ➔ Purbolinggo', km: 25.1, fee: 67500, time: '40 mnt' },
  { label: 'PB Swalayan Metro ➔ Taman Fajar', km: 25.0, fee: 66500, time: '38 mnt' },
  { label: 'Pasar Kotagajah ➔ Purbolinggo', km: 23.9, fee: 64000, time: '35 mnt' },
  { label: 'Purbolinggo ➔ Pemkab Sukadana (Lamtim)', km: 25.9, fee: 69000, time: '40 mnt' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartOrder,
  onOpenTracking,
}) => {
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const activeRoute = ESTIMATOR_ROUTES[selectedRouteIdx];

  return (
    <div className="space-y-10 sm:space-y-14">
      
      {/* Top Main Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-10 lg:p-12 shadow-xl border border-slate-800">
        
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            
            {/* Live Operational Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold text-slate-200">Rider Standby</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-400 font-semibold">10.00 - 21.00 WIB</span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="hidden sm:inline text-slate-300 font-medium">Purbolinggo, Lampung Timur</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight font-heading">
              Pesan Apapun Jadi Mudah,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
                Serahkan Semua ke MAS JASTIP!
              </span>
            </h1>

            {/* Value Proposition Description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Jasa titip beli makanan, belanja pasar &amp; swalayan, ambil paket ekspedisi, hingga ojek &amp; titip belanja ke <strong>Kota Metro</strong>. 
              Ongkos transparan dihitung per KM rute jalan raya sebenarnya, amanah, dan bayar saat barang tiba (COD / Transfer).
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => onStartOrder()}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-white font-black px-6 py-3.5 rounded-2xl transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                <span>Mulai Buat Pesanan</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onOpenTracking}
                className="w-full sm:w-auto bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold px-5 py-3.5 rounded-2xl transition border border-slate-700 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Search className="w-4 h-4 text-blue-400" />
                <span>Lacak Pesanan Saya</span>
              </button>

              <a
                href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold px-4 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm border border-emerald-500/40"
                title="Chat WhatsApp Resmi"
              >
                <Phone className="w-4 h-4" />
                <span className="sm:hidden lg:inline">CS: 0857-8952-8805</span>
                <span className="hidden sm:inline lg:hidden">WhatsApp</span>
              </a>
            </div>

            {/* Quick Guarantees Strip */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tanpa Ribet Antre</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Struk / Nota Asli Toko</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Amanah 100%</span>
              </div>
            </div>

          </div>

          {/* Right Hero: Quick Ongkir Estimator Widget (Very Engaging & Helpful) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Simulasi Ongkir Cepat</h3>
                    <p className="text-[11px] text-slate-400">Dihitung otomatis per KM rute riil</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  REAL KM
                </span>
              </div>

              {/* Route Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>Pilih Contoh Rute Pengantaran:</span>
                </label>
                <select
                  value={selectedRouteIdx}
                  onChange={(e) => setSelectedRouteIdx(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition font-medium"
                >
                  {ESTIMATOR_ROUTES.map((r, i) => (
                    <option key={i} value={i}>
                      {r.label} ({r.km} KM)
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Results Card */}
              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/60 space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Jarak Tempuh</span>
                    <span className="text-base font-black text-white font-mono flex items-center justify-center gap-1">
                      <Route className="w-4 h-4 text-blue-400 inline" />
                      {activeRoute.km} KM
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Perkiraan Waktu</span>
                    <span className="text-base font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-400 inline" />
                      ~{activeRoute.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Estimasi Ongkir Jasa:</span>
                    <span className="text-xs text-slate-500">(Dasar + Tarif Jarak)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-400 font-heading">
                      {formatRupiah(activeRoute.fee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Button to order this route */}
              <button
                type="button"
                onClick={() => onStartOrder('Order (Titip Belanja)')}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Pesan Rute Ini di Formulir</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-slate-400">
                Uang belanjaan makanan/barang dibayar saat barang tiba di tempat Anda.
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* 7 Core Services: Gojek / Grab App Grid Layout */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <Zap className="w-3.5 h-3.5 text-orange-500" />
              <span>Katalog Layanan Resmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Semua Kebutuhanmu, Tinggal Klik &amp; Beres!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pilih kategori layanan di bawah untuk mengisi formulir pesanan secara otomatis:
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Tarif Transparan Tanpa Biaya Tersembunyi</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {CORE_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                onClick={() => onStartOrder(srv.type)}
                className="group bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${srv.bgLight} ${srv.color} flex items-center justify-center transition-all duration-200 shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-700 transition uppercase tracking-wider">
                      {srv.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-heading group-hover:text-orange-600 transition">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-orange-600 transition">
                  <span>Pesan Sekarang</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Banner Card: Rute Belanja Luar Kota (Metro, Kotagajah, Bandar Jaya) */}
          <div
            onClick={() => onStartOrder('Order (Titip Belanja)')}
            className="group bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-4 sm:p-5 hover:border-orange-500 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between border border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Navigation className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase tracking-wider">
                  ANTAR KOTA
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-white text-sm sm:text-base font-heading group-hover:text-orange-400 transition">
                  Titip Belanja Kota Metro
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Belanja Chandra Superstore, PB Swalayan, Pasar Cendrawasih Metro, hingga ambil barang antar wilayah.
                </p>
              </div>
            </div>

            <div className="pt-3.5 mt-3.5 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-orange-400 group-hover:text-white transition">
              <span>Cek Rute &amp; Biaya</span>
              <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Peace of Mind Banner */}
      <section className="bg-gradient-to-r from-orange-50 via-amber-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-orange-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm sm:text-base font-heading">
              Komitmen Layanan Amanah &amp; Transparan
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Barang belanjaan selalu disertai nota resmi toko. Anda hanya membayar harga belanja asli sesuai nota + ongkir resmi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20konsultasi%20jasa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-800 hover:text-emerald-700 bg-white hover:bg-emerald-50 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-center gap-2 shadow-2xs"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Hotline WA: 0857-8952-8805</span>
          </a>
        </div>
      </section>

    </div>
  );
};
