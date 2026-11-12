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
  ArrowLeftRight,
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
import { POPULAR_LOCATIONS, LOCATION_LANDMARKS } from '../data/initialData';
import {
  calculateFare,
  formatRupiah,
  createOrder,
  getTariffConfig
} from '../services/storageService';
import {
  getRealRoadRoute,
  searchAddressOnline,
  findBestLandmarkMatch,
  RouteCalculationResult,
  AddressSearchResult
} from '../services/routingService';
import { getCurrentUser } from '../services/authService';
import confetti from 'canvas-confetti';

interface OrderFormProps {
  onOrderCreated: (order: Order) => void;
  onCancel?: () => void;
  initialServiceType?: ServiceType;
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

// Template Rute Populer Antar Wilayah MAS JASTIP
export const POPULAR_ROUTE_PRESETS = [
  {
    id: 'preset-metro-chandra',
    badge: 'KOTA METRO',
    title: 'Belanja Chandra Kota Metro ke Purbolinggo',
    kmLabel: '~25.1 KM',
    pickupName: 'Chandra Superstore Kota Metro, Jl. Iringmulyo, Metro Timur',
    pickupCoords: [-5.1135, 105.3072] as [number, number],
    destName: 'Desa Taman Fajar (Pusat Kecamatan), Purbolinggo, Lamtim',
    destCoords: [-5.0092, 105.4880] as [number, number],
    serviceType: 'Order (Titip Belanja)' as ServiceType,
    detail: 'Titip belanja perlengkapan / kebutuhan di Chandra Superstore Kota Metro.',
  },
  {
    id: 'preset-metro-pb',
    badge: 'KOTA METRO',
    title: 'Belanja PB Swalayan Metro ke Purbolinggo',
    kmLabel: '~25.0 KM',
    pickupName: 'PB Swalayan Kota Metro, Jl. AH Nasution, Yosorejo',
    pickupCoords: [-5.1118, 105.3085] as [number, number],
    destName: 'Desa Taman Endah, Kec. Purbolinggo, Lampung Timur',
    destCoords: [-5.0185, 105.5020] as [number, number],
    serviceType: 'Order (Titip Belanja)' as ServiceType,
    detail: 'Titip belanja sembako / jajanan di PB Swalayan Kota Metro.',
  },
  {
    id: 'preset-kotagajah',
    badge: 'LAMPUNG TENGAH',
    title: 'Belanja Pasar Kotagajah ke Purbolinggo',
    kmLabel: '~23.9 KM',
    pickupName: 'Pasar Kotagajah, Jl. Raya Kotagajah, Lampung Tengah',
    pickupCoords: [-4.9820, 105.3280] as [number, number],
    destName: 'Desa Taman Fajar, Kec. Purbolinggo, Lampung Timur',
    destCoords: [-5.0092, 105.4880] as [number, number],
    serviceType: 'Order (Titip Belanja)' as ServiceType,
    detail: 'Titip beli barang di Pasar Kotagajah Lampung Tengah.',
  },
  {
    id: 'preset-bandarjaya',
    badge: 'LAMPUNG TENGAH',
    title: 'Belanja Plaza Bandar Jaya ke Purbolinggo',
    kmLabel: '~46.5 KM',
    pickupName: 'Plaza Bandar Jaya, Terbanggi Besar, Lampung Tengah',
    pickupCoords: [-4.9080, 105.2100] as [number, number],
    destName: 'Desa Taman Fajar, Kec. Purbolinggo, Lampung Timur',
    destCoords: [-5.0092, 105.4880] as [number, number],
    serviceType: 'Order (Titip Belanja)' as ServiceType,
    detail: 'Titip belanja pakaian / perlengkapan di Plaza Bandar Jaya Lamteng.',
  },
  {
    id: 'preset-kirim-metro',
    badge: 'PURBOLINGGO ➔ METRO',
    title: 'Kirim Barang Purbolinggo ke Kota Metro',
    kmLabel: '~25.4 KM',
    pickupName: 'Pasar Purbolinggo, Simpang Pasar, Purbolinggo',
    pickupCoords: [-5.0078, 105.4875] as [number, number],
    destName: 'Pasar Cendrawasih / Alun-Alun Kota Metro',
    destCoords: [-5.1145, 105.3055] as [number, number],
    serviceType: 'Ambil / Antar Barang' as ServiceType,
    detail: 'Kirim paket / dokumen dari Purbolinggo menuju Kota Metro.',
  },
  {
    id: 'preset-sukadana',
    badge: 'LAMPUNG TIMUR',
    title: 'Antar Berkas ke Pemkab Lamtim Sukadana',
    kmLabel: '~25.9 KM',
    pickupName: 'Desa Toto Harjo, Kec. Purbolinggo, Lampung Timur',
    pickupCoords: [-5.0340, 105.4950] as [number, number],
    destName: 'Kompleks Pemkab & RSUD Sukadana, Lampung Timur',
    destCoords: [-5.0880, 105.5450] as [number, number],
    serviceType: 'Ambil / Antar Barang' as ServiceType,
    detail: 'Antar dokumen dinas penting ke loket Pemkab Sukadana.',
  },
  {
    id: 'preset-lokal',
    badge: 'LOKAL PURBOLINGGO',
    title: 'Pesan Kuliner Simpang Pasar ke Taman Endah',
    kmLabel: '~3.4 KM',
    pickupName: 'Warung Bakso Simpang Pasar Purbolinggo',
    pickupCoords: [-5.0078, 105.4875] as [number, number],
    destName: 'Desa Taman Endah (Dusun 2), Kec. Purbolinggo',
    destCoords: [-5.0185, 105.5020] as [number, number],
    serviceType: 'Pesanin Makanan/Minuman' as ServiceType,
    detail: 'Pesanin makanan/minuman dari warung Pasar Purbolinggo kuah dipisah.',
  },
];

export const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated, onCancel, initialServiceType }) => {
  const loggedInUser = getCurrentUser();

  // 1. Service Type (Default: Pesanin Makanan/Minuman)
  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType || 'Pesanin Makanan/Minuman');

  useEffect(() => {
    if (initialServiceType) {
      setServiceType(initialServiceType);
    }
  }, [initialServiceType]);

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
    distanceKm: 3.4,
    durationMinutes: 10,
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
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSearchResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<AddressSearchResult[]>([]);
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

  // Search Address Handlers with debounce & instant landmark matching
  const searchTimeoutRef = useRef<any>(null);

  const handlePickupInputChange = (val: string) => {
    setPickupAddress(val);

    // Instant match against curated landmarks (e.g., user typed "metro", "chandra", "kotagajah")
    const match = findBestLandmarkMatch(val);
    if (match) {
      setPickupCoords([match.lat, match.lng]);
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length < 2) {
      setPickupSuggestions([]);
      return;
    }
    setIsSearchingPickup(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchAddressOnline(val);
      setPickupSuggestions(results);
      setIsSearchingPickup(false);
    }, 250);
  };

  const handleDestInputChange = (val: string) => {
    setDestAddress(val);

    // Instant match against curated landmarks (e.g., user typed "metro", "chandra", "kotagajah", "sukadana")
    const match = findBestLandmarkMatch(val);
    if (match) {
      setDestCoords([match.lat, match.lng]);
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }
    setIsSearchingDest(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchAddressOnline(val);
      setDestSuggestions(results);
      setIsSearchingDest(false);
    }, 250);
  };

  const handlePickupBlur = () => {
    const match = findBestLandmarkMatch(pickupAddress);
    if (match) {
      setPickupCoords([match.lat, match.lng]);
    }
  };

  const handleDestBlur = () => {
    const match = findBestLandmarkMatch(destAddress);
    if (match) {
      setDestCoords([match.lat, match.lng]);
    }
  };

  // 1-Click Swap Pickup and Destination
  const handleSwapPoints = () => {
    const tempAddress = pickupAddress;
    const tempCoords = pickupCoords;
    setPickupAddress(destAddress);
    setPickupCoords(destCoords);
    setDestAddress(tempAddress);
    setDestCoords(tempCoords);
  };

  // Apply Quick Route Preset
  const handleApplyPreset = (preset: typeof POPULAR_ROUTE_PRESETS[0]) => {
    setPickupAddress(preset.pickupName);
    setPickupCoords(preset.pickupCoords);
    setDestAddress(preset.destName);
    setDestCoords(preset.destCoords);
    setServiceType(preset.serviceType);
    if (!requestDetail.trim()) {
      setRequestDetail(preset.detail);
    }
    setPickupSuggestions([]);
    setDestSuggestions([]);
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
      <div className="bg-gradient-to-r from-[#070d24] via-[#0d1c47] to-[#070d24] border border-blue-900/60 rounded-3xl p-3 sm:p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="/mas-jastip-logo.png"
            alt="Logo JSP KURIR - Purbolinggo"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-500 shadow-sm shrink-0"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black tracking-wide text-white">MAS JASTIP</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs">- purbolinggo -</span>
            <span className="hidden sm:inline text-sky-200">• Jam Operasional: 10.00 - 21.00 WIB</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/10 px-2.5 py-1 rounded-lg font-bold text-amber-300 border border-white/10">ONGKIR PER KM</span>
          <a
            href="https://wa.me/6285789528805?text=Halo%20Jasa%20Suruh%20Purbolinggo%20(JSP%20Kurir)%2C%20saya%20mau%20order%20jasa"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95 text-white"
            title="Chat WhatsApp JSP Kurir"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>0857-8952-8805</span>
          </a>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xs">
        
        {/* Form Title & Subtitle with Profile Identity */}
        <div className="pb-5 sm:pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold mb-2 border border-orange-200">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Formulir Pesanan Resmi</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              &ldquo;SERAHKAN SEMUA BERES!&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pilih layanan jasa di bawah ini. Jarak dihitung otomatis per KM rute jalan raya sebenarnya, transparan &amp; amanah.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 p-2.5 px-3 rounded-2xl bg-orange-50/70 border border-orange-200/80 shrink-0">
            <img
              src="/mas-jastip-logo.png"
              alt="Profil JSP JASA SURUH PURBOLINGGO"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500 shadow-xs"
            />

            <div>
              <div className="text-xs font-black text-slate-900">MAS JASTIP</div>
              <div className="text-[10px] font-bold text-orange-600">- purbolinggo -</div>
              <div className="flex items-center gap-1.5 mt-1">
                <a
                  href="https://wa.me/6285789528805?text=Halo%20Jasa%20Suruh%20Purbolinggo%20(JSP%20Kurir)%2C%20saya%20mau%20order%20jasa"
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
                <span>Pilih Layanan JSP KURIR:</span>
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

          {/* 3. Lokasi Penjemputan & Tujuan Inputs dengan Rute Cepat Antar Wilayah */}
          <div className="space-y-4 pt-2">
            
            {/* Quick 1-Click Route Presets Bar */}
            <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 p-3.5 rounded-2xl border border-blue-200/80">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>Pilihan Rute Cepat Antar Wilayah (1-Klik Langsung Pas):</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  Akurat &amp; Real KM
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {POPULAR_ROUTE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="shrink-0 text-left bg-white hover:bg-blue-600 hover:text-white group border border-blue-200/80 rounded-xl px-3 py-2 transition shadow-2xs hover:shadow-md active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 group-hover:bg-white/20 group-hover:text-white">
                        {p.badge}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-100 font-mono">
                        {p.kmLabel}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-white line-clamp-1">
                      {p.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lokasi Jemput (Titik A) */}
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
                  onBlur={handlePickupBlur}
                  placeholder="Ketik alamat jemput, toko di Purbolinggo / Metro / Lamteng..."
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

              {/* Suggestions Dropdown for Pickup */}
              {pickupSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">{sug.name}</span>
                          {sug.categoryLabel && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                              {sug.categoryLabel}
                            </span>
                          )}
                          {sug.isCurated && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                              PATOKAN RESMI
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">{sug.displayName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Detected Landmark Confirmation Badge */}
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 truncate">
                  <span className="font-semibold text-blue-700">Titik A:</span>
                  <span className="font-mono text-slate-600">[{pickupCoords[0].toFixed(4)}, {pickupCoords[1].toFixed(4)}]</span>
                </span>
                <span className="text-[10px] text-slate-400">Ketik nama kota/toko untuk auto-sync</span>
              </div>
            </div>

            {/* Swap Button (Tukar Titik A ⇄ B) */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwapPoints}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-300 font-bold text-xs transition shadow-2xs active:scale-95"
                title="Tukar Titik Jemput (A) dan Titik Tujuan (B)"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                <span>Tukar Titik A ⇄ B (Balikkan Arah Rute)</span>
              </button>
            </div>

            {/* Lokasi Tujuan (Titik B) */}
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
                  onBlur={handleDestBlur}
                  placeholder="Ketik alamat tujuan, desa di Purbolinggo, atau tujuan ke Metro/Lamteng..."
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
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">{sug.name}</span>
                          {sug.categoryLabel && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                              {sug.categoryLabel}
                            </span>
                          )}
                          {sug.isCurated && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                              PATOKAN RESMI
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">{sug.displayName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Detected Landmark Confirmation Badge */}
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 truncate">
                  <span className="font-semibold text-red-600">Titik B:</span>
                  <span className="font-mono text-slate-600">[{destCoords[0].toFixed(4)}, {destCoords[1].toFixed(4)}]</span>
                </span>
                <span className="text-[10px] text-slate-400">Ketik alamat tujuan / desa untuk auto-sync</span>
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
                    Menghitung rute jalan raya OSRM...
                  </span>
                )}
              </span>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                  <Route className="w-4 h-4 text-blue-600" />
                  <span>Jarak Nyata: {effectiveDistance} KM</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>~{routeData.durationMinutes} Menit Tempuh</span>
                </span>
              </div>
            </div>

            <MapPicker
              pickupCoords={pickupCoords}
              destinationCoords={destCoords}
              roadPolyline={routeData.waypoints}
              activeSelectionMode={activeSelectMode}
              onSelectCoords={handleMapSelect}
              onSwapPoints={handleSwapPoints}
              pickupAddress={pickupAddress}
              destinationAddress={destAddress}
              showPresets={false}
              interactive={true}
              height="380px"
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
