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
  Receipt,
  Star,
  Users
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
    desc: 'Titip beli kuliner resto, warung makan, pecel, bakso, geprek & jajanan pasar terdekat.',
    tag: 'FAVORIT',
    icon: Utensils,
    color: 'text-orange-600',
    bgLight: 'bg-orange-50 group-hover:bg-orange-600 group-hover:text-white',
  },
  {
    id: 'package',
    type: 'Ambil / Antar Barang',
    title: 'Ambil & Antar Paket',
    desc: 'Ambil paket ekspedisi (J&T, SiCepat, Shopee, JNE), dokumen penting, atau barang titipan.',
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
    desc: 'Titip belanja ke Chandra Superstore, PB Swalayan, Pasar Cendrawasih, atau RS Kota Metro.',
    tag: 'RUTE METRO',
    icon: Navigation,
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 group-hover:bg-amber-600 group-hover:text-white',
  },
];

// Quick Estimator Route Presets
const ESTIMATOR_ROUTES = [
  { label: 'Pasar Purbolinggo → Desa Taman Endah', km: 3.4, fee: 12500, time: '10 mnt', desc: 'Kuliner pasar / warung Simpang' },
  { label: 'Chandra Superstore Metro → Purbolinggo', km: 25.1, fee: 67500, time: '40 mnt', desc: 'Belanja perlengkapan & supermarket' },
  { label: 'PB Swalayan Metro → Taman Fajar', km: 25.0, fee: 66500, time: '38 mnt', desc: 'Belanja sembako & jajanan Metro' },
  { label: 'Pasar Kotagajah → Purbolinggo', km: 23.9, fee: 64000, time: '35 mnt', desc: 'Titip beli di Pasar Kotagajah' },
  { label: 'Purbolinggo → Pemkab Sukadana (Lamtim)', km: 25.9, fee: 69000, time: '40 mnt', desc: 'Antar berkas dinas / urusan Pemda' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartOrder,
  onOpenTracking,
}) => {
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const activeRoute = ESTIMATOR_ROUTES[selectedRouteIdx];

  return (
    <div className="space-y-12 sm:space-y-16">
      
      {/* Top Main Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border border-slate-800">
        
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
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-semibold">10.00 - 21.00 WIB</span>
              <span className="hidden sm:inline text-slate-500">•</span>
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
              Ongkos transparan dihitung per KM rute jalan raya sebenarnya, amanah, dan bayar saat barang tiba di rumah (COD / Transfer).
            </p>

            {/* 1-Tap Quick Service Shortcuts for Instant Ordering */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center lg:text-left">
                Pilih Cepat Kebutuhan Anda:
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                {CORE_SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onStartOrder(s.type)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-orange-500 hover:text-white text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700/70 hover:border-orange-400 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
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

            {/* Trust Points */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-left">
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tanpa Ribet</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>100% Amanah</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Nota Toko Asli</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Bayar COD / QRIS</span>
              </div>
            </div>

          </div>

          {/* Right Hero: Interactive Quick Fare Calculator Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white font-heading">
                      Cek Estimasi Ongkir Instan
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Transparan per KM rute jalan raya
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Resmi
                </span>
              </div>

              {/* Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Pilih Rute Contoh:</span>
                  <span className="text-[10px] text-slate-400">Pilih rute untuk lihat tarif</span>
                </label>
                <div className="space-y-1.5">
                  {ESTIMATOR_ROUTES.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedRouteIdx(idx)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 text-xs ${
                        selectedRouteIdx === idx
                          ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-semibold">{r.label}</div>
                        <div className="text-[10px] text-slate-400">{r.desc}</div>
                      </div>
                      <span className="font-black text-amber-400 shrink-0">
                        {formatRupiah(r.fee)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Route Details Preview */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5 text-blue-400" />
                    <span>Jarak Tempuh Riil:</span>
                  </span>
                  <span className="font-bold text-white">{activeRoute.km} KM</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Estimasi Perjalanan:</span>
                  </span>
                  <span className="font-bold text-white">± {activeRoute.time}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-200">Perkiraan Ongkir:</span>
                  <span className="font-black text-lg text-amber-400 font-heading">
                    {formatRupiah(activeRoute.fee)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onStartOrder()}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black py-3 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <span>Pesan Rute Ini Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>

      </section>

      {/* 4 Pilar Keunggulan MAS JASTIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Rider Tanggap &amp; Cepat</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Respon dalam hitungan menit, rider langsung meluncur ke warung, toko, atau ekspedisi.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Tarif Transparan Per KM</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Dihitung adil berdasarkan jarak sebenarnya rute jalan raya tanpa biaya terselubung.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Struk &amp; Nota Asli Toko</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Belanjaan ditalangi dulu, dan selalu disertai nota asli transaksi toko yang jelas.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Bayar Nyaman di Rumah</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Terima barang dulu baru bayar tunai (COD) atau transfer bank / QRIS tanpa was-was.
            </p>
          </div>
        </div>

      </section>

      {/* 7 Layanan Resmi Sesuai Poster MAS JASTIP Purbolinggo */}
      <section className="space-y-6">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Layanan Lengkap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            7 Layanan Utama MAS JASTIP Purbolinggo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Dari kebutuhan perut sampai keperluan antar paket, dokumen kedinasan &amp; belanja swalayan Kota Metro, semua siap kami bantu!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CORE_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${srv.bgLight} ${srv.color} flex items-center justify-center font-bold transition-all shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 tracking-wider">
                      {srv.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-heading group-hover:text-blue-600 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onStartOrder(srv.type)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 group-hover:border-orange-500 cursor-pointer"
                  >
                    <span>Pesan Layanan Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
};
