import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Calculator,
  ShoppingBag,
  Send,
  Phone,
  User,
  FileText,
  CreditCard,
  CheckCircle2,
  Navigation,
  Info,
  ArrowRight,
  Search,
  Loader2,
  Route,
  Clock,
  Sparkles,
  Utensils,
  Package,
  UserCheck,
  Heart,
  Bike,
  ShoppingCart,
  Check
} from 'lucide-react';
import { ServiceType, Order } from '../types';
import { MapPicker } from './MapPicker';
import { POPULAR_LOCATIONS } from '../data/initialData';
import {
  calculateFare,
  formatRupiah,
  createOrder,
  getTariffConfig
} from '../services/storageService';
import {
  getRealRoadRoute,
  searchAddressOnline,
  RouteCalculationResult
} from '../services/routingService';
import { getCurrentUser } from '../services/authService';
import confetti from 'canvas-confetti';

interface OrderFormProps {
  onOrderCreated: (order: Order) => void;
  onCancel?: () => void;
}

// 7 Layanan Resmi Sesuai Poster MAS JASTIP Purbolinggo
const MAS_SERVICES: { type: ServiceType; label: string; desc: string; icon: any }[] = [
  {
    type: 'Pesanin Makanan/Minuman',
    label: 'Pesanin Makanan/Minuman',
    desc: 'Titip beli makanan, minuman, jajanan pasar & warung resto terdekat.',
    icon: Utensils,
  },
  {
    type: 'Ambil / Antar Barang',
    label: 'Ambil / Antar Barang',
    desc: 'Ambil paket ekspedisi (J&T, SiCepat, dll), dokumen, atau barang titipan.',
    icon: Package,
  },
  {
    type: 'Jemput / Antar Orang',
    label: 'Jemput / Antar Orang',
    desc: 'Ojek lokal antar jemput warga desa, anak sekolah, puskesmas & pasar.',
    icon: UserCheck,
  },
  {
    type: 'Ambil / Antar Hewan Peliharaan',
    label: 'Ambil / Antar Hewan Peliharaan',
    desc: 'Antar jemput kucing/hewan peliharaan aman ke petshop atau dokter hewan.',
    icon: Heart,
  },
  {
    type: 'Delivery',
    label: 'Delivery Olshop / Toko',
    desc: 'Kurir pengantaran jualan online warga Purbolinggo langsung ke pembeli.',
    icon: Bike,
  },
  {
    type: 'Order (Titip Belanja)',
    label: 'Order (Titip Belanja)',
    desc: 'Titip belanja sembako pasar, apotek, swalayan, atau belanja ke Kota Metro.',
    icon: ShoppingCart,
  },
  {
    type: 'Dan lain-lain',
    label: 'Dan lain-lain',
    desc: 'Layanan suruh serbaguna lainnya sesuai permintaan warga (Amanah, Cepat, Ramah).',
    icon: Sparkles,
  },
];

export const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated, onCancel }) => {
  const loggedInUser = getCurrentUser();

  // 1. Service Type (Default: Pesanin Makanan/Minuman)
  const [serviceType, setServiceType] = useState<ServiceType>('Pesanin Makanan/Minuman');

  // Check if this service involves purchasing goods
  const isShoppingType =
    serviceType === 'Pesanin Makanan/Minuman' ||
    serviceType === 'Order (Titip Belanja)' ||
    serviceType === 'Jasa Titip';

  // 2. Customer Info (auto-filled if logged in)
  const [customerName, setCustomerName] = useState(loggedInUser?.name || '');
  const [phone, setPhone] = useState(loggedInUser?.phone || '');

  // 3. Locations (Purbolinggo, Lampung Timur)
  const [pickupAddress, setPickupAddress] = useState('Pasar Purbolinggo, Simpang Pasar, Kec. Purbolinggo');
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([-5.0078, 105.4875]);

  const [destAddress, setDestAddress] = useState('Desa Taman Endah (Dusun 2), Kec. Purbolinggo, Lampung Timur');
  const [destCoords, setDestCoords] = useState<[number, number]>([-5.0185, 105.5020]);

  // Active selection mode for map clicking
  const [activeSelectMode, setActiveSelectMode] = useState<'pickup' | 'destination' | null>(null);

  // 4. Details
  const [requestDetail, setRequestDetail] = useState('');
  const [note, setNote] = useState('');
  const [goodsPrice, setGoodsPrice] = useState<number>(35000);

  // 5. Validation error state
  const [errorMessage, setErrorMessage] = useState('');

  // 6. Real Road Route State
  const [routeData, setRouteData] = useState<RouteCalculationResult>({
    distanceKm: 2.8,
    durationMinutes: 7,
    waypoints: [
      [-5.0078, 105.4875],
      [-5.0092, 105.4880],
      [-5.0125, 105.4930],
      [-5.0150, 105.4975],
      [-5.0185, 105.5020],
    ],
    isRealRoad: false,
  });
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Autocomplete search states
  const [pickupSuggestions, setPickupSuggestions] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [destSuggestions, setDestSuggestions] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  // Fetch real road route whenever coordinates change
  useEffect(() => {
    let isCancelled = false;
    const fetchRoute = async () => {
      setIsCalculatingRoute(true);
      try {
        const result = await getRealRoadRoute(pickupCoords, destCoords);
        if (!isCancelled) {
          setRouteData(result);
        }
      } catch (err) {
        console.error('Failed to calculate road route', err);
      } finally {
        if (!isCancelled) {
          setIsCalculatingRoute(false);
        }
      }
    };

    fetchRoute();
    return () => {
      isCancelled = true;
    };
  }, [pickupCoords, destCoords]);

  // Real distance and fare
  const effectiveDistance = routeData.distanceKm;
  const fareResult = calculateFare(serviceType, effectiveDistance, isShoppingType ? goodsPrice : 0);
  const tariffConfig = getTariffConfig();

  // Search Address Handlers with debounce
  const searchTimeoutRef = useRef<any>(null);

  const handlePickupInputChange = (val: string) => {
    setPickupAddress(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length < 3) {
      setPickupSuggestions([]);
      return;
    }
    setIsSearchingPickup(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchAddressOnline(val);
      setPickupSuggestions(results);
      setIsSearchingPickup(false);
    }, 400);
  };

  const handleDestInputChange = (val: string) => {
    setDestAddress(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length < 3) {
      setDestSuggestions([]);
      return;
    }
    setIsSearchingDest(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchAddressOnline(val);
      setDestSuggestions(results);
      setIsSearchingDest(false);
    }, 400);
  };

  // Handle map selection
  const handleMapSelect = (type: 'pickup' | 'destination', coords: [number, number], name?: string) => {
    if (type === 'pickup') {
      setPickupCoords(coords);
      if (name) setPickupAddress(name);
      else setPickupAddress(`Titik Jemput [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`);
      setPickupSuggestions([]);
    } else {
      setDestCoords(coords);
      if (name) setDestAddress(name);
      else setDestAddress(`Titik Tujuan [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`);
      setDestSuggestions([]);
    }
  };

  // Submit Order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Harap masukkan nama lengkap pemesan.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('Harap masukkan nomor WhatsApp yang valid agar rider bisa menghubungi.');
      return;
    }
    if (!pickupAddress.trim()) {
      setErrorMessage('Harap masukkan lokasi penjemputan / toko.');
      return;
    }
    if (!destAddress.trim()) {
      setErrorMessage('Harap masukkan lokasi tujuan / desa pengantaran.');
      return;
    }
    if (!requestDetail.trim()) {
      setErrorMessage('Harap isi detail pesanan / barang Anda.');
      return;
    }

    try {
      const baseFee = isShoppingType ? tariffConfig.jasaTitipBase : tariffConfig.jasaSuruhBase;
      const perKmFee = isShoppingType ? tariffConfig.jasaTitipPerKm : tariffConfig.jasaSuruhPerKm;

      const newOrder = createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        serviceType,
        pickupAddress: pickupAddress.trim(),
        pickupLat: pickupCoords[0],
        pickupLng: pickupCoords[1],
        destinationAddress: destAddress.trim(),
        destinationLat: destCoords[0],
        destinationLng: destCoords[1],
        distance: effectiveDistance,
        serviceFee: fareResult.serviceFee,
        goodsPrice: isShoppingType ? goodsPrice : 0,
        totalPrice: fareResult.totalPrice,
        requestDetail: requestDetail.trim(),
        note: note.trim() || undefined,
        baseFee,
        perKmFee,
        estimatedMinutes: routeData.durationMinutes,
        roadPolyline: routeData.waypoints,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }

      onOrderCreated(newOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat membuat pesanan.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Operating Hours & Hotline Strip */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-3xl p-3 sm:p-4 text-white shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="/mas-jastip-logo.png"
            alt="Logo MAS JASTIP - purbolinggo -"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-400 shadow-sm shrink-0"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold tracking-wide">MAS JASTIP</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-800 text-white">- purbolinggo -</span>
            <span className="hidden sm:inline text-blue-100">• Jam Operasional: 10.00 - 21.00 WIB</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-2.5 py-1 rounded-lg font-bold">ONGKIR TERGANTUNG KM</span>
          <a
            href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20tanya%20jasa"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95"
            title="Chat WhatsApp MAS JASTIP Langsung"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>0813-6976-7697</span>
          </a>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
        
        {/* Form Title & Subtitle with Profile Identity */}
        <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Formulir Pesanan Resmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Mudahnya serahin ke MAS JASTIP
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pilih layanan jasa di bawah ini. Jarak dihitung otomatis per KM rute jalan raya sebenarnya, transparan &amp; amanah.
            </p>
          </div>
          <div className="flex items-center gap-3 p-2.5 px-3 rounded-2xl bg-orange-50/70 border border-orange-200/80 self-start sm:self-auto shrink-0">
            <img
              src="/mas-jastip-logo.png"
              alt="Profil MAS JASTIP - purbolinggo -"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/50 shadow-xs"
            />
            <div>
              <div className="text-xs font-black text-slate-900">MAS JASTIP</div>
              <div className="text-[10px] font-bold text-blue-600">- purbolinggo -</div>
              <div className="flex items-center gap-1.5 mt-1">
                <a
                  href="https://wa.me/6281369767697?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded-md transition shadow-2xs"
                  title="Buka WhatsApp"
                >
                  WhatsApp
                </a>
                <a
                  href="https://www.tiktok.com/@masjastippurbolinggo01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-white bg-slate-900 hover:bg-black px-2 py-0.5 rounded-md transition shadow-2xs"
                  title="Buka TikTok"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <Info className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Pilih 7 Layanan Resmi Sesuai Poster MAS JASTIP */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Pilih Layanan MAS JASTIP:</span>
              </label>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Amanah • Cepat • Ramah
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {MAS_SERVICES.map((srv) => {
                const Icon = srv.icon;
                const isSelected = serviceType === srv.type;

                return (
                  <button
                    key={srv.type}
                    type="button"
                    onClick={() => setServiceType(srv.type)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {srv.label}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                          <Check className="w-2.5 h-2.5" />
                          <span>Siap</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                        {srv.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Customer Name & WhatsApp Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nama Pemesan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nomor WhatsApp Pemesan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 3. Lokasi Penjemputan & Tujuan Inputs */}
          <div className="space-y-4 pt-2">
            
            {/* Lokasi Jemput */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>Lokasi Jemput / Toko / Warung (Titik A) <span className="text-red-500">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveSelectMode('pickup')}
                  className={`text-xs font-bold px-3 py-1 rounded-lg border transition flex items-center gap-1 ${
                    activeSelectMode === 'pickup'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pilih di Peta</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => handlePickupInputChange(e.target.value)}
                  placeholder="Ketik alamat penjemputan, toko, pasar, atau jalan..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
                <MapPin className="w-4 h-4 text-blue-600 absolute left-4 top-3.5 pointer-events-none" />
                {isSearchingPickup ? (
                  <Loader2 className="w-4 h-4 text-blue-600 absolute right-4 top-3.5 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {pickupSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {pickupSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPickupCoords([sug.lat, sug.lng]);
                        setPickupAddress(sug.name);
                        setPickupSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-xs text-slate-800 flex items-start gap-2.5 transition"
                    >
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">{sug.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{sug.lat.toFixed(4)}, {sug.lng.toFixed(4)}]</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lokasi Tujuan */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span>Lokasi Antar / Rumah Pemesan (Titik B) <span className="text-red-500">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveSelectMode('destination')}
                  className={`text-xs font-bold px-3 py-1 rounded-lg border transition flex items-center gap-1 ${
                    activeSelectMode === 'destination'
                      ? 'bg-red-500 text-white border-red-500 shadow-sm'
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pilih di Peta</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={destAddress}
                  onChange={(e) => handleDestInputChange(e.target.value)}
                  placeholder="Ketik alamat tujuan, gang, nomor rumah, atau desa..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
                <Navigation className="w-4 h-4 text-red-500 absolute left-4 top-3.5 pointer-events-none" />
                {isSearchingDest ? (
                  <Loader2 className="w-4 h-4 text-red-500 absolute right-4 top-3.5 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                )}
              </div>

              {/* Suggestions Dropdown for Destination */}
              {destSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {destSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDestCoords([sug.lat, sug.lng]);
                        setDestAddress(sug.name);
                        setDestSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-xs text-slate-800 flex items-start gap-2.5 transition"
                    >
                      <Navigation className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">{sug.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{sug.lat.toFixed(4)}, {sug.lng.toFixed(4)}]</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Village Selection Pills for Purbolinggo */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Pilih Cepat Desa / Wilayah di Purbolinggo:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        setDestCoords([loc.lat, loc.lng]);
                        setDestAddress(loc.address);
                        setDestSuggestions([]);
                      }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                        destAddress.includes(loc.name.replace('Desa ', ''))
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 4. Interactive Maps with Real Road Routing */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <span>Peta Rute Perjalanan Sebenarnya:</span>
                {isCalculatingRoute && (
                  <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Menghitung rute jalan...
                  </span>
                )}
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                  <Route className="w-3.5 h-3.5" />
                  <span>Jarak Jalan: {effectiveDistance} KM</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{routeData.durationMinutes} Menit</span>
                </span>
              </div>
            </div>

            <MapPicker
              pickupCoords={pickupCoords}
              destinationCoords={destCoords}
              roadPolyline={routeData.waypoints}
              activeSelectionMode={activeSelectMode}
              onSelectCoords={handleMapSelect}
              interactive={true}
              height="360px"
            />
          </div>

          {/* 5. Detail Permintaan & Catatan */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Detail Barang / Permintaan Layanan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={requestDetail}
                onChange={(e) => setRequestDetail(e.target.value)}
                rows={3}
                placeholder={
                  isShoppingType
                    ? 'Contoh: Titip beli bakso 2 porsi & es teh manis, atau belanja sembako telur 1 kg & minyak goreng di Pasar Purbolinggo.'
                    : 'Contoh: Ambil berkas surat di Balai Desa Taman Endah dan antarkan ke Kantor Camat Purbolinggo / Sukadana.'
                }
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Catatan Tambahan (Opsional):
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Contoh: Rumah dekat masjid / gapura Dusun 2 Desa Taman Endah, titipkan tetangga jika tidak di rumah."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            {/* If Shopping/Food: Estimasi Harga Barang */}
            {isShoppingType && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Estimasi Harga Belanjaan / Makanan (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-slate-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={goodsPrice || ''}
                    onChange={(e) => setGoodsPrice(Number(e.target.value) || 0)}
                    placeholder="Contoh: 35000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition font-mono font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Uang belanjaan/makanan dibayarkan langsung kepada rider Mas Jastip saat pesanan sampai (bisa tunai atau transfer/QRIS).
                </p>
              </div>
            )}
          </div>

          {/* 6. Ringkasan & Estimasi Ongkos Otomatis Berdasarkan Rute Sebenarnya */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm font-heading flex items-center justify-between">
              <span>Ringkasan Biaya (Ongkir Tergantung KM)</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Tarif Resmi MAS JASTIP
              </span>
            </h4>

            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center justify-between">
                <span>Jarak Tempuh Jalan Raya:</span>
                <span className="font-bold text-slate-800">{effectiveDistance} KM (~{routeData.durationMinutes} menit)</span>
              </div>

              <div className="flex items-center justify-between">
                <span>
                  Ongkir Jasa ({serviceType}):
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatRupiah(fareResult.serviceFee)}
                </span>
              </div>

              {isShoppingType && (
                <div className="flex items-center justify-between text-slate-700">
                  <span>Estimasi Uang Belanjaan/Makanan:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatRupiah(goodsPrice)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
                <span className="font-bold text-slate-900">Total Pembayaran:</span>
                <span className="font-black text-blue-600 text-xl font-heading">
                  {formatRupiah(fareResult.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* 7. Action Button: Pesan Sekarang */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-1/3 py-3.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition"
              >
                Batal
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95"
            >
              <span>Pesan Sekarang ke MAS JASTIP</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
