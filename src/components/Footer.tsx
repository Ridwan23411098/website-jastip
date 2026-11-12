import React from 'react';
import { Bike, Heart, MapPin, Phone, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'order' | 'tracking' | 'howItWorks' | 'history' | 'admin' | 'courier') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const villages = [
    'Taman Endah',
    'Taman Fajar',
    'Taman Bogo',
    'Taman Cari',
    'Taman Asri',
    'Toto Harjo',
    'Tanjung Inten',
    'Tanjung Kesuma',
    'Tambah Dadi',
    'Tambah Luhur',
    'Tegal Gondo',
    'Tegal Yoso',
  ];

  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-16 sm:pb-8 mt-16 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              <img
                src="/mas-jastip-logo.png"
                alt="Logo Resmi MAS JASTIP Purbolinggo"
                className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-orange-500/80 shrink-0 bg-white"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('jsp-logo.png')) target.src = '/jsp-logo.png';
                }}
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xl text-slate-900 font-heading">
                    MAS <span className="text-orange-600">JASTIP</span>
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs tracking-wider">
                    Purbolinggo
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  &ldquo;Mudahnya Serahin ke MAS JASTIP!&rdquo;
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Layanan jasa titip dan jasa suruh harian terpercaya warga Kecamatan Purbolinggo, Kabupaten Lampung Timur. 
              Cepat, amanah, dan ramah dengan perhitungan ongkir transparan berdasarkan jarak rute jalan raya sebenarnya.
            </p>

            {/* Operating hours & Contacts */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Jam Operasional: 10.00 - 21.00 WIB (Buka Setiap Hari)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                <a
                  href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl transition font-bold shadow-2xs"
                  title="Chat WhatsApp MAS JASTIP (0857-8952-8805)"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp: 0857-8952-8805</span>
                </a>

                <a
                  href="https://www.tiktok.com/@masjastippurbolinggo01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-xl transition font-bold shadow-2xs"
                  title="TikTok Resmi MAS JASTIP"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.62a8.28 8.28 0 0 0 4.8 1.52V6.69z"/>
                  </svg>
                  <span>TikTok: @masjastippurbolinggo01</span>
                </a>
              </div>
            </div>

            {/* Coverage Area Chips */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Cakupan Wilayah 12 Desa di Kec. Purbolinggo &amp; Antar-Kota:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {villages.map((v) => (
                  <span key={v} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-200/60">
                    {v}
                  </span>
                ))}
                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-orange-200">
                  + Rute Kota Metro
                </span>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-200">
                  + Kotagajah / Sukadana
                </span>
              </div>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm font-heading">Menu Navigasi</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <span>Beranda</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('order')} className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <span>Buat Pesanan Jastip</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <span>Lacak Status Pesanan</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('howItWorks')} className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <span>Cara Kerja &amp; Tanya Jawab</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <span>Riwayat Pesanan Anda</span>
                </button>
              </li>
            </ul>
          </div>

          {/* 7 Layanan Resmi */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm font-heading">Layanan Unggulan</h4>
            <ul className="space-y-1.5 text-slate-600 font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Pesanin Makanan &amp; Minuman</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Ambil / Antar Paket Ekspedisi</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Order (Titip Belanja Sembako/Toko)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Ojek Jemput / Antar Orang</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Ambil / Antar Hewan Peliharaan</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Delivery Olshop Warga</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Rute Belanja Kota Metro</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <p>© {new Date().getFullYear()} MAS JASTIP Purbolinggo. Amanah • Cepat • Ramah. Seluruh hak cipta dilindungi.</p>
          <p className="flex items-center gap-1 font-semibold text-slate-600">
            <span>&ldquo;Mudahnya Serahin ke MAS JASTIP!&rdquo;</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
