import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  ShoppingBag,
  Send,
  Eye,
  ArrowRight,
  Filter,
  CheckCircle2,
  Bike
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { getOrders, subscribeToStore, formatRupiah } from '../services/storageService';

interface OrderHistoryProps {
  onSelectOrder: (orderCode: string) => void;
  onNavigateOrder: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  onSelectOrder,
  onNavigateOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    return subscribeToStore(() => {
      setOrders(getOrders());
    });
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'active') {
      return o.status !== 'Selesai' && o.status !== 'Dibatalkan';
    }
    if (filterStatus === 'completed') {
      return o.status === 'Selesai';
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-heading">
            Riwayat Pesanan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar seluruh pesanan jasa titip dan jasa suruh yang telah dibuat.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'all'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'active'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'completed'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-500 shadow-xs">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Belum Ada Pesanan</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Kamu belum membuat pesanan jastip atau jasa suruh.
          </p>
          <button
            onClick={onNavigateOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-sm"
          >
            <span>Buat Pesanan Pertama</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isCompleted = ord.status === 'Selesai';
            const isCancelled = ord.status === 'Dibatalkan';

            return (
              <div
                key={ord.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-blue-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        ord.serviceType === 'Jasa Titip'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      {ord.serviceType === 'Jasa Titip' ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {ord.orderCode}
                      </span>
                      <span className="text-slate-400 text-xs ml-2">
                        • {ord.serviceType}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isCancelled
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isCancelled
                            ? 'bg-slate-400'
                            : 'bg-amber-500 animate-pulse'
                        }`}
                      ></span>
                      <span>{ord.status}</span>
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Route */}
                  <div className="md:col-span-2 space-y-1.5 text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                        A
                      </span>
                      <span className="line-clamp-1">{ord.pickupAddress}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                        B
                      </span>
                      <span className="line-clamp-1">{ord.destinationAddress}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] pt-1 italic">
                      &ldquo;{ord.requestDetail}&rdquo;
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex md:flex-col justify-between items-end md:items-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block md:text-right">Total Ongkos &amp; Belanja</span>
                      <span className="text-base font-bold text-slate-900 font-heading md:text-right block">
                        {formatRupiah(ord.totalPrice)}
                      </span>
                      <span className="text-[11px] text-slate-500 block md:text-right">
                        Jarak: {ord.distance} KM
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectOrder(ord.orderCode)}
                      className="mt-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold py-2 px-3.5 rounded-xl transition text-xs flex items-center gap-1.5 border border-blue-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail / Lacak</span>
                    </button>
                  </div>
                </div>

                {/* Footer Timestamp & Courier */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dibuat: {new Date(ord.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {ord.courierName && (
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Bike className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kurir: {ord.courierName}</span>
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
