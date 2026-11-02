import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { formatRupiah } from '../services/pricingEngine';
import { getPricingConfig } from '../services/storageService';

const FAQS = [
  {
    q: 'Berapa tarif jasa?',
    a: (config: any) =>
      `Tarif dasar layanan kami mulai dari ${formatRupiah(config.minimumPrice)} untuk dalam satu kecamatan. Untuk rute antar kecamatan, tarif disesuaikan berdasarkan jarak kilometer (sekitar ${formatRupiah(config.pricePerKm)}/km) atau zona tetap antar kecamatan yang telah ditentukan. Anda dapat langsung mengeceknya di Kalkulator Ongkos.`,
  },
  {
    q: 'Apakah bisa antar kecamatan?',
    a: () =>
      'Tentu saja sangat bisa! Fokus utama layanan kami adalah melayani pengantaran cepat dan titip barang baik dalam satu kecamatan maupun antar seluruh kecamatan di dalam kota.',
  },
  {
    q: 'Bagaimana cara menghitung ongkos?',
    a: () =>
      'Cukup pilih atau ketik alamat pickup (lokasi pengambilan) dan alamat tujuan di Kalkulator Ongkos pada halaman ini. Sistem kami akan secara otomatis menghitung rute jalan sebenarnya via peta, lalu memunculkan total jarak (KM), estimasi waktu tempuh, dan ongkos pastinya.',
  },
  {
    q: 'Apakah harga bisa berubah?',
    a: () =>
      'Harga yang muncul pada kalkulator adalah estimasi tarif ongkos jasa yang transparan. Perubahan harga hanya terjadi apabila Anda menambahkan layanan khusus seperti antre lebih dari 15 menit, pengiriman malam hari di atas jam 20:00, atau muatan barang berukuran besar di atas 10 kg.',
  },
  {
    q: 'Apakah bisa pesan melalui WhatsApp?',
    a: () =>
      'Ya! Setelah Anda menekan tombol "Pesan Sekarang" di kalkulator, sistem secara otomatis merangkum semua rincian pesanan dan membuka chat WhatsApp dengan format teks yang rapi ke admin standby kami.',
  },
  {
    q: 'Bagaimana cara mengetahui status pesanan?',
    a: () =>
      'Setiap pesanan yang dibuat akan memiliki Kode Pesanan unik (contoh: JST-2026-00125). Anda bisa memasukkan kode tersebut pada fitur "Lacak Pesanan" di website ini untuk melihat timeline status kurir secara real-time.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const config = getPricingConfig();

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs md:text-sm font-semibold mb-3">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Pertanyaan yang Sering Diajukan</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Segala hal yang perlu Anda ketahui tentang pemesanan dan ketentuan tarif kami.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base transition"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-emerald-50 text-emerald-600 border-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="p-5 sm:p-6 pt-2 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a(config)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
