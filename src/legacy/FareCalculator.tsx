import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Coins,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
  Bike,
  Send
} from 'lucide-react';
import { MapPicker } from './MapPicker';
import { KECAMATAN_LIST, POPULAR_SPOTS } from '../data/initialData';
import { calculateFare, formatRupiah, CalculationResult } from '../services/pricingEngine';
import { getRoute, RouteResult, reverseGeocode } from '../services/routingService';
import { getPricingConfig, getZones, subscribeToStore } from '../services/storageService';
import { PricingConfig, ZoneTariff } from '../types';

interface FareCalculatorProps {
  onOrderNow: (details: {
    pickupAddress: string;
    pickupKecamatan: string;
    pickupCoords: [number, number];
    destinationAddress: string;
    destinationKecamatan: string;
    destinationCoords: [number, number];
    distanceKm: number;
    estimatedMinutes: number;
    fareResult: CalculationResult;
  }) => void;
}

export const FareCalculator: React.FC<FareCalculatorProps> = ({ onOrderNow }) => {
  const [config, setConfig] = useState<PricingConfig>(getPricingConfig());
  const [zones, setZones] = useState<ZoneTariff[]>(getZones());

  // Location States (Purbolinggo, Lampung Timur)
  const [pickupAddress, setPickupAddress] = useState('Pasar Simpang Purbolinggo');
  const [pickupKecamatan, setPickupKecamatan] = useState(KECAMATAN_LIST[0]?.name || 'Desa Taman Asri (Purbolinggo)');
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([-5.0092, 105.4880]);

  const [destAddress, setDestAddress] = useState('Kantor Camat & Lapangan Purbolinggo');
  const [destKecamatan, setDestKecamatan] = useState(KECAMATAN_LIST[1]?.name || 'Desa Taman Fajar (Purbolinggo)');
  const [destCoords, setDestCoords] = useState<[number, number]>([-5.0125, 105.4865]);

  // Route & Calculation State
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [activeSelectMode, setActiveSelectMode] = useState<'pickup' | 'destination' | null>(null);

  // Surcharges (simplified for village)
  const [isNight, setIsNight] = useState(false);
  const [hasWaiting, setHasWaiting] = useState(false);
  const [isHeavy, setIsHeavy] = useState(false);

  // Toggle for showing/hiding map
  const [showMap, setShowMap] = useState(true);

  // Subscribe to storage changes
  useEffect(() => {
    return subscribeToStore(() => {
      setConfig(getPricingConfig());
      setZones(getZones());
    });
  }, []);

  // Recalculate route whenever coordinates change
  useEffect(() => {
    let isCurrent = true;
    async function calculateCurrentRoute() {
      if (!pickupCoords || !destCoords) return;
      setIsLoadingRoute(true);
      try {
        const result = await getRoute(pickupCoords, destCoords);
        if (isCurrent) {
          setRouteData(result);
        }
      } catch (e) {
        console.error('Failed to get route:', e);
      } finally {
        if (isCurrent) setIsLoadingRoute(false);
      }
    }

    calculateCurrentRoute();

    return () => {
      isCurrent = false;
    };
  }, [pickupCoords, destCoords]);

  const distanceKm = routeData ? routeData.distanceKm : 2.5;

  const fareResult = calculateFare(
    distanceKm,
    pickupKecamatan,
    destKecamatan,
    config,
    zones,
    { isNight, hasWaiting, isHeavy }
  );

  const handleMapClick = async (lat: number, lng: number) => {
    if (!activeSelectMode) return;
    const coords: [number, number] = [lat, lng];
    const resolvedName = await reverseGeocode(lat, lng);

    if (activeSelectMode === 'pickup') {
      setPickupCoords(coords);
      setPickupAddress(resolvedName);
      setActiveSelectMode(null);
    } else {
      setDestCoords(coords);
      setDestAddress(resolvedName);
      setActiveSelectMode(null);
    }
  };

  const handleOrderClick = () => {
    onOrderNow({
      pickupAddress,
      pickupKecamatan,
      pickupCoords,
      destinationAddress: destAddress,
      destinationKecamatan: destKecamatan,
      destinationCoords: destCoords,
      distanceKm,
      estimatedMinutes: fareResult.estimatedMinutes,
      fareResult,
    });
  };

  return (
    <section id="kalkulator" className="py-12 md:py-16 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simple & Clear Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold mb-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Kalkulator Ongkos Desa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Cek Ongkos Sebelum Berangkat
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Pilih lokasi jemput dan tujuan. Tarif langsung muncul otomatis tanpa perlu menebak-nebak.
          </p>
        </div>

        {/* Quick Location Pills - Sederhana Banget untuk Orang Desa */}
        <div className="mb-6 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
          <span className="text-xs font-bold text-emerald-900 block mb-2">
            👇 Pilihan Cepat Lokasi Populer di Desa:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {POPULAR_SPOTS.slice(0, 5).map((spot) => (
              <button
                key={spot.name}
                type="button"
                onClick={() => {
                  setPickupAddress(spot.name);
                  setPickupKecamatan(spot.kecamatan);
                  setPickupCoords(spot.coords);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white border border-emerald-200 text-slate-800 font-bold transition shadow-sm"
              >
                📍 {spot.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left: Input Form (Big & Easy to read) */}
          <div className="lg:col-span-6 space-y-4 bg-slate-50 p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
            
            {/* Step 1: Pickup */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                    1
                  </span>
                  <span>Titik Jemput / Pengambilan</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveSelectMode(activeSelectMode === 'pickup' ? null : 'pickup')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    activeSelectMode === 'pickup'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activeSelectMode === 'pickup' ? 'Klik di Peta...' : 'Pilih di Peta'}</span>
                </button>
              </div>

              {/* Dusun / Area */}
              <select
                value={pickupKecamatan}
                onChange={(e) => {
                  const found = KECAMATAN_LIST.find((k) => k.name === e.target.value);
                  setPickupKecamatan(e.target.value);
                  if (found) setPickupCoords(found.centerCoords);
                }}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 mb-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {KECAMATAN_LIST.map((kec) => (
                  <option key={kec.name} value={kec.name}>
                    🏘️ {kec.name}
                  </option>
                ))}
              </select>

              {/* Specific spot address */}
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Contoh: Rumah Bu Siti / Warung Pak RT..."
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
              />
            </div>

            {/* Step 2: Destination */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                    2
                  </span>
                  <span>Tujuan Pengantaran</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveSelectMode(activeSelectMode === 'destination' ? null : 'destination')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    activeSelectMode === 'destination'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activeSelectMode === 'destination' ? 'Klik di Peta...' : 'Pilih di Peta'}</span>
                </button>
              </div>

              {/* Dusun / Area */}
              <select
                value={destKecamatan}
                onChange={(e) => {
                  const found = KECAMATAN_LIST.find((k) => k.name === e.target.value);
                  setDestKecamatan(e.target.value);
                  if (found) setDestCoords(found.centerCoords);
                }}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 mb-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {KECAMATAN_LIST.map((kec) => (
                  <option key={kec.name} value={kec.name}>
                    🎯 {kec.name}
                  </option>
                ))}
              </select>

              {/* Specific spot address */}
              <input
                type="text"
                value={destAddress}
                onChange={(e) => setDestAddress(e.target.value)}
                placeholder="Contoh: Balai Desa / Puskesmas / Pasar..."
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-sm"
              />
            </div>

            {/* Optional extra (Checkbox simple) */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-600 block mb-2">
                Kondisi Khusus (Opsional):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNight}
                    onChange={(e) => setIsNight(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Malam Hari (+{formatRupiah(config.nightFee)})</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isHeavy}
                    onChange={(e) => setIsHeavy(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Barang Berat (+{formatRupiah(config.heavyItemFee)})</span>
                </label>
              </div>
            </div>

            {/* Big Prominent Price Box - Sangat Jelas untuk Warga */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-lg mt-4">
              <div className="flex items-center justify-between text-xs text-emerald-200 pb-2 border-b border-emerald-700/60">
                <span>Estimasi Biaya Transparan:</span>
                <span className="font-bold bg-emerald-700/60 px-2.5 py-0.5 rounded-full text-white">
                  {fareResult.methodUsed === 'zone' ? 'Tarif Dusun' : 'Berdasarkan Jarak'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 text-center border-b border-emerald-700/60">
                <div>
                  <span className="text-[11px] text-emerald-300 block">Jarak Rute</span>
                  <strong className="text-lg font-black text-white">
                    {isLoadingRoute ? '...' : `${fareResult.distanceKm} KM`}
                  </strong>
                </div>
                <div className="border-x border-emerald-700/60">
                  <span className="text-[11px] text-emerald-300 block">Waktu Tempuh</span>
                  <strong className="text-lg font-black text-white">
                    {isLoadingRoute ? '...' : `${fareResult.estimatedMinutes} Mnt`}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 block">Total Ongkos</span>
                  <strong className="text-xl sm:text-2xl font-black text-emerald-300">
                    {formatRupiah(fareResult.roundedTotal)}
                  </strong>
                </div>
              </div>

              {/* Big Friendly CTA */}
              <button
                type="button"
                onClick={handleOrderClick}
                className="mt-4 w-full bg-white hover:bg-emerald-50 text-emerald-900 font-black py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.99] text-base"
              >
                <Send className="w-5 h-5 text-emerald-700" />
                <span>Pesan Sekarang (WhatsApp)</span>
              </button>
            </div>

          </div>

          {/* Right: Map View (Clean, with toggle) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[420px]">
              <div className="flex items-center justify-between px-2 py-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-xs font-bold text-slate-800">Peta Rute Jalan Desa</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {routeData?.source === 'osrm' ? '✓ Rute Jalan Asli' : '✓ Siap Dihubungkan'}
                </span>
              </div>

              <div className="w-full min-h-[440px] h-[440px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <MapPicker
                  pickupCoords={pickupCoords}
                  destinationCoords={destCoords}
                  routeCoords={routeData ? routeData.coordinates : []}
                  onMapClick={handleMapClick}
                  activeSelectMode={activeSelectMode}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2 font-medium">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Bantuan:</strong> Jika bingung menentukan titik di peta, cukup pilih nama dusun atau ketik patokan rumah Anda.
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
