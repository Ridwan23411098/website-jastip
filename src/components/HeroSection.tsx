import React from 'react';
import {
  MapPin,
  Calculator,
  Bike,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Send,
  Phone,
  Package,
  UserCheck,
  Heart,
  ShoppingCart,
  MoreHorizontal,
  Utensils,
  Check
} from 'lucide-react';

interface HeroSectionProps {
  onStartOrder: () => void;
  onOpenTracking: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartOrder,
  onOpenTracking,
}) => {
  const serviceList = [
    { title: 'Pesanin Makanan/Minuman', icon: Utensils, ready: true },
    { title: 'Ambil Barang / Antar Barang', icon: Package, ready: true },
    { title: 'Jemput / Antar Orang', icon: UserCheck, ready: true },
    { title: 'Ambil / Antar Hewan Peliharaan', icon: Heart, ready: true },
    { title: 'Delivery Olshop / Toko', icon: Bike, ready: true },
    { title: 'Order (Titip Belanja)', icon: ShoppingCart, ready: true },
    { title: 'Dan lain-lain', icon: Sparkles, ready: true },
  ];

  return (
    <div className="space-y-12 pb-8">
      
      {/* Top Operating Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/mas-jastip-logo.png"
            alt="Profil MAS JASTIP - purbolinggo -"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-400 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base font-heading tracking-wide">
                MAS JASTIP
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-800/80 text-white text-[10px] font-black tracking-wider border border-white/20">
                - purbolinggo -
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-black uppercase">
                Aktif
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              &ldquo;Mudahnya serahin ke MAS JASTIP&rdquo; • Melayani Se-Kecamatan Purbolinggo &amp; Kota Metro
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold">
          <div className="bg-white/15 backdrop-blur-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>10.00 - 21.00 WIB</span>
          </div>

          <a
            href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-xs hover:scale-105 active:scale-95"
            title="Buka WhatsApp Langsung"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href="https://www.tiktok.com/@masjastippurbolinggo01"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 hover:bg-black text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-xs border border-white/20 hover:scale-105 active:scale-95"
            title="Buka Akun TikTok Resmi MAS JASTIP PURBOLINGGO 01"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 4.8 1.52V6.69z"/>
            </svg>
            <span>TikTok</span>
          </a>
        </div>
      </div>

      {/* Hero Main Content */}
      <section className="relative overflow-hidden bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs">
        
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Heading, Value Props & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Official Brand Profile Badge */}
            <div className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-blue-50/60 border border-orange-200/90 shadow-2xs max-w-lg">
              <img
                src="/mas-jastip-logo.png"
                alt="MAS JASTIP - purbolinggo -"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-md ring-4 ring-orange-500/30 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight font-heading">
                    MAS <span className="text-blue-600">JASTIP</span>
                  </span>
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs tracking-wider">
                    - purbolinggo -
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  &ldquo;Mudahnya serahin ke MAS JASTIP&rdquo;
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-1.5 flex-wrap">
                  <a
                    href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition shadow-2xs hover:scale-105 active:scale-95"
                    title="Buka WhatsApp Langsung"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href="https://www.tiktok.com/@masjastippurbolinggo01"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold hover:bg-black transition shadow-2xs hover:scale-105 active:scale-95"
                    title="Buka TikTok Langsung"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 4.8 1.52V6.69z"/>
                    </svg>
                    <span>TikTok</span>
                  </a>

                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-emerald-700 font-extrabold">● Buka 10.00 - 21.00</span>
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight font-heading">
              Jasa Titip &amp; Suruh{' '}
              <span className="text-blue-600 block sm:inline">Purbolinggo</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Solusi praktis semua kebutuhan warga se-Kecamatan Purbolinggo (Taman Endah, Taman Fajar, Toto Harjo, dll) &amp; rute belanja ke Kota Metro. Ongkir dihitung otomatis per KM jalan raya sebenarnya.
            </p>

            {/* 3 Values from Poster */}
            <div className="grid grid-cols-3 gap-2 py-2 max-w-md">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-center">
                <span className="text-lg block">🛡️</span>
                <span className="text-xs font-bold text-blue-900">AMANAH</span>
              </div>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-center">
                <span className="text-lg block">⚡</span>
                <span className="text-xs font-bold text-blue-900">CEPAT</span>
              </div>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-center">
                <span className="text-lg block">😊</span>
                <span className="text-xs font-bold text-blue-900">RAMAH</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={onStartOrder}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl transition text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95"
              >
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenTracking}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3.5 rounded-2xl border border-slate-200 transition text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs"
              >
                <Bike className="w-5 h-5 text-blue-600" />
                <span>Lacak Pesanan Saya</span>
              </button>
            </div>

            {/* Ongkir note */}
            <div className="pt-2 text-xs font-bold text-slate-500 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200 text-[11px]">
                ONGKIR
              </span>
              <span>TERGANTUNG JARAK (KM) • Transparan tanpa markup</span>
            </div>

          </div>

          {/* Right Column: Poster Resmi MAS JASTIP Purbolinggo */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 bg-white max-w-sm w-full group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/10">
              {/* Perfectly cropped poster image (no black bars, no obstructions) */}
              <img
                src="/mas-jastip-poster.jpg"
                alt="Poster Resmi MAS JASTIP Purbolinggo"
                className="w-full h-auto block object-cover rounded-t-3xl"
              />
              
              {/* Bottom Information & Contact Bar */}
              <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/mas-jastip-logo.png"
                    alt="Logo Profil MAS JASTIP"
                    className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs ring-1 ring-orange-500/30"
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-slate-900 truncate">
                      MAS JASTIP <span className="text-blue-600 font-bold">- purbolinggo -</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <span>🕒 10.00 - 21.00 WIB</span>
                      <span>•</span>
                      <span>Lampung Timur</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95"
                    title="Buka WhatsApp MAS JASTIP Langsung"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href="https://www.tiktok.com/@masjastippurbolinggo01"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900 hover:bg-black text-white text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95"
                    title="Buka TikTok Resmi MAS JASTIP PURBOLINGGO 01"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 4.8 1.52V6.69z"/>
                    </svg>
                    <span>TikTok</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* Official 7 Services List (Matching Poster Exactly) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Layanan Siap Antar MAS JASTIP
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pilih layanan yang Anda butuhkan, tim rider Mas Jastip siap melayani dengan cepat dan amanah.
            </p>
          </div>

          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 self-start sm:self-auto">
            Semua Layanan Siap Meluncur 🛵
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {serviceList.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                onClick={onStartOrder}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{srv.title}</h3>
                    <span className="text-[11px] text-slate-400">Siap melayani se-Purbolinggo</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full shrink-0">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Siap</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
