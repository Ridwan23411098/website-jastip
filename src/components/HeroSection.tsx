import React, { useState } from 'react';
import {
  Utensils,
  Package,
  UserCheck,
  Heart,
  Bike,
  ShoppingCart,
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
  Receipt,
  Store,
  ChevronRight,
  Sparkles
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
    title: 'Makanan & Minuman',
    desc: 'Titip kuliner resto, warung makan, pecel, bakso, geprek & jajanan terdekat.',
    tag: 'Paling Laris',
    icon: Utensils,
    color: 'text-orange-600',
    bgLight: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
  },
  {
    id: 'package',
    type: 'Ambil / Antar Barang',
    title: 'Ambil / Antar Paket',
    desc: 'Ambil paket ekspedisi (J&T, SiCepat, Shopee, JNE), dokumen penting, atau barang.',
    tag: 'Praktis',
    icon: Package,
    color: 'text-blue-600',
    bgLight: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
  },
  {
    id: 'shopping',
    type: 'Order (Titip Belanja)',
    title: 'Titip Belanja Pasar',
    desc: 'Belanja sayur, sembako pasar, apotek, swalayan, atau titip belanja ke Kota Metro.',
    tag: 'Hemat Waktu',
    icon: ShoppingCart,
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
  },
  {
    id: 'ojek',
    type: 'Jemput / Antar Orang',
    title: 'Ojek Antar Jemput',
    desc: 'Ojek lokal antar jemput anak sekolah, puskesmas, pasar & kantor desa.',
    tag: 'Amanah',
    icon: UserCheck,
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
  },
  {
    id: 'metro',
    type: 'Order (Titip Belanja)',
    title: 'Rute Kota Metro',
    desc: 'Titip belanja ke Chandra Superstore, PB Swalayan, Pasar Metro, atau RS Metro.',
    tag: 'Rute Spesial',
    icon: Navigation,
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
  },
  {
    id: 'delivery',
    type: 'Delivery',
    title: 'Delivery Olshop UMKM',
    desc: 'Kurir pengantaran jualan online warga Purbolinggo langsung ke pembeli.',
    tag: 'Bisnis Lokal',
    icon: Bike,
    color: 'text-cyan-600',
    bgLight: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
  },
  {
    id: 'pet',
    type: 'Ambil / Antar Hewan Peliharaan',
    title: 'Antar Jemput Hewan',
    desc: 'Bawa kucing/anjing peliharaan aman ke petshop, grooming, atau dokter.',
    tag: 'Khusus',
    icon: Heart,
    color: 'text-rose-600',
    bgLight: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
  },
];

// Quick Estimator Route Presets
const ESTIMATOR_ROUTES = [
  { label: 'Pasar Purbolinggo → Desa Taman Endah', km: 3.4, fee: 12500, time: '10 mnt', desc: 'Kuliner warung & pasar Simpang' },
  { label: 'Chandra Superstore Metro → Purbolinggo', km: 25.1, fee: 67500, time: '40 mnt', desc: 'Belanja supermarket Kota Metro' },
  { label: 'PB Swalayan Metro → Taman Fajar', km: 25.0, fee: 66500, time: '38 mnt', desc: 'Belanja sembako & jajanan Metro' },
  { label: 'Pasar Kotagajah → Purbolinggo', km: 23.9, fee: 64000, time: '35 mnt', desc: 'Titip beli di Pasar Kotagajah' },
  { label: 'Purbolinggo → Pemkab Sukadana (Lamtim)', km: 25.9, fee: 69000, time: '40 mnt', desc: 'Antar berkas dinas Pemda Lamtim' },
];

// Curated Popular Local Spots in Purbolinggo
const LOCAL_FAVORITE_SPOTS = [
  { name: 'Warung Bakso Simpang Pasar', category: 'Pesanin Makanan/Minuman' as ServiceType },
  { name: 'Ayam Geprek Simpang Pasar', category: 'Pesanin Makanan/Minuman' as ServiceType },
  { name: 'Drop Point J&T Purbolinggo', category: 'Ambil / Antar Barang' as ServiceType },
  { name: 'SiCepat Ekspres Purbolinggo', category: 'Ambil / Antar Barang' as ServiceType },
  { name: 'Chandra Superstore Metro', category: 'Order (Titip Belanja)' as ServiceType },
  { name: 'PB Swalayan Kota Metro', category: 'Order (Titip Belanja)' as ServiceType },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartOrder,
  onOpenTracking,
}) => {
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const activeRoute = ESTIMATOR_ROUTES[selectedRouteIdx];

  return (
    <div className="space-y-10 sm:space-y-14">
      
      {/* Top Modern Clean Hero Banner (Authentic Gojek/Grab Clean Aesthetic) */}
      <section className="bg-gradient-to-b from-orange-50/70 via-white to-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Authentic Human-Crafted Value Proposition */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Operational Location Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-700 font-bold">Rider Siap Meluncur</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Purbolinggo, Lampung Timur</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight leading-[1.15] text-slate-900 font-heading">
              Mau Titip Beli Makanan atau{' '}
              <span className="text-orange-600">Kirim Barang Apa Hari Ini?</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Tinggal santai di rumah. Rider MAS JASTIP siap belikan makanan favorit, ambil paket ekspedisi, belanja sembako hingga rute <strong>Kota Metro</strong>. Ongkir per KM transparan, amanah, dan bayar saat barang tiba (COD).
            </p>

            {/* Quick Hero Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => onStartOrder()}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                <span>Buat Pesanan Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenTracking}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 rounded-2xl transition border border-slate-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-2xs"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Lacak Pesanan Saya</span>
              </button>

              <a
                href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-4 py-3.5 rounded-2xl transition border border-emerald-200 flex items-center justify-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>0857-8952-8805</span>
              </a>
            </div>

            {/* Popular Local Spots (Curated Real-life Purbolinggo) */}
            <div className="pt-2 text-left">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Titik Populer Sering Dipesan:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {LOCAL_FAVORITE_SPOTS.map((spot, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onStartOrder(spot.category)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-orange-600 hover:text-white text-slate-700 transition border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    {spot.name}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Clean Interactive Fare Calculator Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-heading">
                      Cek Tarif Per KM Transparan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Sesuai jarak jalan raya sebenarnya
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Resmi
                </span>
              </div>

              {/* Preset Route Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Pilih Contoh Rute Antar:</span>
                  <span className="text-[10.5px] text-slate-400">Pilih untuk lihat estimasi</span>
                </label>
                <div className="space-y-1.5">
                  {ESTIMATOR_ROUTES.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedRouteIdx(idx)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 text-xs cursor-pointer ${
                        selectedRouteIdx === idx
                          ? 'bg-orange-50/80 border-orange-400 text-slate-900 font-bold ring-1 ring-orange-400/40'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-semibold">{r.label}</div>
                        <div className="text-[10px] text-slate-500">{r.desc}</div>
                      </div>
                      <span className="font-extrabold text-orange-600 shrink-0">
                        {formatRupiah(r.fee)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Route Summary Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5 text-blue-600" />
                    <span>Jarak Jalan Riil:</span>
                  </span>
                  <span className="font-bold text-slate-900">{activeRoute.km} KM</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Estimasi Waktu:</span>
                  </span>
                  <span className="font-bold text-slate-900">± {activeRoute.time}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Perkiraan Ongkir:</span>
                  <span className="font-black text-lg text-orange-600 font-heading">
                    {formatRupiah(activeRoute.fee)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onStartOrder()}
                className="w-full bg-slate-900 hover:bg-black active:scale-95 text-white font-bold py-3 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Pesan Rute Ini Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>

      </section>

      {/* 4 Pilar Jaminan Layanan (Real Customer Trust) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Respon Cepat</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Pesanan langsung diproses, rider segera meluncur ke warung atau ekspedisi.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Tarif Transparan</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Dihitung adil per KM jalan raya sebenarnya tanpa biaya terselubung.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Struk &amp; Nota Asli</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Belanjaan ditalangi dulu, selalu disertai nota asli transaksi warung/toko.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Bayar COD di Rumah</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Terima barang dulu baru bayar tunai (COD) atau transfer QRIS tanpa was-was.
            </p>
          </div>
        </div>

      </section>

      {/* 7 Layanan Utama MAS JASTIP Purbolinggo */}
      <section className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              Katalog Layanan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Layanan Jastip &amp; Jasa Suruh Kami
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pilih layanan sesuai kebutuhan Anda hari ini se-Kecamatan Purbolinggo &amp; Kota Metro.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onStartOrder()}
            className="self-start sm:self-auto text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Formulir Pemesanan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CORE_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                onClick={() => onStartOrder(srv.type)}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-orange-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl ${srv.bgLight} flex items-center justify-center font-bold transition-all`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {srv.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-heading group-hover:text-orange-600 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-orange-600">
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
};
