import React from 'react';
import {
  Bike,
  ShoppingBag,
  PackageCheck,
  Send,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

const SERVICES = [
  {
    id: 'ojek',
    name: 'Ojek Motor Warga',
    title: 'Antar Jemput Nyaman & Cepat',
    description: 'Butuh bepergian ke pasar, kantor desa, puskesmas, atau ke jalan lintas? Ojek kami siap jemput ke depan pintu rumah.',
    icon: Bike,
    badge: 'Paling Sering',
  },
  {
    id: 'belanja',
    name: 'Jasa Titip Belanja Pasar',
    title: 'Belanja Sembako & Sayur Mayur',
    description: 'Nggak sempat ke pasar pagi? Titip beli beras, minyak, sayur, gas melon, atau kebutuhan dapur tanpa repot.',
    icon: ShoppingBag,
    badge: 'Favorit Ibu-Ibu',
  },
  {
    id: 'paket',
    name: 'Antar Paket & Barang',
    title: 'Kirim Barang Aman Sampai Tujuan',
    description: 'Mau kirim oleh-oleh ke kerabat di dusun sebelah, antar hasil kebun, atau jemput paket belanja online di agen.',
    icon: PackageCheck,
    badge: 'Aman & Utuh',
  },
  {
    id: 'suruh',
    name: 'Jasa Suruh & Tebus Obat',
    title: 'Bantuan Praktis Serba Bisa',
    description: 'Minta tolong antre obat di puskesmas/apotek, bayar tagihan di agen, atau urusan mendesak lainnya. Tinggal suruh.',
    icon: Send,
    badge: 'Bisa Minta Tolong',
  },
  {
    id: 'sekolah',
    name: 'Antar Jemput Sekolah',
    title: 'Anak Sekolah Aman & Tepat Waktu',
    description: 'Layanan langganan antar-jemput anak sekolah SD, SMP, atau Madrasah diantar oleh kurir warga sendiri yang amanah.',
    icon: GraduationCap,
    badge: 'Langganan',
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section id="layanan" className="py-14 md:py-20 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
            Layanan Komplit Warga Desa
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
            Apa yang Bisa Kami Bantu Hari Ini?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Pilih layanan yang Anda butuhkan. Semua harga bersahabat dan dilayani oleh sesama warga lokal.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white border-2 border-slate-200/80 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">
                    {srv.name}
                  </h3>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {srv.title}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed font-medium">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectService(srv.name)}
                    className="w-full bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 font-bold py-2.5 px-4 rounded-xl transition text-xs flex items-center justify-center gap-1.5 border border-emerald-200"
                  >
                    <span>Pilih {srv.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Ask Anything Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-md">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Butuh Bantuan Lain?
              </h3>
              <p className="text-xs font-bold text-emerald-300 mt-0.5">
                Konsultasi Bebas &amp; Ramah
              </p>
              <p className="text-xs sm:text-sm text-emerald-100 mt-2.5 leading-relaxed font-medium">
                Ada urusan lain yang belum tercantum di atas? Chat admin WhatsApp kami saja, kami siap bantu carikan solusi.
              </p>
            </div>

            <div className="pt-5 mt-5 border-t border-emerald-700/60">
              <button
                type="button"
                onClick={() => onSelectService('Lainnya')}
                className="w-full bg-white hover:bg-emerald-50 text-emerald-900 font-black py-2.5 px-4 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Tanya Admin Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
