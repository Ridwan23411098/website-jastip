import React from 'react';
import { MapPin, Calculator, Send, Bike } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Pilih Lokasi',
    desc: 'Tentukan di mana lokasi jemput dan tujuan Anda di desa atau dusun.',
    icon: MapPin,
  },
  {
    step: '02',
    title: 'Lihat Ongkos',
    desc: 'Ongkos muncul otomatis, terjangkau, dan tidak perlu tawar-menawar.',
    icon: Calculator,
  },
  {
    step: '03',
    title: 'Pesan via WhatsApp',
    desc: 'Cukup tekan tombol, pesan otomatis langsung terkirim ke admin desa.',
    icon: Send,
  },
  {
    step: '04',
    title: 'Driver Meluncur',
    desc: 'Kurir motor warga kami langsung meluncur menjemput atau mengantar.',
    icon: Bike,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="cara-kerja" className="py-14 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
            Gampang &amp; Nggak Ribet
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
            Cara Pesan Hanya 4 Langkah
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Tidak perlu install aplikasi berat di HP yang bikin memori penuh. Cukup pesan lewat WhatsApp!
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm hover:border-emerald-400 transition"
              >
                <span className="text-5xl font-black text-slate-200 absolute -top-1 right-4 select-none pointer-events-none">
                  {item.step}
                </span>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    Langkah {item.step}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-200/80 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Praktis &amp; Aman</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
