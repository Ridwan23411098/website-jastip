import React, { useState, useEffect } from 'react';
import {
  Bike,
  ShoppingBag,
  Package,
  Send,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  Search,
  Phone,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Navigation,
  Info,
  Calendar,
  User,
  X,
  Camera
} from 'lucide-react';
import { MapPicker } from './MapPicker';
import { KECAMATAN_LIST, POPULAR_SPOTS, INITIAL_DRIVERS } from '../data/initialData';
import { calculateFare, formatRupiah, CalculationResult } from '../services/pricingEngine';
import { getRoute, RouteResult, reverseGeocode } from '../services/routingService';
import { getPricingConfig, getZones, subscribeToStore } from '../services/storageService';
import { PricingConfig, ZoneTariff, ServiceType } from '../types';

interface GojekAppViewProps {
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
    selectedService: ServiceType;
  }) => void;
  onOpenTracking: () => void;
  onSwitchToDriver?: () => void;
}

export const GojekAppView: React.FC<GojekAppViewProps> = ({ onOrderNow, onOpenTracking, onSwitchToDriver }) => {
  const [config, setConfig] = useState<PricingConfig>(getPricingConfig());
  const [zones, setZones] = useState<ZoneTariff[]>(getZones());

  // 4 Core Gojek Services
  const [activeService, setActiveService] = useState<ServiceType>('Jasa Antar Barang');

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

  // Surcharges
  const [isNight, setIsNight] = useState(false);
  const [isHeavy, setIsHeavy] = useState(false);

  // Active Bottom Tab: 'order' | 'rates' | 'drivers' | 'tracking'
  const [activeTab, setActiveTab] = useState<'order' | 'rates' | 'drivers'>('order');

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

  const distanceKm = routeData ? routeData.distanceKm : 1.8;

  const fareResult = calculateFare(
    distanceKm,
    pickupKecamatan,
    destKecamatan,
    config,
    zones,
    { isNight, isHeavy }
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

  const handleOrderSubmit = () => {
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
      selectedService: activeService,
    });
  };

  // Gojek Services Definition
  const GOJEK_SERVICES = [
    {
      id: 'goride',
      type: 'Jasa Antar Barang' as ServiceType,
      label: 'GoRide',
      sublabel: 'Ojek Motor',
      icon: Bike,
      bgColor: 'bg-emerald-500',
      activeColor: 'ring-emerald-500 text-emerald-700 bg-emerald-50',
    },
    {
      id: 'gomart',
      type: 'Jasa Titip Belanja' as ServiceType,
      label: 'GoMart',
      sublabel: 'Titip Belanja',
      icon: ShoppingBag,
      bgColor: 'bg-red-500',
      activeColor: 'ring-red-500 text-red-700 bg-red-50',
    },
    {
      id: 'gosend',
      type: 'Jasa Ambil Barang' as ServiceType,
      label: 'GoSend',
      sublabel: 'Antar Paket',
      icon: Package,
      bgColor: 'bg-blue-500',
      activeColor: 'ring-blue-500 text-blue-700 bg-blue-50',
    },
    {
      id: 'gosuruh',
      type: 'Jasa Suruh' as ServiceType,
      label: 'GoSuruh',
      sublabel: 'Minta Bantuan',
      icon: Send,
      bgColor: 'bg-amber-500',
      activeColor: 'ring-amber-500 text-amber-700 bg-amber-50',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">
      
      {/* 1. Gojek-Style Greeting & Location Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/30">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                GoRide PBL
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Purbolinggo, Lamtim
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Mau ke mana atau butuh titip apa hari ini?
            </p>
          </div>
        </div>

        {/* Direct Driver Fast Hotline */}
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${INITIAL_DRIVERS[0].phone}?text=Halo%20${encodeURIComponent(INITIAL_DRIVERS[0].name)}%2C%20saya%20warga%20Purbolinggo%20mau%20pesan%20ojek%20%2F%20jastip%20GoRide%20PBL`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Chat WA Driver Langsung</span>
          </a>
        </div>
      </div>

      {/* 🌟 SHOPEEFOOD FEATURE HIGHLIGHT & SHORTCUT BANNER */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 rounded-3xl p-0.5 shadow-lg">
        <div className="bg-slate-950 rounded-[22px] p-4 sm:p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                  Fitur Baru: ShopeeFood Style
                </span>
                <span className="bg-orange-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  BARU
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Driver Foto Makanan di Toko Sebagai Bukti
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Begitu driver tiba di warung/toko, driver wajib mengambil foto pesanan &amp; struk sebagai bukti sebelum diantar ke pemesan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0">
            {onSwitchToDriver && (
              <button
                type="button"
                onClick={onSwitchToDriver}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
              >
                <Bike className="w-4 h-4" />
                <span>Buka Mode Driver &amp; Coba Foto</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenTracking}
              className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Lihat Contoh Foto di Lacak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Gojek Iconic 4 Services Grid */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Pilih Layanan Utama:
        </span>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {GOJEK_SERVICES.map((srv) => {
            const Icon = srv.icon;
            const isSelected = activeService === srv.type;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setActiveService(srv.type)}
                className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  isSelected
                    ? `${srv.activeColor} ring-2 shadow-sm font-extrabold scale-102`
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm transition-transform ${
                    srv.bgColor
                  } ${isSelected ? 'scale-110' : ''}`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-900 block leading-tight">
                  {srv.label}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium block truncate max-w-full">
                  {srv.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Gojek Order & Route Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Clean Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Atur Rute Perjalanan ({activeService})</span>
            </span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Pasti &amp; Transparan
            </span>
          </div>

          {/* Location A: Jemput */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                  A
                </span>
                <span>Lokasi Penjemputan / Toko</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveSelectMode(activeSelectMode === 'pickup' ? null : 'pickup')}
                className={`text-[11px] px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 ${
                  activeSelectMode === 'pickup'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>{activeSelectMode === 'pickup' ? 'Pilih di Peta (Aktif)' : 'Pin di Peta'}</span>
              </button>
            </div>

            <select
              value={pickupKecamatan}
              onChange={(e) => {
                const found = KECAMATAN_LIST.find((k) => k.name === e.target.value);
                setPickupKecamatan(e.target.value);
                if (found) setPickupCoords(found.centerCoords);
              }}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              {KECAMATAN_LIST.map((kec) => (
                <option key={kec.name} value={kec.name}>
                  📍 {kec.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Patokan: Pasar Simpang / Depan Masjid / No Rumah..."
              className="w-full text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* Location B: Tujuan */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">
                  B
                </span>
                <span>Tujuan Pengantaran</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveSelectMode(activeSelectMode === 'destination' ? null : 'destination')}
                className={`text-[11px] px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 ${
                  activeSelectMode === 'destination'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>{activeSelectMode === 'destination' ? 'Pilih di Peta (Aktif)' : 'Pin di Peta'}</span>
              </button>
            </div>

            <select
              value={destKecamatan}
              onChange={(e) => {
                const found = KECAMATAN_LIST.find((k) => k.name === e.target.value);
                setDestKecamatan(e.target.value);
                if (found) setDestCoords(found.centerCoords);
              }}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              {KECAMATAN_LIST.map((kec) => (
                <option key={kec.name} value={kec.name}>
                  🎯 {kec.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={destAddress}
              onChange={(e) => setDestAddress(e.target.value)}
              placeholder="Patokan: Balai Desa / Rumah RT / Kantor Camat..."
              className="w-full text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
            />
          </div>

          {/* Quick Village Spots Pills */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
              Pilihan Cepat Titik Populer Purbolinggo:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {POPULAR_SPOTS.slice(0, 6).map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setDestAddress(s.name);
                    setDestKecamatan(s.kecamatan);
                    setDestCoords(s.coords);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded-lg font-bold text-[11px] transition"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Big Gojek Price & CTA Box */}
          <div className="pt-2">
            <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-300 font-medium block">
                  {fareResult.distanceKm} KM • ~{fareResult.estimatedMinutes} Mnt
                </span>
                <span className="text-2xl font-black text-white block">
                  {formatRupiah(fareResult.roundedTotal)}
                </span>
                <span className="text-[10px] text-emerald-200">
                  {fareResult.methodUsed === 'zone' ? '✓ Tarif Dusun Pasti' : '✓ Tarif Jarak Murah'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleOrderSubmit}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-5 rounded-xl transition flex items-center gap-2 shadow-lg active:scale-95 text-sm"
              >
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right: Live Map & Driver Preview */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-sm flex flex-col h-full min-h-[420px]">
            <div className="flex items-center justify-between px-2 py-1 mb-2 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Rute Peta Jalan Purbolinggo</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                {routeData?.source === 'osrm' ? '✓ OSRM Live Road' : '✓ Rute Terhubung'}
              </span>
            </div>

            <div className="w-full min-h-[380px] h-[380px] rounded-2xl overflow-hidden border border-slate-200">
              <MapPicker
                pickupCoords={pickupCoords}
                destinationCoords={destCoords}
                routeCoords={routeData ? routeData.coordinates : []}
                onMapClick={handleMapClick}
                activeSelectMode={activeSelectMode}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bisa bayar tunai / COD ke kurir</span>
            </span>
            <button
              onClick={onOpenTracking}
              className="text-emerald-700 font-bold hover:underline"
            >
              Cek Status Pesanan ➔
            </button>
          </div>
        </div>

      </div>

      {/* 4. Quick Tabs: Tarif Dusun / Driver Standby */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('order')}
              className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl transition ${
                activeTab === 'order' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Daftar Tarif Pas Dusun
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl transition ${
                activeTab === 'drivers' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Driver Lokal Siaga ({INITIAL_DRIVERS.length})
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline font-medium">
            Kabupaten Lampung Timur
          </span>
        </div>

        {activeTab === 'order' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">Dalam Dusun</span>
              <strong className="text-base text-emerald-700 font-black">Rp 5.000</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Dekat rumah &amp; warung</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">Antar Desa Dekat</span>
              <strong className="text-base text-emerald-700 font-black">Rp 7.000</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Pasar Simpang / Fajar</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">Antar Desa Sedang</span>
              <strong className="text-base text-emerald-700 font-black">Rp 10.000</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Toto Harjo / Kebun</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">Ke Sukadana (RSUD)</span>
              <strong className="text-base text-emerald-700 font-black">Rp 18.000</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Antar kecamatan jauh</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {INITIAL_DRIVERS.map((d) => (
              <div key={d.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <strong className="text-slate-900 block font-bold text-xs sm:text-sm">{d.name}</strong>
                  <span className="text-slate-500 text-[11px] block">{d.vehicle}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">📍 {d.area}</span>
                </div>
                <a
                  href={`https://wa.me/${d.phone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(d.name)}%2C%20saya%20warga%20Purbolinggo%20mau%20pesan%20ojek%20%2F%20jastip%20GoRide%20PBL`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 text-xs shadow-sm shrink-0 active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat WA</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
