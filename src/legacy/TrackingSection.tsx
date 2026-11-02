import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  Bike,
  PackageCheck,
  MapPin,
  CheckCheck,
  Phone,
  ShieldCheck,
  AlertCircle,
  Camera,
  Eye,
  X,
  Sparkles
} from 'lucide-react';
import { findOrderByCode, subscribeToStore } from '../services/storageService';
import { Order, OrderStatus } from '../types';
import { formatRupiah } from '../services/pricingEngine';

interface TrackingSectionProps {
  initialCode?: string;
}

const TIMELINE_STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: 'DITERIMA',
    label: 'Pesanan Diterima',
    desc: 'Pesanan masuk ke driver GoRide PBL',
    icon: Clock,
  },
  {
    status: 'DRIVER_DITUGASKAN',
    label: 'Driver Siap',
    desc: 'Kurir motor ditugaskan',
    icon: UserCheck,
  },
  {
    status: 'MENUJU_PICKUP',
    label: 'Menuju Toko',
    desc: 'Kurir menuju toko/resto',
    icon: Bike,
  },
  {
    status: 'BARANG_DIAMBIL',
    label: 'Foto & Ambil Barang',
    desc: 'Foto makanan terverifikasi di toko',
    icon: PackageCheck,
  },
  {
    status: 'DALAM_PERJALANAN',
    label: 'Dalam Perjalanan',
    desc: 'Kurir meluncur ke rumah Anda',
    icon: MapPin,
  },
  {
    status: 'SELESAI',
    label: 'Pesanan Sampai',
    desc: 'Tuntas sampai tujuan dengan selamat',
    icon: CheckCheck,
  },
];

const STATUS_PROGRESS_ORDER: Record<OrderStatus, number> = {
  DITERIMA: 0,
  DRIVER_DITUGASKAN: 1,
  MENUJU_PICKUP: 2,
  BARANG_DIAMBIL: 3,
  DALAM_PERJALANAN: 4,
  SELESAI: 5,
  DIBATALKAN: -1,
};

export const TrackingSection: React.FC<TrackingSectionProps> = ({ initialCode = '' }) => {
  const [inputCode, setInputCode] = useState(initialCode || 'PBL-2026-00125');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => findOrderByCode('PBL-2026-00125') || null);
  const [hasSearched, setHasSearched] = useState(true);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  // Subscribe to real-time storage updates (when driver uploads photo or changes status)
  useEffect(() => {
    return subscribeToStore(() => {
      if (searchedOrder) {
        const updated = findOrderByCode(searchedOrder.orderCode);
        if (updated) setSearchedOrder(updated);
      }
    });
  }, [searchedOrder?.orderCode]);

  // Keep synced if initialCode prop changes
  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      const found = findOrderByCode(initialCode);
      if (found) setSearchedOrder(found);
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const found = findOrderByCode(inputCode);
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const currentStepIndex = searchedOrder
    ? STATUS_PROGRESS_ORDER[searchedOrder.status] ?? 0
    : 0;

  return (
    <section id="tracking" className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Lacak Pesanan Warga</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Cek Status Ojek &amp; Titipan Anda
          </h2>
          <p className="mt-2 text-sm text-slate-300 font-medium">
            Ketik kode pesanan untuk melihat status terkini dan <strong>bukti foto makanan dari toko</strong>.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-4 relative z-10">
          <div className="flex flex-col sm:flex-row gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700 shadow-xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Contoh: PBL-2026-00125"
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 font-mono font-bold focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <span>Lacak Sekarang</span>
            </button>
          </div>
        </form>

        {/* Sample link */}
        <div className="text-center text-xs text-slate-400 mb-8 relative z-10">
          <span>Contoh kode aktif: </span>
          <button
            onClick={() => {
              setInputCode('PBL-2026-00125');
              setSearchedOrder(findOrderByCode('PBL-2026-00125') || null);
            }}
            className="text-emerald-400 hover:underline font-mono font-bold ml-1"
          >
            PBL-2026-00125 (Klik di sini)
          </button>
        </div>

        {/* Order Result Card */}
        {searchedOrder ? (
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
            
            {/* Top Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700">
              <div>
                <span className="text-xs text-slate-400 font-medium">Nomor Kode Pesanan:</span>
                <h3 className="text-2xl font-mono font-black text-emerald-400 mt-0.5">
                  {searchedOrder.orderCode}
                </h3>
                <div className="text-xs text-slate-300 mt-1">
                  Layanan: <strong className="text-white">{searchedOrder.serviceType}</strong> • Pemesan: {searchedOrder.customerName}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 font-medium block">Total Ongkos</span>
                <span className="text-2xl font-black text-white">
                  {formatRupiah(searchedOrder.totalPrice)}
                </span>
                <div className="text-xs text-emerald-400 font-bold mt-0.5">
                  Jarak: {searchedOrder.distanceKm} KM
                </div>
              </div>
            </div>

            {/* Visual Timeline (6 Steps) */}
            <div className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isPassed = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.status}
                      className={`p-3 rounded-2xl border transition text-center flex flex-col items-center justify-center ${
                        isCurrent
                          ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50'
                          : isPassed
                          ? 'bg-slate-700/60 border-slate-600'
                          : 'bg-slate-800/40 border-slate-800 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 font-bold ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-emerald-400' : isPassed ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {step.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SHOPEEFOOD PHOTO PROOF CARD IN CUSTOMER TRACKING */}
            {searchedOrder.pickupPhoto ? (
              <div className="my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-slate-900 border-2 border-orange-500/50 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center font-black">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                        <span>Foto Bukti Makanan di Toko</span>
                        <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                          Ala ShopeeFood
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Driver telah memfotokan pesanan Anda setibanya di toko sebagai bukti keaslian
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terverifikasi di Toko</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div
                    onClick={() => setEnlargedPhoto(searchedOrder.pickupPhoto!)}
                    className="relative w-full sm:w-52 h-40 rounded-xl overflow-hidden border-2 border-orange-500/60 shadow-lg cursor-pointer group shrink-0"
                  >
                    <img
                      src={searchedOrder.pickupPhoto}
                      alt="Foto Makanan di Toko"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                      <span className="bg-black/75 text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow">
                        <Eye className="w-3.5 h-3.5 text-orange-400" />
                        <span>Klik Perbesar</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-xs w-full">
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Catatan Driver di Toko:
                      </span>
                      <p className="text-white font-medium text-xs mt-0.5">
                        {searchedOrder.pickupPhotoNotes || 'Makanan & pesanan sudah siap diambil di toko, kondisi rapi sesuai pesanan.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                      {searchedOrder.pickupPhotoTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-400" />
                          <span>Waktu Foto: {new Date(searchedOrder.pickupPhotoTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Driver: <strong className="text-white">{searchedOrder.driverName || 'Driver GoRide PBL'}</strong></span>
                      </div>
                    </div>

                    {searchedOrder.driverPhone && (
                      <a
                        href={`https://wa.me/${searchedOrder.driverPhone}?text=Halo%20${encodeURIComponent(searchedOrder.driverName || 'Driver')}%2C%20terima%20kasih%20foto%20makanannya%20sudah%20saya%20lihat%20di%20web%20GoRide%20PBL.%20Hati-hati%20di%20jalan%20ya%20mas!`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Tanya Driver via WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              (searchedOrder.status === 'MENUJU_PICKUP' || searchedOrder.status === 'DRIVER_DITUGASKAN') && (
                <div className="my-4 p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/30 flex items-center gap-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-bold text-orange-300 block">
                      Driver Sedang Menuju ke Toko
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      Setibanya driver di <strong>{searchedOrder.pickupAddress}</strong>, driver akan memfotokan makanan Anda sebagai bukti seperti fitur ShopeeFood!
                    </span>
                  </div>
                </div>
              )
            )}

            {/* Bottom info: Driver info + Addresses */}
            <div className="pt-5 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Driver Card */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Kurir / Ojek Bertugas:
                  </span>
                  <div className="font-extrabold text-white text-sm mt-0.5">
                    {searchedOrder.driverName || 'Driver GoRide PBL'}
                  </div>
                  {searchedOrder.driverPhone && (
                    <div className="text-slate-400 text-xs">
                      WA: +{searchedOrder.driverPhone}
                    </div>
                  )}
                </div>

                {searchedOrder.driverPhone && (
                  <a
                    href={`https://wa.me/${searchedOrder.driverPhone}?text=Halo%20kurir%2C%20saya%20pemesan%20${searchedOrder.orderCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition flex items-center gap-1.5 font-bold text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hubungi Driver</span>
                  </a>
                )}
              </div>

              {/* Locations */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-1.5 text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">Titik Toko:</span>
                  <span className="text-white font-medium">{searchedOrder.pickupAddress}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">Tujuan Antar:</span>
                  <span className="text-white font-medium">{searchedOrder.destinationAddress}</span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          hasSearched && (
            <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 text-center max-w-sm mx-auto relative z-10">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-base font-bold">Pesanan Belum Ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1">
                Pastikan nomor kode pesanan sudah sesuai, atau langsung hubungi nomor WhatsApp driver Anda.
              </p>
            </div>
          )
        )}

      </div>

      {/* FULLSCREEN PHOTO ENLARGER MODAL FOR CUSTOMER */}
      {enlargedPhoto && (
        <div
          onClick={() => setEnlargedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-4"
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-white text-sm">Foto Bukti Makanan di Toko (ShopeeFood)</span>
              </div>
              <button
                onClick={() => setEnlargedPhoto(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={enlargedPhoto}
                alt="Enlarged food proof"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs text-emerald-400 font-bold">
                ✓ Difoto langsung oleh driver di lokasi toko
              </span>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
