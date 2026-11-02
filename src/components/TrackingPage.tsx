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
  ArrowRight,
  ExternalLink,
  Navigation,
  Compass,
  Radio,
  FileText
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { findOrderByCode, getOrders, subscribeToStore, formatRupiah } from '../services/storageService';
import { getGoogleMapsNavUrl } from '../services/routingService';
import { MapPicker } from './MapPicker';

interface TrackingPageProps {
  initialCode?: string;
  onNavigateOrder?: () => void;
}

// 6 Timeline Steps required
const TRACKING_STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: 'Menunggu Kurir',
    label: 'Pesanan Masuk',
    desc: 'Pesanan tersimpan di sistem MAS JASTIP Purbolinggo',
    icon: Clock,
  },
  {
    status: 'Kurir Ditugaskan',
    label: 'Kurir Ditetapkan',
    desc: 'Kurir menerima tugas & menuju lokasi',
    icon: UserCheck,
  },
  {
    status: 'Menuju Lokasi',
    label: 'Menuju Titik Jemput',
    desc: 'Kurir dalam perjalanan ke toko/penjemputan',
    icon: Bike,
  },
  {
    status: 'Barang Diambil',
    label: 'Barang Diambil',
    desc: 'Barang/pesanan telah dibeli atau diambil',
    icon: PackageCheck,
  },
  {
    status: 'Dalam Perjalanan',
    label: 'Dalam Pengantaran',
    desc: 'Kurir meluncur ke alamat tujuan Anda',
    icon: MapPin,
  },
  {
    status: 'Selesai',
    label: 'Pesanan Selesai',
    desc: 'Pesanan diterima dengan aman & tuntas',
    icon: CheckCheck,
  },
];

const STATUS_PROGRESS: Record<OrderStatus, number> = {
  'Menunggu Kurir': 0,
  'Kurir Ditugaskan': 1,
  'Menuju Lokasi': 2,
  'Barang Diambil': 3,
  'Dalam Perjalanan': 4,
  'Selesai': 5,
  'Dibatalkan': -1,
};

export const TrackingPage: React.FC<TrackingPageProps> = ({
  initialCode = 'MJ-2026-001',
  onNavigateOrder,
}) => {
  const [inputCode, setInputCode] = useState(initialCode);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => findOrderByCode(initialCode) || null);
  const [hasSearched, setHasSearched] = useState(true);

  // Subscribe to reactive store changes (e.g. when courier GPS broadcast or status update occurs)
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
    ? STATUS_PROGRESS[searchedOrder.status] ?? 0
    : 0;

  // Courier display coordinates
  const activeCourierCoords = searchedOrder?.courierCoords || (
    searchedOrder?.status === 'Dalam Perjalanan'
      ? [(searchedOrder.pickupLat + searchedOrder.destinationLat) / 2, (searchedOrder.pickupLng + searchedOrder.destinationLng) / 2] as [number, number]
      : searchedOrder?.status === 'Menuju Lokasi'
      ? [searchedOrder.pickupLat + 0.002, searchedOrder.pickupLng - 0.002] as [number, number]
      : searchedOrder?.status === 'Barang Diambil'
      ? [searchedOrder.pickupLat, searchedOrder.pickupLng] as [number, number]
      : searchedOrder?.status === 'Selesai'
      ? [searchedOrder.destinationLat, searchedOrder.destinationLng] as [number, number]
      : undefined
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header & Search */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs text-center space-y-4">
        <div className="flex items-center justify-center">
          <img
            src="/mas-jastip-logo.png"
            alt="Logo Profil MAS JASTIP - purbolinggo -"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-orange-500/30 shadow-md hover:scale-105 transition-transform"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
          <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Pelacakan GPS &amp; Status Realtime</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Lacak Pesanan MAS JASTIP
          </h2>
          <span className="inline-block mt-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs tracking-wider">
            - purbolinggo -
          </span>
        </div>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Pantau posisi perjalanan rider di Google Maps / OpenStreetMap secara langsung hingga sampai ke depan pintu.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-2">
          <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Nomor Pesanan (MJ-2026-001)"
                required
                className="w-full bg-transparent px-4 py-2.5 text-sm font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-md shadow-blue-600/20 active:scale-95"
            >
              Lacak
            </button>
          </div>
        </form>

        {/* Demo Fast Click Links */}
        <div className="text-xs text-slate-400 flex items-center justify-center gap-2 pt-1 flex-wrap">
          <span>Contoh pesanan:</span>
          {getOrders().slice(0, 4).map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setInputCode(o.orderCode);
                setSearchedOrder(o);
                setHasSearched(true);
              }}
              className="text-blue-600 hover:underline font-mono font-bold"
            >
              {o.orderCode} ({o.status})
            </button>
          ))}
        </div>
      </div>

      {/* Searched Order Result Card */}
      {searchedOrder ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Top Order Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium">Nomor Kode Pesanan:</span>
              <div className="flex items-center gap-3 mt-0.5">
                <h3 className="text-2xl sm:text-3xl font-mono font-black text-blue-600">
                  {searchedOrder.orderCode}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {searchedOrder.serviceType}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Pemesan: <strong className="text-slate-800">{searchedOrder.customerName}</strong> ({searchedOrder.phone})
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 font-medium block">Total Pembayaran</span>
              <span className="text-2xl font-black text-slate-900 font-heading">
                {formatRupiah(searchedOrder.totalPrice)}
              </span>
              <div className="text-xs text-blue-600 font-bold mt-0.5 flex sm:justify-end items-center gap-1.5">
                <span>Jarak Jalan: {searchedOrder.distance} KM</span>
                {searchedOrder.estimatedMinutes && (
                  <span>• Estimasi: ~{searchedOrder.estimatedMinutes} Menit</span>
                )}
              </div>
            </div>
          </div>

          {/* 6 Timeline Steps Required: Blue for active, Green for completed */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Tahapan Status Pengantaran:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = currentStepIndex > idx;
                const isActive = currentStepIndex === idx;
                const Icon = step.icon;

                return (
                  <div
                    key={step.status}
                    className={`p-3 rounded-2xl border transition text-center flex flex-col items-center justify-center ${
                      isActive
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-slate-50/60 border-slate-200 opacity-55'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 font-bold ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div
                      className={`text-xs font-bold ${
                        isActive
                          ? 'text-blue-700'
                          : isCompleted
                          ? 'text-emerald-700'
                          : 'text-slate-600'
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

          {/* Large Leaflet Tracking Map with Real Road Polyline & Moving Courier */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Peta Rute Jalan &amp; Posisi GPS Kurir:</span>
              </span>

              {searchedOrder.courierHeading !== undefined && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>GPS Aktif ({searchedOrder.courierSpeedKmh ? `${searchedOrder.courierSpeedKmh} km/h` : 'Bergerak'})</span>
                </span>
              )}
            </div>

            <MapPicker
              pickupCoords={[searchedOrder.pickupLat, searchedOrder.pickupLng]}
              destinationCoords={[searchedOrder.destinationLat, searchedOrder.destinationLng]}
              roadPolyline={searchedOrder.roadPolyline}
              courierCoords={activeCourierCoords}
              courierHeading={searchedOrder.courierHeading}
              courierName={searchedOrder.courierName || 'Kurir AntarAja'}
              interactive={false}
              showPresets={false}
              height="420px"
            />
          </div>

          {/* Courier Card, Route Info, and Google Maps Navigation Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Courier Info Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Kurir Penanggung Jawab:
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {searchedOrder.courierName || 'Sedang mencari kurir terdekat...'}
                  </div>
                  <div className="text-slate-500 text-xs">
                    Kendaraan: Motor • Status: <strong className="text-blue-600">{searchedOrder.status}</strong>
                  </div>
                </div>
              </div>

              {searchedOrder.courierName && (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/6281369767697?text=Halo%20rider%20MAS%20JASTIP%20Purbolinggo%20(${encodeURIComponent(searchedOrder.courierName)})%2C%20saya%20pemesan%20${searchedOrder.orderCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-1.5 font-bold text-xs shadow-xs"
                    title="Hubungi WhatsApp Rider"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            {/* Addresses Route Box & Google Maps Button */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                  A
                </span>
                <span className="text-slate-700">
                  <strong>Jemput:</strong> {searchedOrder.pickupAddress}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                  B
                </span>
                <span className="text-slate-700">
                  <strong>Tujuan:</strong> {searchedOrder.destinationAddress}
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <span className="text-slate-500 italic line-clamp-1">
                  &ldquo;{searchedOrder.requestDetail}&rdquo;
                </span>

                <a
                  href={getGoogleMapsNavUrl(
                    [searchedOrder.pickupLat, searchedOrder.pickupLng],
                    [searchedOrder.destinationLat, searchedOrder.destinationLng]
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 transition shrink-0 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Maps</span>
                </a>
              </div>
            </div>

          </div>

          {/* Status Timeline History Card */}
          {searchedOrder.statusHistory && searchedOrder.statusHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Riwayat Aktivitas Pesanan:</span>
              </span>

              <div className="space-y-2">
                {searchedOrder.statusHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="font-bold text-slate-800">{item.status}</span>
                      {item.note && <span className="text-slate-500">— {item.note}</span>}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        hasSearched && (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center max-w-sm mx-auto shadow-xs">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">Pesanan Tidak Ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Nomor pesanan &ldquo;{inputCode}&rdquo; belum terdaftar. Pastikan kode sudah sesuai seperti <strong>MJ-2026-001</strong>.
            </p>
            {onNavigateOrder && (
              <button
                onClick={onNavigateOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Buat Pesanan Baru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )
      )}

    </div>
  );
};
