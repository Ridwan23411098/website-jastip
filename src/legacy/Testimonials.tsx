import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Ibu Siti Khodijah',
    role: 'Ibu Rumah Tangga (Dusun 1)',
    content: 'Sangat bersyukur ada GoRide PBL. Waktu hujan lebat dan motor suami dipakai kerja, saya titip belanja sembako dan sayur ke pasar. Belanjaan lengkap, kembalian pas, kurirnya sopan.',
    rating: 5,
    tag: 'Titip Belanja Pasar',
  },
  {
    name: 'Pak RT Hendra',
    role: 'Pengurus Dusun (Dusun 2)',
    content: 'Sangat membantu untuk urusan surat-menyurat desa ke kantor kecamatan. Nggak perlu tinggalkan pekerjaan di kebun, tinggal suruh kurir PBL surat sampai tepat waktu.',
    rating: 5,
    tag: 'Antar Dokumen & Surat',
  },
  {
    name: 'Rian & Ibu Nur',
    role: 'Warga Dusun 3',
    content: 'Ongkosnya murah dan sudah pasti di kalkulator, jadi orang tua seperti saya tidak bingung nawar harga. Drivernya juga anak-anak muda warga desa sendiri yang amanah.',
    rating: 5,
    tag: 'Ojek Motor Warga',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-14 md:py-20 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
            Cerita Warga
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
            Pendapat Tetangga &amp; Warga Desa
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Layanan dibuat dari warga, oleh warga, untuk kemudahan seluruh warga PBL.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {t.tag}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic mb-6">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{t.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
