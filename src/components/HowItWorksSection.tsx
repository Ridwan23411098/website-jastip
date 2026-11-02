import React from 'react';
import {
  MapPin,
  Calculator,
  Bike,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

interface HowItWorksSectionProps {
  onStartOrder: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartOrder }) => {
  const steps = [
    {
      step: '01',
      title: 'Tentukan Titik Lokasi',
      desc: 'Ketik alamat atau pilih lokasi penjemputan dan tujuan langsung pada peta OpenStreetMap.',
      icon: MapPin,
    },
    {
      step: '02',
      title: 'Hitung Ongkos Otomatis',
      desc: 'Sistem langsung menghitung jarak tempuh (KM) dan estimasi biaya secara pasti tanpa biaya tersembunyi.',
      icon: Calculator,
    },
    {
      step: '03',
      title: 'Kurir Menjalankan Tugas',
      desc: 'Kurir lokal MAS JASTIP Purbolinggo menerima pesanan Anda dan segera menuju toko atau lokasi penjemputan.',
      icon: Bike,
    },
    {
      step: '04',
      title: 'Lacak Realtime & Selesai',
      desc: 'Pantau status pesanan hingga barang sampai di tanganmu, lalu bayar dengan aman kepada kurir.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Mudah, Cepat &amp; Amanah</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
          Cara Kerja Layanan MAS JASTIP
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Mudahnya serahin ke MAS JASTIP! Cukup 4 langkah mudah untuk pesan makanan, antar jemput, maupun titip belanja.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.step}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 font-heading">
                    {st.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading mb-2">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Card */}
      <div className="bg-blue-600 rounded-3xl p-8 sm:p-10 text-white text-center shadow-lg shadow-blue-600/20 space-y-4">
        <h3 className="text-2xl sm:text-3xl font-black font-heading">
          Siap Memesan Jasa Titip atau Jasa Suruh?
        </h3>
        <p className="text-blue-100 text-sm max-w-lg mx-auto">
          Tentukan lokasi sekarang dan biarkan kurir terpercaya AntarAja menyelesaikan kebutuhanmu.
        </p>
        <div>
          <button
            onClick={onStartOrder}
            className="bg-white hover:bg-slate-100 text-blue-600 font-extrabold px-8 py-3.5 rounded-2xl transition text-sm inline-flex items-center gap-2 shadow-md active:scale-95"
          >
            <span>Mulai Pesan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
