import React, { useState, useEffect, useRef } from 'react';
import {
  Bike,
  Navigation,
  Phone,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  PackageCheck,
  Camera,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Send,
  AlertTriangle,
  Eye,
  Sparkles,
  Upload
} from 'lucide-react';
import {
  getDrivers,
  getOrders,
  subscribeToStore,
  updateDriverStatus,
  updateOrderStatus,
  updateOrderPhotoProof
} from '../services/storageService';
import { Driver, Order, OrderStatus } from '../types';
import { formatRupiah } from '../services/pricingEngine';

// Preset sample photos for fast desktop testing & demo
const SAMPLE_FOOD_PRESETS = [
  {
    name: '🍛 Nasi & Lauk Komplit',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    notes: 'Makanan komplit 2 porsi, lauk ayam & sambal dipisah rapi.'
  },
  {
    name: '🍲 Bakso Purbolinggo',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    notes: 'Bakso rudal kuah panas dibungkus double plastik anti bocor.'
  },
  {
    name: '🛒 Sembako & Sayur Pasar',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    notes: 'Belanjaan pasar lengkap: beras, telur, sayur segar & bumbu dapur.'
  },
  {
    name: '🧾 Makanan + Struk Toko',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    notes: 'Pesanan sudah diambil di toko, nota belanja sudah diverifikasi pas.'
  }
];

export const DriverDashboard: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(getDrivers());
  const [orders, setOrders] = useState<Order[]>(getOrders());

  // Current logged in driver (Kang Budi as default demo)
  const [currentDriverId, setCurrentDriverId] = useState<string>('drv-1');

  // ShopeeFood Photo Proof Modal State
  const [photoModalOrder, setPhotoModalOrder] = useState<Order | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const [photoNotes, setPhotoNotes] = useState<string>('');
  const [isPhotoSavedSuccess, setIsPhotoSavedSuccess] = useState<boolean>(false);

  // Fullscreen Photo Viewer State
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ url: string; title: string; notes?: string; time?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return subscribeToStore(() => {
      setDrivers(getDrivers());
      setOrders(getOrders());
    });
  }, []);

  const activeDriver = drivers.find((d) => d.id === currentDriverId) || drivers[0];

  // Filter orders for this driver
  const driverOrders = orders.filter((o) => o.driverId === activeDriver?.id);
  const activeOrders = driverOrders.filter((o) => o.status !== 'SELESAI' && o.status !== 'DIBATALKAN');
  const finishedOrders = driverOrders.filter((o) => o.status === 'SELESAI');

  // Also show unassigned orders that driver can claim
  const unassignedOrders = orders.filter((o) => !o.driverId && o.status === 'DITERIMA');

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus(orderId, nextStatus, activeDriver.id);
  };

  const handleClaimOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'DRIVER_DITUGASKAN', activeDriver.id);
  };

  const handleDriverAvailabilityChange = (status: Driver['status']) => {
    if (activeDriver) {
      updateDriverStatus(activeDriver.id, status);
    }
  };

  // Google Maps navigation link generator
  const getGoogleMapsNavUrl = (pickup: string, destination: string) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}&travelmode=two_wheeler`;
  };

  // Open ShopeeFood Photo Capture Modal
  const handleOpenPhotoModal = (order: Order) => {
    setPhotoModalOrder(order);
    setSelectedPhotoUrl(order.pickupPhoto || SAMPLE_FOOD_PRESETS[0].url);
    setPhotoNotes(order.pickupPhotoNotes || 'Makanan/belanjaan sudah siap dan diambil di toko. Kondisi rapi & sesuai pesanan.');
    setIsPhotoSavedSuccess(false);
  };

  // Handle local file / camera capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Photo Proof and advance order status (ShopeeFood style)
  const handleSavePhotoProof = (advanceStatus: boolean) => {
    if (!photoModalOrder || !selectedPhotoUrl) return;

    const nowIso = new Date().toISOString();
    const newStatus = advanceStatus
      ? (photoModalOrder.status === 'MENUJU_PICKUP' || photoModalOrder.status === 'DRIVER_DITUGASKAN'
          ? 'BARANG_DIAMBIL'
          : photoModalOrder.status)
      : photoModalOrder.status;

    updateOrderPhotoProof(photoModalOrder.id, {
      pickupPhoto: selectedPhotoUrl,
      pickupPhotoTime: nowIso,
      pickupPhotoNotes: photoNotes,
      newStatus: newStatus as OrderStatus
    });

    setIsPhotoSavedSuccess(true);
    setTimeout(() => {
      setPhotoModalOrder(null);
      setIsPhotoSavedSuccess(false);
    }, 1200);
  };

  // Direct WhatsApp message with Photo confirmation
  const handleSendPhotoToCustomerWhatsApp = (order: Order, notesToSend: string) => {
    const phone = order.customerPhone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    const msg = `Halo kak ${order.customerName}! 🛵📸\n\nSaya driver GoRide PBL (${activeDriver.name}) mengabarkan bahwa saya *SUDAH SAMPAI DI TOKO / TEMPAT MAKAN* (${order.pickupAddress}).\n\n*Bukti Foto Makanan / Belanjaan:* Sudah saya ambil dan unggah di sistem tracking pesanan (${order.orderCode}).\n\n*Catatan:* ${notesToSend || 'Makanan sudah siap dibungkus rapi sesuai pesanan.'}\n\nSekarang saya bersiap meluncur mengantar ke alamat rumah kakak (${order.destinationAddress}). Ditunggu ya kak! 🙏`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      
      {/* Top Driver Header */}
      <div className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-white text-base">
                  Aplikasi Runner Driver
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                  DRIVER
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>Fitur ShopeeFood Aktif</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Halo, <strong>{activeDriver?.name}</strong> ({activeDriver?.vehicle})
              </p>
            </div>
          </div>

          {/* Switch Driver Profile */}
          <select
            value={currentDriverId}
            onChange={(e) => setCurrentDriverId(e.target.value)}
            className="text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name.split(' ')[0]} ({d.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Status Toggle Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Status Kesediaan Driver Saat Ini:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['TERSEDIA', 'MENGAMBIL', 'MENGANTAR', 'OFFLINE'] as Driver['status'][]).map((st) => (
              <button
                key={st}
                onClick={() => handleDriverAvailabilityChange(st)}
                className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition ${
                  activeDriver?.status === st
                    ? st === 'TERSEDIA'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : st === 'MENGAMBIL' || st === 'MENGANTAR'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-slate-700 text-white'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE TASK SECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Tugas Berjalan ({activeOrders.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Prioritas Utama</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-8 text-center text-slate-400 text-xs">
              <Bike className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p>Tidak ada pesanan aktif saat ini. Siap menerima pesanan baru!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-800 border-2 border-emerald-500/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700 text-xs">
                    <div>
                      <span className="font-mono font-bold text-emerald-400">{ord.orderCode}</span>
                      <span className="text-slate-400 ml-2">({ord.serviceType})</span>
                    </div>
                    <span className="font-black text-white text-sm">
                      {formatRupiah(ord.totalPrice)}
                    </span>
                  </div>

                  {/* Route & Details */}
                  <div className="py-4 space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        A
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Titik Ambil / Toko</span>
                        <div className="font-bold text-white text-sm">{ord.pickupAddress}</div>
                        <div className="text-slate-300 text-xs">{ord.pickupKecamatan}</div>
                        {ord.pickupNotes && (
                          <div className="text-[11px] text-amber-300 mt-0.5 italic">
                            Catatan: {ord.pickupNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        B
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Tujuan Antar (Warga)</span>
                        <div className="font-bold text-white text-sm">{ord.destinationAddress}</div>
                        <div className="text-slate-300 text-xs">{ord.destinationKecamatan}</div>
                        {ord.destinationNotes && (
                          <div className="text-[11px] text-amber-300 mt-0.5 italic">
                            Catatan: {ord.destinationNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Request Details */}
                    <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                        Detail Permintaan:
                      </span>
                      <p className="text-slate-200">{ord.requestDetails}</p>
                    </div>

                    {/* SHOPEEFOOD PHOTO PROOF FEATURE CARD */}
                    <div className="mt-3 p-3.5 bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-slate-900 rounded-2xl border border-orange-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                          <span className="text-xs font-black text-orange-400 uppercase tracking-wide flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Foto Bukti Makanan di Toko (Ala ShopeeFood)</span>
                          </span>
                        </div>
                        {ord.pickupPhoto && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terverifikasi</span>
                          </span>
                        )}
                      </div>

                      {ord.pickupPhoto ? (
                        /* Photo Already Captured */
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                          <div
                            onClick={() => setEnlargedPhoto({
                              url: ord.pickupPhoto!,
                              title: `Bukti Toko: ${ord.orderCode}`,
                              notes: ord.pickupPhotoNotes,
                              time: ord.pickupPhotoTime
                            })}
                            className="relative w-full sm:w-28 h-24 rounded-xl overflow-hidden border border-orange-500/50 cursor-pointer group shrink-0 shadow-md"
                          >
                            <img
                              src={ord.pickupPhoto}
                              alt="Bukti Makanan"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                              <Eye className="w-5 h-5 text-white drop-shadow" />
                            </div>
                            <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded font-mono">
                              Perbesar
                            </span>
                          </div>

                          <div className="flex-1 space-y-1.5 w-full">
                            <div className="text-[11px] text-slate-300">
                              <span className="text-slate-400">Catatan driver: </span>
                              <span className="font-semibold text-white">
                                {ord.pickupPhotoNotes || 'Foto makanan sudah terverifikasi.'}
                              </span>
                            </div>
                            {ord.pickupPhotoTime && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-orange-400" />
                                <span>Waktu foto: {new Date(ord.pickupPhotoTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                onClick={() => handleOpenPhotoModal(ord)}
                                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-1.5 px-2.5 rounded-lg text-[11px] transition flex items-center gap-1"
                              >
                                <Camera className="w-3 h-3 text-orange-400" />
                                <span>Ganti / Foto Ulang</span>
                              </button>
                              <button
                                onClick={() => handleSendPhotoToCustomerWhatsApp(ord, ord.pickupPhotoNotes || '')}
                                className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold py-1.5 px-2.5 rounded-lg text-[11px] transition flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Kirim Info &amp; Foto ke WA</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Not Yet Captured: Prominent ShopeeFood Call to Action */
                        <div className="text-center py-2">
                          <p className="text-xs text-amber-200/90 mb-2.5">
                            Begitu sampai di toko/resto, <strong>wajib foto makanan/pesanan</strong> untuk konfirmasi ke pemesan sebelum diantar.
                          </p>
                          <button
                            onClick={() => handleOpenPhotoModal(ord)}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95"
                          >
                            <Camera className="w-4 h-4" />
                            <span>📸 Ambil Foto Makanan di Toko (Wajib ShopeeFood)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Customer & Open Navigation Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 pb-4">
                    <a
                      href={`https://wa.me/${ord.customerPhone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(ord.customerName)}%2C%20saya%20driver%20GoRide%20PBL%20(${activeDriver?.name})%20yang%20menjalankan%20pesanan%20${ord.orderCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-md"
                    >
                      <Phone className="w-4 h-4" />
                      <span>WhatsApp Pemesan</span>
                    </a>

                    <a
                      href={getGoogleMapsNavUrl(ord.pickupAddress, ord.destinationAddress)}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-md"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Buka Maps Navigasi</span>
                    </a>
                  </div>

                  {/* Status Progression Workflow Buttons */}
                  <div className="pt-3 border-t border-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-2">
                      Perbarui Status Tugas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ord.status === 'DRIVER_DITUGASKAN' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'MENUJU_PICKUP')}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition"
                        >
                          ➔ OTW ke Titik Pickup
                        </button>
                      )}

                      {ord.status === 'MENUJU_PICKUP' && (
                        <button
                          onClick={() => handleOpenPhotoModal(ord)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Sampai di Toko: Foto Makanan</span>
                        </button>
                      )}

                      {ord.status === 'BARANG_DIAMBIL' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'DALAM_PERJALANAN')}
                          className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-xs transition"
                        >
                          ➔ OTW ke Alamat Tujuan
                        </button>
                      )}

                      {ord.status === 'DALAM_PERJALANAN' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'SELESAI')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/30"
                        >
                          ✓ Selesai Antar (Tuntas)
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* UNASSIGNED ORDERS AVAILABLE FOR PICKUP */}
        {unassignedOrders.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
              Pesanan Masuk Siap Diambil ({unassignedOrders.length})
            </h3>

            <div className="space-y-3">
              {unassignedOrders.map((unassigned) => (
                <div
                  key={unassigned.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white block">
                      {unassigned.orderCode} • {unassigned.serviceType}
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                      {unassigned.pickupAddress} ➔ {unassigned.destinationAddress} ({unassigned.distanceKm} KM)
                    </span>
                    <span className="font-bold text-emerald-400 mt-1 block">
                      {formatRupiah(unassigned.totalPrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleClaimOrder(unassigned.id)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl shrink-0 transition"
                  >
                    Ambil Tugas
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* SHOPEEFOOD PHOTO CAPTURE MODAL */}
      {photoModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-orange-500/60 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center font-black">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-1.5">
                    <span>Foto Bukti Makanan di Toko</span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                      Standar ShopeeFood
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Order: <strong className="text-white font-mono">{photoModalOrder.orderCode}</strong> • {photoModalOrder.pickupAddress}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPhotoModalOrder(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="py-4 space-y-4">
              
              {/* Photo Preview with Authentic ShopeeFood Watermark */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-orange-500/40 bg-slate-950 aspect-[4/3] flex items-center justify-center shadow-inner group">
                {selectedPhotoUrl ? (
                  <>
                    <img
                      src={selectedPhotoUrl}
                      alt="Bukti Makanan di Toko"
                      className="w-full h-full object-cover"
                    />

                    {/* ShopeeFood-Style Realtime Watermark Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 text-left">
                      <div className="flex items-center gap-1.5 text-orange-400 font-black text-[11px] tracking-wide mb-0.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>BUKTI PESANAN TOKO - GORIDE PBL</span>
                      </div>
                      <div className="text-[10px] text-white font-medium">
                        📍 {photoModalOrder.pickupAddress} ({photoModalOrder.pickupKecamatan})
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-300 font-mono mt-1 border-t border-white/20 pt-1">
                        <span>🕒 {new Date().toLocaleTimeString('id-ID')} WIB</span>
                        <span>🛵 Driver: {activeDriver?.name}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-500">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Belum ada foto yang dipilih</p>
                  </div>
                )}
              </div>

              {/* Upload from Mobile Camera / File Picker */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Buka Kamera HP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Upload className="w-4 h-4 text-orange-400" />
                    <span>Pilih dari Galeri</span>
                  </button>
                </div>
              </div>

              {/* Preset Sample Photos for Fast Testing */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Pilihan Foto Cepat (Khusus Simulasi &amp; Uji Coba):</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_FOOD_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSelectedPhotoUrl(preset.url);
                        setPhotoNotes(preset.notes);
                      }}
                      className={`text-left p-2 rounded-xl border text-[11px] font-semibold transition flex items-center gap-2 ${
                        selectedPhotoUrl === preset.url
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <img src={preset.url} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver Notes Input */}
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Catatan Makanan / Nota (Opsional):
                </label>
                <textarea
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  placeholder="Contoh: Makanan komplit 2 bungkus, kuah dipisah, nota Rp 25.000 terlampir."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Success Alert */}
              {isPhotoSavedSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Foto bukti berhasil disimpan &amp; status pesanan diperbarui!</span>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleSendPhotoToCustomerWhatsApp(photoModalOrder, photoNotes)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Kirim Bukti ke WA Pemesan</span>
              </button>

              <button
                type="button"
                onClick={() => handleSavePhotoProof(true)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan &amp; Lanjut Antar</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FULLSCREEN PHOTO ENLARGER MODAL */}
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
                <span className="font-bold text-white text-sm">{enlargedPhoto.title}</span>
              </div>
              <button
                onClick={() => setEnlargedPhoto(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={enlargedPhoto.url}
                alt="Enlarged food proof"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            {enlargedPhoto.notes && (
              <p className="mt-3 text-xs text-slate-300 italic text-center">
                &ldquo;{enlargedPhoto.notes}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
