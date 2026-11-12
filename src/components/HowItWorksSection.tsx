import React, { useState } from 'react';
import {
  MapPin,
  Calculator,
  Bike,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  Receipt,
  Clock,
  Phone
} from 'lucide-react';

interface HowItWorksSectionProps {
  onStartOrder: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartOrder }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      step: '01',
      title: 'Pilih Layanan & Lokasi',
      desc: 'Tentukan jenis titipan atau suruhan, lalu tentukan titik penjemputan dan alamat tujuan Anda.',
      icon: MapPin,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      step: '02',
      title: 'Ongkir Dihitung Otomatis',
      desc: 'Sistem langsung menghitung jarak (KM) rute jalan raya dan estimasi biaya secara pasti tanpa biaya tersembunyi.',
      icon: Calculator,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      step: '03',
      title: 'Rider Menjalankan Tugas',
      desc: 'Rider MAS JASTIP Purbolinggo langsung bergerak membeli makanan, mengambil paket, atau menjemput barang pesanan.',
      icon: Bike,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      step: '04',
      title: 'Lacak Realtime & Bayar di Rumah',
      desc: 'Pantau posisi kurir di peta secara langsung hingga barang sampai di depan pintu Anda. Bayar dengan tenang (COD / Transfer).',
      icon: CheckCircle2,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const faqs = [
    {
      q: 'Bagaimana cara perhitungan ongkos kirim (ongkir)?',
      a: 'Ongkir dihitung secara adil berdasarkan jarak sebenarnya (KM) dari titik jemput ke titik antar menggunakan kalkulasi rute jalan raya. Tidak ada biaya tersembunyi!',
    },
    {
      q: 'Kapan dan bagaimana saya membayar uang belanjaan & ongkir?',
      a: 'Pembayaran sangat fleksibel! Anda membayar saat pesanan tiba di tangan Anda (COD tunai) atau melalui transfer bank / QRIS. Uang belanjaan ditalangi terlebih dahulu oleh kurir kami.',
    },
    {
      q: 'Apakah barang belanjaan disertai nota pembelian asli?',
      a: 'Ya, 100% amanah! Rider kami selalu menyertakan struk / nota asli dari toko atau warung tempat membeli barang sebagai bukti transaksi yang transparan.',
    },
    {
      q: 'Apakah melayani titip belanja ke Kota Metro atau luar Purbolinggo?',
      a: 'Tentu bisa! Kami melayani rute belanja ke Kota Metro (Chandra Superstore, PB Swalayan, Pasar Cendrawasih), Kotagajah, Bandar Jaya, maupun Sukadana (Kantor Pemkab/RSUD).',
    },
    {
      q: 'Jam berapa layanan MAS JASTIP Purbolinggo beroperasi?',
      a: 'Kami melayani setiap hari mulai pukul 10.00 WIB hingga 21.00 WIB. Anda juga bisa menghubungi hotline WhatsApp kami di 0857-8952-8805 kapan saja.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span>Mudah, Cepat &amp; Amanah</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
          Cara Kerja Layanan MAS JASTIP
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          &ldquo;SERAHKAN SEMUA BERES!&rdquo; Hanya 4 langkah mudah untuk pesan makanan, antar jemput barang, maupun belanja kebutuhan harian.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.step}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${st.color} flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shadow-2xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 font-heading">
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

      {/* FAQ Section (Accordion) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
            <HelpCircle className="w-4 h-4" />
            <span>Pertanyaan Populer</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Tanya Jawab Seputar Layanan
          </h3>
        </div>

        <div className="divide-y divide-slate-100 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                >
                  <span>{faq.q}</span>
                  <div className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center transition-transform shrink-0 ${isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pr-8 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-10 text-white text-center shadow-xl shadow-blue-600/20 space-y-4">
        <h3 className="text-2xl sm:text-3xl font-black font-heading">
          Punya Kebutuhan Belanja atau Titipan Sekarang?
        </h3>
        <p className="text-blue-100 text-xs sm:text-sm max-w-lg mx-auto">
          Rider kami standby dan siap meluncur. Klik tombol di bawah untuk mulai memesan!
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartOrder}
            className="bg-white hover:bg-slate-100 text-blue-600 font-black px-8 py-3.5 rounded-2xl transition text-sm inline-flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
          >
            <span>Mulai Pesan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
