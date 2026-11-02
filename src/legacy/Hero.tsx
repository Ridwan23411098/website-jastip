import React from 'react';
import {
  Calculator,
  Send,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Bike,
  Package,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { getPricingConfig } from '../services/storageService';

interface HeroProps {
  onScrollToCalculator: () => void;
  onOpenOrderModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToCalculator,
  onOpenOrderModal,
}) => {
  const config = getPricingConfig();

  return (
    <section id="beranda" className="relative bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 text-slate-800 pt-8 pb-16 md:pt-14 md:pb-20 overflow-hidden">
      
      {/* Decorative soft glowing blobs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-100/70 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-100/60 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (Copy & Actions) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Layanan Ojek &amp; Titip Belanja Resmi Warga Desa PBL</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.2]">
              Jasa Ojek, Titip &amp; Suruh, <br className="hidden sm:inline" />
              <span className="text-emerald-700 underline decoration-emerald-400 decoration-wavy">
                Mudah, Ramah &amp; Murah.
              </span>
            </h1>

            {/* Subheadline - Simple & clear for village residents */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Mau pergi ke pasar, belanja sembako, ambil paket, tebus obat, atau minta tolong apa saja? Tim ojek motor <strong>GoRide PBL</strong> siap melayani warga antar dusun dan desa dengan ongkos jelas tanpa tawar-menawar.
            </p>

            {/* 2 Big Friendly Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={onScrollToCalculator}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-8 rounded-2xl transition duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 active:scale-[0.98] text-base"
              >
                <Calculator className="w-5 h-5" />
                <span>Cek Ongkos Sekarang</span>
              </button>

              <button
                type="button"
                onClick={onOpenOrderModal}
                className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold py-4 px-8 rounded-2xl transition duration-200 flex items-center justify-center gap-2.5 border-2 border-emerald-600 shadow-md active:scale-[0.98] text-base"
              >
                <Send className="w-5 h-5 text-emerald-600" />
                <span>Pesan Cepat via WhatsApp</span>
              </button>
            </div>

            {/* Trust Badges - Bahasa Sederhana */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ongkos Tertera Pasti
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kurir Tetangga Sendiri
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bisa Bayar di Tempat (COD)
              </span>
            </div>

          </div>

          {/* Right Column: Clean & Elegant Village Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
                
                {/* Header of the visual card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Bike className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">Driver Siap Berangkat</h4>
                      <p className="text-xs text-slate-500 font-medium">Standby di pangkalan &amp; pos desa</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    Online
                  </span>
                </div>

                {/* Example Route Box */}
                <div className="py-5 space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                      A
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Titik Jemput / Lokasi</span>
                      <div className="text-sm font-bold text-slate-900">Pasar Pagi / Rumah Warga</div>
                      <div className="text-xs text-slate-500">Dusun 1 &amp; Dusun 2 PBL</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                      B
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tujuan Pengantaran</span>
                      <div className="text-sm font-bold text-slate-900">Alamat Rumah / Balai Desa</div>
                      <div className="text-xs text-slate-500">Sampai di depan pintu dengan selamat</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Highlight */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-emerald-800 font-bold block">Tarif Sesama Dusun Mulai:</span>
                    <strong className="text-xl text-emerald-700 font-black">Rp 5.000</strong>
                  </div>
                  <button
                    type="button"
                    onClick={onScrollToCalculator}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Coba Hitung</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* 4 Core Statistics (Simple & Big) */}
        <div className="mt-12 pt-8 border-t border-slate-200/80">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                10+ Dusun
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Area Desa &amp; Sekitarnya
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                500+ Trip
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Warga Telah Terbantu
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                &lt; 30 Menit
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Cepat Siaga di Lokasi
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                4.9/5 Jempol
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Puas &amp; Terpercaya
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
