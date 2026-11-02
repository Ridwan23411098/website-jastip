import React from 'react';
import { Bike, Heart, MapPin, Phone, ShieldCheck, Clock } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 mt-16 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/mas-jastip-logo.png"
                alt="Logo Profil MAS JASTIP - purbolinggo -"
                className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-orange-500/50 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xl text-slate-900 font-heading">
                    MAS <span className="text-blue-600">JASTIP</span>
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs tracking-wider">
                    - purbolinggo -
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  &ldquo;Mudahnya serahin ke MAS JASTIP&rdquo;
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Jasa titip &amp; jasa suruh harian warga Kecamatan Purbolinggo (Lampung Timur) dan sekitarnya. Ongkir dihitung transparan per KM jalan raya sebenarnya.
            </p>

            {/* Operating hours & Contacts */}
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Jam Operasional: 10.00 - 21.00 WIB</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200/60 font-semibold">
                <a
                  href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl transition shadow-xs hover:scale-105 active:scale-95"
                  title="Chat WhatsApp MAS JASTIP Purbolinggo"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp: 0813-6976-7697</span>
                </a>

                <a
                  href="https://www.tiktok.com/@masjastippurbolinggo01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-xl transition shadow-xs hover:scale-105 active:scale-95"
                  title="Buka Akun TikTok Resmi MAS JASTIP PURBOLINGGO 01"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 4.8 1.52V6.69z"/>
                  </svg>
                  <span>TikTok: MAS JASTIP PURBOLINGGO 01</span>
                </a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Melayani 12 Desa Purbolinggo:</span>
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                Taman Endah, Taman Fajar, Taman Bogo, Taman Cari, Taman Asri, Toto Harjo, Tanjung Inten, Tanjung Kesuma, Tambah Dadi, Tambah Luhur, Tegal Gondo, Tegal Yoso.
              </p>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-sm font-heading">Menu Utama</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-blue-600 transition">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('order')} className="hover:text-blue-600 transition">
                  Buat Pesanan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-blue-600 transition">
                  Lacak Pesanan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('howItWorks')} className="hover:text-blue-600 transition">
                  Cara Kerja
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-blue-600 transition">
                  Riwayat Pesanan
                </button>
              </li>
            </ul>
          </div>

          {/* 7 Layanan Sesuai Poster */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-sm font-heading">Layanan MAS JASTIP</h4>
            <ul className="space-y-1.5 text-slate-500">
              <li>• Pesanin Makanan/Minuman</li>
              <li>• Ambil Barang / Antar Barang</li>
              <li>• Jemput / Antar Orang</li>
              <li>• Ambil / Antar Hewan Peliharaan</li>
              <li>• Delivery Olshop &amp; Toko</li>
              <li>• Order (Titip Belanja)</li>
              <li>• Dan lain-lain (Serbaguna)</li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <p>© {new Date().getFullYear()} MAS JASTIP Purbolinggo, Lampung Timur. Amanah • Cepat • Ramah.</p>
          <p className="flex items-center gap-1">
            <span>Mudahnya serahin ke MAS JASTIP</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
