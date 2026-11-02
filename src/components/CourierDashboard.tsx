import React, { useState, useEffect } from 'react';
import {
  Bike,
  Navigation,
  Phone,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  CheckCheck,
  Radio,
  Play,
  Square,
  Camera,
  Image as ImageIcon,
  Check,
  UploadCloud,
  Compass
} from 'lucide-react';
import { Order, Courier, OrderStatus } from '../types';
import {
  getOrders,
  getCouriers,
  updateOrderStatus,
  subscribeToStore,
  formatRupiah
} from '../services/storageService';
import {
  startRealGpsBroadcast,
  stopGpsBroadcast,
  startCourierTripSimulation,
  stopCourierTripSimulation,
  isSimulationActive
} from '../services/gpsService';
import { getGoogleMapsNavUrl } from '../services/routingService';

export const CourierDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [couriers, setCouriers] = useState<Courier[]>(getCouriers());

  // Active courier profile (default Budi)
  const [activeCourierId, setActiveCourierId] = useState<string>('courier-1');

  // GPS broadcast status
  const [isRealGpsBroadcasting, setIsRealGpsBroadcasting] = useState(false);
  const [isSimulatingTrip, setIsSimulatingTrip] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Photo proof modal / upload simulation state
  const [photoProofOrder, setPhotoProofOrder] = useState<Order | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [proofNote, setProofNote] = useState('Foto bukti pesanan / struk pembelian telah diverifikasi');

  useEffect(() => {
    return subscribeToStore(() => {
      setOrders(getOrders());
      setCouriers(getCouriers());
    });
  }, []);

  const activeCourier = couriers.find((c) => c.id === activeCourierId) || couriers[0];

  // Orders assigned to this courier
  const myAssignedOrders = orders.filter((o) => o.courierId === activeCourier?.id);
  const myActiveOrders = myAssignedOrders.filter((o) => o.status !== 'Selesai' && o.status !== 'Dibatalkan');
  const myFinishedOrders = myAssignedOrders.filter((o) => o.status === 'Selesai');

  // Unassigned orders available for pickup
  const unassignedOrders = orders.filter((o) => !o.courierId && o.status === 'Menunggu Kurir');

  // Handle status progression
  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus(orderId, nextStatus, activeCourier?.id);
  };

  // Handle claiming an unassigned order
  const handleClaimOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Kurir Ditugaskan', activeCourier?.id);
  };

  // Toggle real GPS broadcast using device Geolocation API
  const handleToggleRealGps = () => {
    setGpsError(null);
    if (isRealGpsBroadcasting) {
      stopGpsBroadcast(activeCourier.id);
      setIsRealGpsBroadcasting(false);
    } else {
      const activeOrd = myActiveOrders[0];
      const success = startRealGpsBroadcast(
        activeCourier.id,
        activeOrd ? activeOrd.id : undefined,
        (coords) => {
          setIsRealGpsBroadcasting(true);
        },
        (err) => {
          setGpsError(err.message || 'Gagal mengakses GPS perangkat');
          setIsRealGpsBroadcasting(false);
        }
      );
      if (!success) {
        setGpsError('Browser tidak mendukung Geolocation API');
      }
    }
  };

  // Toggle simulated GPS movement along road polyline
  const handleToggleSimulatedTrip = (order: Order) => {
    if (isSimulatingTrip) {
      stopCourierTripSimulation(activeCourier.id);
      setIsSimulatingTrip(false);
    } else {
      setIsSimulatingTrip(true);
      startCourierTripSimulation(
        order,
        activeCourier.id,
        (pos, heading) => {
          // Progressing along polyline
        },
        () => {
          setIsSimulatingTrip(false);
        }
      );
    }
  };

  // Mock taking proof photo like ShopeeFood / GrabFood
  const handleSimulatePhotoSnap = () => {
    // Generate realistic receipt / delivery photo preview
    setUploadedPhotoUrl('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80');
  };

  const handleSavePhotoProof = () => {
    if (photoProofOrder) {
      // Advance to Barang Diambil or Selesai
      if (photoProofOrder.status === 'Menuju Lokasi') {
        handleUpdateStatus(photoProofOrder.id, 'Barang Diambil');
      } else if (photoProofOrder.status === 'Dalam Perjalanan') {
        handleUpdateStatus(photoProofOrder.id, 'Selesai');
      }
      setPhotoProofOrder(null);
      setUploadedPhotoUrl(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Courier Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/mas-jastip-logo.png"
            alt="Logo Profil MAS JASTIP - purbolinggo -"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/50 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 font-heading">
                Aplikasi Rider MAS JASTIP
              </h1>
              <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full shadow-2xs tracking-wider">
                - purbolinggo -
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Halo, <strong>{activeCourier?.name}</strong> • Plat: <strong>{activeCourier?.licensePlate || 'BE 4521 AA'}</strong> ({activeCourier?.vehicle})
            </p>
          </div>
        </div>

        {/* Profile Switcher & GPS Live Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Akun Kurir:</span>
            <select
              value={activeCourierId}
              onChange={(e) => setActiveCourierId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-600"
            >
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.vehicle.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* GPS LIVE BROADCAST CONTROLLER BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isRealGpsBroadcasting || isSimulatingTrip ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <h3 className="font-bold text-slate-900 text-sm">
              Sistem GPS &amp; Pelacakan Lokasi Kurir
            </h3>
            {(isRealGpsBroadcasting || isSimulatingTrip) && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                GPS AKTIF
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aktifkan transmisi koordinat agar pemesan dapat memantau pergerakan Anda secara realtime di peta.
          </p>
          {gpsError && (
            <p className="text-xs text-red-600 font-medium mt-1">⚠️ {gpsError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Button Real GPS HP */}
          <button
            onClick={handleToggleRealGps}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isRealGpsBroadcasting
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isRealGpsBroadcasting ? 'Matikan GPS HP' : 'GPS Asli (Device)'}</span>
          </button>
        </div>
      </div>

      {/* 1. PESANAN AKTIF SAYA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Tugas Aktif Saya ({myActiveOrders.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Prioritas Antar</span>
        </div>

        {myActiveOrders.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-400 text-xs shadow-xs">
            <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">Tidak ada pesanan aktif saat ini.</p>
            <p className="text-slate-400 mt-0.5">Pilih pesanan masuk di bawah untuk mulai mengantar!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myActiveOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border-2 border-blue-600/60 rounded-3xl p-6 shadow-md relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <div>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {ord.orderCode}
                    </span>
                    <span className="text-slate-400 ml-2">({ord.serviceType})</span>
                  </div>
                  <span className="font-bold text-slate-900 font-heading text-sm">
                    Ongkos: {formatRupiah(ord.serviceFee)}
                  </span>
                </div>

                {/* Route Info Cards */}
                <div className="py-4 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      A
                    </span>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Jemput / Toko</span>
                      <div className="font-bold text-slate-900 text-sm">{ord.pickupAddress}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      B
                    </span>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Antar ke Tujuan</span>
                      <div className="font-bold text-slate-900 text-sm">{ord.destinationAddress}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      Detail Permintaan:
                    </span>
                    <p className="text-slate-700">{ord.requestDetail}</p>
                    {ord.note && (
                      <p className="text-amber-700 text-[11px] mt-1 italic">
                        Catatan: {ord.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Simulation & Google Maps Action Strip */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-blue-900 block">Simulasi Perjalanan Rute Nyata</span>
                    <span className="text-[11px] text-blue-700">
                      Jalankan motor menyusuri jalan raya otomatis untuk menguji fitur live tracking pelanggan.
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleSimulatedTrip(ord)}
                    className={`px-4 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shrink-0 ${
                      isSimulatingTrip
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25'
                    }`}
                  >
                    {isSimulatingTrip ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Hentikan Simulasi</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Simulasi GPS</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Buttons: WhatsApp, Google Maps, & Bukti Foto */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 pb-4">
                  <a
                    href={`https://wa.me/62${ord.phone.replace(/\D/g, '').replace(/^0/, '')}?text=Halo%20${encodeURIComponent(ord.customerName)}%2C%20saya%20rider%20MAS%20JASTIP%20Purbolinggo%20(${activeCourier.name})%20yang%20menjalankan%20pesanan%20${ord.orderCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Pemesan</span>
                  </a>

                  <a
                    href={getGoogleMapsNavUrl([ord.pickupLat, ord.pickupLng], [ord.destinationLat, ord.destinationLng])}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Google Maps Rute</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setPhotoProofOrder(ord)}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Foto Bukti Antar</span>
                  </button>
                </div>

                {/* Status Progression Buttons */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
                    Perbarui Status Pesanan Ini:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ord.status === 'Kurir Ditugaskan' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'Menuju Lokasi')}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs transition"
                      >
                        ➔ Menuju Lokasi Jemput
                      </button>
                    )}

                    {ord.status === 'Menuju Lokasi' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'Barang Diambil')}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                      >
                        ➔ Sudah Diambil / Dibeli
                      </button>
                    )}

                    {ord.status === 'Barang Diambil' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'Dalam Perjalanan')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                      >
                        ➔ Dalam Perjalanan Antar
                      </button>
                    )}

                    {ord.status === 'Dalam Perjalanan' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'Selesai')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-600/30"
                      >
                        ✓ Pesanan Selesai (Tuntas)
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. PESANAN MASUK SIAP DIAMBIL (UNASSIGNED) */}
      {unassignedOrders.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Pesanan Masuk Siap Diambil ({unassignedOrders.length})
          </h3>

          <div className="space-y-3">
            {unassignedOrders.map((unassigned) => (
              <div
                key={unassigned.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-blue-700 block">
                    {unassigned.orderCode} • {unassigned.serviceType}
                  </span>
                  <span className="text-slate-600 block mt-0.5">
                    {unassigned.pickupAddress} ➔ {unassigned.destinationAddress} ({unassigned.distance} KM)
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    Total: {formatRupiah(unassigned.totalPrice)} (Ongkos: {formatRupiah(unassigned.serviceFee)})
                  </span>
                </div>

                <button
                  onClick={() => handleClaimOrder(unassigned.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shrink-0 transition"
                >
                  Ambil Pesanan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHOTO PROOF MODAL (SHOPEEFOOD STYLE PROOF OF DELIVERY) */}
      {photoProofOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Upload Foto Bukti Pengantaran / Struk
                </h3>
              </div>
              <button
                onClick={() => setPhotoProofOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Foto struk belanja, barang sampai di lokasi, atau serah terima bersama pelanggan (seperti ShopeeFood/GrabFood).
            </p>

            {uploadedPhotoUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={uploadedPhotoUrl}
                    alt="Bukti Pengantaran"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-mono">
                    ✓ Terverifikasi • {new Date().toLocaleTimeString()}
                  </div>
                </div>

                <input
                  type="text"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="Catatan bukti (opsional)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                />

                <button
                  type="button"
                  onClick={handleSavePhotoProof}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Bukti &amp; Perbarui Status</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSimulatePhotoSnap}
                  className="w-full border-2 border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/50 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-2"
                >
                  <Camera className="w-8 h-8 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900">
                    Klik untuk Ambil / Upload Foto Bukti
                  </span>
                  <span className="text-[10px] text-blue-600">
                    Format JPG/PNG otomatis dikompres
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
