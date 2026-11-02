import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle, Info, ArrowUpRight } from 'lucide-react';
import { KECAMATAN_LIST } from '../data/initialData';
import { getZones, subscribeToStore } from '../services/storageService';
import { formatRupiah } from '../services/pricingEngine';
import { ZoneTariff } from '../types';

export const ZonesSection: React.FC = () => {
  const [zones, setZones] = useState<ZoneTariff[]>(getZones());

  useEffect(() => {
    return subscribeToStore(() => {
      setZones(getZones());
    });
  }, []);

  const standardCategories = [
    { name: 'Dalam Dusun / Sekitar Rumah (< 1.5 KM)', defaultRate: 5000, desc: 'Perjalanan sangat dekat, titip belanja warung / pos', badge: 'Uang Pas 5 Ribu' },
    { name: 'Antar Desa Dekat (Taman Asri ➔ Taman Fajar/Pasar)', defaultRate: 7000, desc: 'Pasar Simpang ke rumah warga dusun terdekat', badge: 'Paling Sering' },
    { name: 'Antar Desa Sedang (Taman Asri ➔ Toto Harjo)', defaultRate: 10000, desc: 'Rute sedang lintas dusun atau area kebun', badge: 'Standar Desa' },
    { name: 'Purbolinggo ➔ Raman Utara / Way Bungur', defaultRate: 14000, desc: 'Perjalanan antar kecamatan perbatasan tetangga', badge: 'Antar Kecamatan' },
    { name: 'Purbolinggo ➔ RSUD Sukadana Lamtim', defaultRate: 18000, desc: 'Jarak jauh rujukan puskesmas ke rumah sakit daerah', badge: 'Rute Utama' },
  ];

  return (
    <section id="zona" className="py-14 md:py-20 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
            Pedoman Tarif Warga
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
            Daftar Tarif Antar Dusun &amp; Desa
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Tarif telah disepakati bersama agar adil bagi warga dan mensejahterakan kurir motor lokal.
          </p>
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Table */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" />
              <span>Patokan Tarif Standar GoRide PBL</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                    <th className="pb-3">Wilayah Rute</th>
                    <th className="pb-3">Keterangan</th>
                    <th className="pb-3 text-right">Ongkos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {standardCategories.map((cat) => (
                    <tr key={cat.name} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 pr-2">
                        <div className="font-extrabold text-slate-900">{cat.name}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {cat.badge}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 text-xs pr-2 font-medium">
                        {cat.desc}
                      </td>
                      <td className="py-3.5 text-right font-black text-emerald-700 text-base whitespace-nowrap">
                        {formatRupiah(cat.defaultRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Untuk jarak di luar daftar rute di atas, sistem otomatis menghitung Rp 1.500 per KM.</span>
            </div>
          </div>

          {/* Right: Covered Areas */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-850 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg">
            <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Cakupan Wilayah PBL</span>
            </h3>
            <p className="text-xs text-emerald-200 mb-4 font-medium">
              Kurir kami standby dan siap menjemput di seluruh area dusun berikut:
            </p>

            <div className="space-y-2">
              {KECAMATAN_LIST.map((kec) => (
                <div
                  key={kec.name}
                  className="bg-white/10 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5 text-xs font-bold text-white"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{kec.name}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-200 flex items-center justify-between">
              <span>Punya rute khusus ke luar desa?</span>
              <a
                href="#beranda"
                className="text-white font-bold underline flex items-center gap-1"
              >
                <span>Tanya Admin</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
