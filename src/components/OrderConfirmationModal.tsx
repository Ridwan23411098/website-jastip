import React from 'react';
import {
  CheckCircle2,
  Bike,
  MapPin,
  Clock,
  ArrowRight,
  X,
  Phone,
  Receipt
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../services/storageService';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderCode: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition absolute right-5 top-5"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Success Icon & Profile Logo */}
        <div className="text-center space-y-2 pb-5 border-b border-slate-100">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/mas-jastip-logo.png"
              alt="Logo MAS JASTIP - purbolinggo -"
              className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-500/50 shadow-md"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-heading">
            Pesanan Berhasil Dibuat
          </h3>
          <p className="text-xs text-slate-500">
            Pesanan Anda telah masuk ke sistem <strong>MAS JASTIP - purbolinggo -</strong> dan segera diproses rider.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="py-4 space-y-4 text-xs">
          
          {/* Order Code & Status */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Nomor Pesanan:
              </span>
              <span className="font-mono font-black text-blue-700 text-lg">
                {order.orderCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Status Saat Ini:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{order.status}</span>
              </span>
            </div>
          </div>

          {/* Customer & Service Info */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Nama Pelanggan</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">{order.customerName}</span>
              <span className="text-slate-500 text-[11px] font-mono">{order.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Jenis Layanan</span>
              <span className="font-bold text-blue-600 text-xs mt-0.5 block">{order.serviceType}</span>
              <span className="text-slate-500 text-[11px]">Jarak: {order.distance} KM</span>
            </div>
          </div>

          {/* Locations */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                A
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Lokasi Jemput</span>
                <span className="font-medium text-slate-800">{order.pickupAddress}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                B
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Lokasi Tujuan</span>
                <span className="font-medium text-slate-800">{order.destinationAddress}</span>
              </div>
            </div>
          </div>

          {/* Permintaan & Catatan */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Detail Permintaan:
            </span>
            <p className="text-slate-700 italic">&ldquo;{order.requestDetail}&rdquo;</p>
            {order.note && (
              <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200 mt-1">
                Catatan: {order.note}
              </p>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="p-3.5 bg-slate-100/80 rounded-xl space-y-1.5 border border-slate-200">
            {order.goodsPrice ? (
              <div className="flex justify-between text-slate-600">
                <span>Harga Barang:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(order.goodsPrice)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-600">
              <span>Ongkos Jasa:</span>
              <span className="font-semibold text-slate-800">{formatRupiah(order.serviceFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-300">
              <span>Total Pembayaran:</span>
              <span className="text-blue-600 font-black font-heading text-base">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
          {/* Direct WhatsApp Order Confirmation */}
          <a
            href={`https://wa.me/6281369767697?text=${encodeURIComponent(
              `Halo MAS JASTIP Purbolinggo! Saya baru saja membuat pesanan di website:\n\n` +
              `*No. Pesanan:* ${order.orderCode}\n` +
              `*Layanan:* ${order.serviceType}\n` +
              `*Pemesan:* ${order.customerName} (${order.phone})\n` +
              `*Titik Jemput/Beli:* ${order.pickupAddress}\n` +
              `*Tujuan Antar:* ${order.destinationAddress}\n` +
              `*Detail Pesanan:* ${order.requestDetail}\n` +
              `*Total Biaya:* ${formatRupiah(order.totalPrice)}\n\n` +
              `Mohon segera diproses ya mas, terima kasih!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 hover:scale-101 active:scale-95"
            title="Kirim Detail Pesanan ke WhatsApp MAS JASTIP"
          >
            <Phone className="w-4 h-4" />
            <span>Kirim Detail ke WhatsApp (0813-6976-7697)</span>
          </a>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition text-center"
            >
              Kembali ke Beranda
            </button>

            <button
              onClick={() => onTrackOrder(order.orderCode)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95"
            >
              <Bike className="w-4 h-4" />
              <span>Lacak Pesanan Ini</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
