import React, { useState } from 'react';
import { X, Send, CheckCircle, Copy, Clock, MapPin, Tag, FileText, Phone, User, Bike } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CalculationResult, formatRupiah } from '../services/pricingEngine';
import { createOrder, getPricingConfig, getDrivers } from '../services/storageService';
import { Order, ServiceType, Driver } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    pickupAddress: string;
    pickupKecamatan: string;
    pickupCoords: [number, number];
    destinationAddress: string;
    destinationKecamatan: string;
    destinationCoords: [number, number];
    distanceKm: number;
    estimatedMinutes: number;
    fareResult: CalculationResult;
  } | null;
  onOrderSuccess: (order: Order) => void;
}

const SERVICE_TYPES: ServiceType[] = [
  'Jasa Antar Barang',
  'Jasa Titip Belanja',
  'Jasa Ambil Barang',
  'Jasa Suruh',
  'Lainnya',
];

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onOrderSuccess,
}) => {
  if (!isOpen || !initialData) return null;

  const config = getPricingConfig();
  const drivers: Driver[] = getDrivers();

  // Selected driver (Direct Customer to Driver)
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || 'drv-1');
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('Jasa Antar Barang');
  const [requestDetails, setRequestDetails] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [pickupTime, setPickupTime] = useState('Sekarang (Secepatnya)');
  const [pickupNotes, setPickupNotes] = useState('');
  const [destNotes, setDestNotes] = useState('');

  // Success state
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Format WhatsApp message DIRECT TO DRIVER
  const generateWhatsAppMessage = (order: Order, driver: Driver) => {
    return encodeURIComponent(
`Halo Pak/Mas *${driver.name}* (GoRide PBL), saya ingin pesan ojek / jastip langsung ke bapak:

📋 *KODE PESANAN:* ${order.orderCode}
👤 *Nama Pemesan:* ${order.customerName}
📱 *No. WA Saya:* ${order.customerPhone}
🛍️ *Layanan:* ${order.serviceType}

📍 *Titik Jemput:*
${order.pickupAddress} (${order.pickupKecamatan})
${order.pickupNotes ? `_Patokan Jemput: ${order.pickupNotes}_` : ''}

🎯 *Tujuan Pengantaran:*
${order.destinationAddress} (${order.destinationKecamatan})
${order.destinationNotes ? `_Patokan Tujuan: ${order.destinationNotes}_` : ''}

📏 *Jarak Rute:* ${order.distanceKm} KM
💰 *Ongkos Pas:* ${formatRupiah(order.totalPrice)} (Bisa Bayar Tunai / COD)
⏰ *Waktu:* ${order.pickupTime}

📝 *Detail Permintaan:*
${order.requestDetails || 'Antar jemput biasa'}
${order.additionalNotes ? `💡 *Catatan:* ${order.additionalNotes}` : ''}

Apakah Bapak/Mas sedang standby dan bisa jemput sekarang? Mohon infonya ya, terima kasih!`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Harap isi Nama dan Nomor WhatsApp Anda.');
      return;
    }

    // Save order in system directly assigned to selected driver
    const newOrder = createOrder({
      customerName,
      customerPhone,
      pickupAddress: initialData.pickupAddress,
      pickupKecamatan: initialData.pickupKecamatan,
      pickupCoords: initialData.pickupCoords,
      pickupNotes,
      destinationAddress: initialData.destinationAddress,
      destinationKecamatan: initialData.destinationKecamatan,
      destinationCoords: initialData.destinationCoords,
      destinationNotes: destNotes,
      serviceType,
      requestDetails: requestDetails || 'Antar jemput biasa',
      additionalNotes,
      pickupTime,
      distanceKm: initialData.distanceKm,
      estimatedDurationMin: initialData.estimatedMinutes,
      basePrice: initialData.fareResult.baseFare,
      extraFees: initialData.fareResult.extraFees,
      totalPrice: initialData.fareResult.roundedTotal,
      pricingMethod: initialData.fareResult.methodUsed,
      status: 'DRIVER_DITUGASKAN',
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverPhone: selectedDriver.phone,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    setSubmittedOrder(newOrder);
    onOrderSuccess(newOrder);

    // DIRECT TO DRIVER WHATSAPP!
    const waUrl = `https://wa.me/${selectedDriver.phone.replace(/\D/g, '')}?text=${generateWhatsAppMessage(newOrder, selectedDriver)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyMessage = () => {
    if (!submittedOrder) return;
    const decoded = decodeURIComponent(generateWhatsAppMessage(submittedOrder, selectedDriver));
    navigator.clipboard.writeText(decoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-black">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                Pesan Langsung ke Driver
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Tanpa perantara admin, chat WhatsApp langsung ke kurir motor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto">
          {submittedOrder ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Chat WhatsApp Terhubung ke {selectedDriver.name}!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Format pesanan sudah langsung disiapkan ke WhatsApp driver Anda.
                </p>
              </div>

              {/* Order Code & Driver Highlight */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl max-w-sm mx-auto shadow-md space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Kode Pesanan Anda
                </div>
                <div className="text-2xl font-mono font-black text-emerald-400">
                  {submittedOrder.orderCode}
                </div>
                <div className="text-xs text-slate-300 pt-1">
                  Driver: <strong className="text-white">{selectedDriver.name}</strong> ({selectedDriver.vehicle})
                </div>
                <div className="text-xs text-emerald-300 font-bold">
                  Ongkos Pas: {formatRupiah(submittedOrder.totalPrice)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <a
                  href={`https://wa.me/${selectedDriver.phone.replace(/\D/g, '')}?text=${generateWhatsAppMessage(submittedOrder, selectedDriver)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Ulang ke WA Driver</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-5 rounded-xl transition flex items-center justify-center gap-2 border border-slate-300 text-xs"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
                >
                  Selesai &amp; Tutup
                </button>
              </div>
            </div>
          ) : (
            /* Direct Order Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Route Summary */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="truncate max-w-[200px]">{initialData.pickupAddress}</span>
                  </div>
                  <div className="font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span className="truncate max-w-[200px]">{initialData.destinationAddress}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block">{initialData.distanceKm} KM</span>
                  <strong className="text-base font-black text-emerald-800">
                    {formatRupiah(initialData.fareResult.roundedTotal)}
                  </strong>
                </div>
              </div>

              {/* 1. CHOOSE DRIVER (Direct Customer to Driver) */}
              <div>
                <label className="text-xs font-black text-slate-900 block mb-1.5">
                  Pilih Driver Motor yang Ingin Dihubungi Langsung:
                </label>
                <div className="space-y-2">
                  {drivers.map((d) => {
                    const isSelected = selectedDriverId === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDriverId(d.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="driverSelect"
                            checked={isSelected}
                            onChange={() => setSelectedDriverId(d.id)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <strong className="font-extrabold text-slate-900 block text-xs sm:text-sm">
                              {d.name}
                            </strong>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Motor: {d.vehicle} • Pangkalan: {d.area}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          Standby
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Customer Info (Nama & WA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Anda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Bu Siti / Mas Dimas"
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp Anda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 3. Service Type & Request Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jenis Layanan
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none"
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Waktu Penjemputan
                  </label>
                  <input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    placeholder="Sekarang (Secepatnya) / Jam 08.00"
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes for Driver */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan untuk Driver (Belanjaan / Titipan / Patokan Rumah)
                </label>
                <textarea
                  rows={2}
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                  placeholder="Contoh: Jemput di rumah cat hijau depan pohon mangga, belanja sayur bayam dan beras..."
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit CTA Directly to Driver WhatsApp */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-6 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.99] text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan ke WhatsApp {selectedDriver.name}</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                  Pesanan otomatis terbuka di WhatsApp driver tanpa perantara admin.
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
