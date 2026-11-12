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
  Check,
  Map,
  MessageCircle,
  Banknote,
  Receipt
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

const MAS_SERVICES: { type: ServiceType; label: string; desc: string; icon: any }[] = [
  {
    type: 'Pesanin Makanan/Minuman',
    label: 'Pesanin Makanan/Minuman',
    desc: 'Titip beli makanan, minuman, pecel, bakso, geprek & jajanan warung terdekat.',
    icon: Utensils,
  },
  {
    type: 'Ambil / Antar Barang',
    label: 'Ambil / Antar Barang',
    desc: 'Ambil paket ekspedisi (J&T, SiCepat, Shopee, JNE), dokumen, atau barang titipan.',
    icon: Package,
  },
  {
    type: 'Order (Titip Belanja)',
    label: 'Order (Titip Belanja)',
    desc: 'Titip belanja sembako pasar, apotek, swalayan, atau belanja kebutuhan ke Kota Metro.',
    icon: ShoppingCart,
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
    type: 'Dan lain-lain',
    label: 'Dan lain-lain',
    desc: 'Layanan suruh serbaguna lainnya sesuai permintaan warga (Amanah, Cepat, Ramah).',
    icon: Sparkles,
  },
];

const QUICK_PICKUP_SPOTS = [
  { name: 'Pasar Purbolinggo (Simpang)', lat: -5.0078, lng: 105.4875 },
  { name: 'J&T Express Purbolinggo', lat: -5.0085, lng: 105.4880 },
  { name: 'Minimarket Simpang Pasar', lat: -5.0075, lng: 105.4870 },
  { name: 'Chandra Superstore Kota Metro', lat: -5.1135, lng: 105.3072 },
  { name: 'PB Swalayan Kota Metro', lat: -5.1118, lng: 105.3085 },
  { name: 'Pasar Kotagajah Lamteng', lat: -4.9820, lng: 105.3280 },
];

const QUICK_DEST_VILLAGES = [
  { name: 'Desa Taman Fajar (Pusat)', lat: -5.0092, lng: 105.4880 },
  { name: 'Desa Taman Endah', lat: -5.0185, lng: 105.5020 },
  { name: 'Desa Taman Bogo', lat: -5.0250, lng: 105.4750 },
  { name: 'Desa Taman Cari', lat: -5.0020, lng: 105.5150 },
  { name: 'Desa Tanjung Kesuma', lat: -4.9920, lng: 105.4720 },
  { name: 'Desa Tegal Yoso', lat: -5.0410, lng: 105.4850 },
  { name: 'Desa Toto Harjo', lat: -5.0340, lng: 105.4950 },
  { name: 'Desa Tambah Dadi', lat: -5.0210, lng: 105.4600 },
];

export const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated, onCancel, initialServiceType }) => {
  const loggedInUser = getCurrentUser();

  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType || 'Pesanin Makanan/Minuman');

  useEffect(() => {
    if (initialServiceType) {
      setServiceType(initialServiceType);
    }
  }, [initialServiceType]);

  const isShoppingType =
    serviceType === 'Pesanin Makanan/Minuman' ||
    serviceType === 'Order (Titip Belanja)' ||
    serviceType === 'Jasa Titip';

  const [customerName, setCustomerName] = useState(loggedInUser?.name || '');
  const [phone, setPhone] = useState(loggedInUser?.phone || '');

  const [pickupAddress, setPickupAddress] = useState('Pasar Purbolinggo, Simpang Pasar, Kec. Purbolinggo');
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([-5.0078, 105.4875]);

  const [destAddress, setDestAddress] = useState('Desa Taman Endah (Dusun 2), Kec. Purbolinggo, Lampung Timur');
  const [destCoords, setDestCoords] = useState<[number, number]>([-5.0185, 105.5020]);

  const [showMap, setShowMap] = useState(false);
  const [activeSelectMode, setActiveSelectMode] = useState<'pickup' | 'destination' | null>(null);

  const [requestDetail, setRequestDetail] = useState('');
  const [note, setNote] = useState('');
  const [goodsPrice, setGoodsPrice] = useState<number>(35000);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');

  const [errorMessage, setErrorMessage] = useState('');

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

  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSearchResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<AddressSearchResult[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const searchTimeoutRef = useRef<any>(null);

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

  const effectiveDistance = routeData.distanceKm;
  const fareResult = calculateFare(serviceType, effectiveDistance, isShoppingType ? goodsPrice : 0);
  const tariffConfig = getTariffConfig();

  const handlePickupInputChange = (val: string) => {
    setPickupAddress(val);
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

  const handleSwapPoints = () => {
    const tempAddress = pickupAddress;
    const tempCoords = pickupCoords;
    setPickupAddress(destAddress);
    setPickupCoords(destCoords);
    setDestAddress(tempAddress);
    setDestCoords(tempCoords);
  };

  const handleSelectPickupPreset = (spot: { name: string; lat: number; lng: number }) => {
    setPickupAddress(spot.name + ', Kec. Purbolinggo');
    setPickupCoords([spot.lat, spot.lng]);
    setPickupSuggestions([]);
  };

  const handleSelectDestVillage = (vil: { name: string; lat: number; lng: number }) => {
    setDestAddress(vil.name + ', Kec. Purbolinggo, Lampung Timur');
    setDestCoords([vil.lat, vil.lng]);
    setDestSuggestions([]);
  };

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

  const getDetailPlaceholder = () => {
    switch (serviceType) {
      case 'Pesanin Makanan/Minuman':
        return 'Contoh: Bakso Pak Kumis Simpang 2 porsi, kuah dipisah, mie kuning, sambal banyak, es teh manis 2.';
      case 'Ambil / Antar Barang':
        return 'Contoh: Ambil paket ekspedisi di J&T Purbolinggo atas nama Siti Rahma, no resi SPX12345678.';
      case 'Order (Titip Belanja)':
        return 'Contoh: Titip belanja di Chandra Superstore Metro: Minyak goreng 2L, beras 5kg, dan popok bayi ukuran M.';
      case 'Jemput / Antar Orang':
        return 'Contoh: Jemput anak pulang sekolah di SMPN 1 Purbolinggo antar pulang ke rumah Dusun 2 Taman Endah.';
      case 'Ambil / Antar Hewan Peliharaan':
        return 'Contoh: Bawa kucing persia ke klinik hewan / petshop untuk mandi & grooming.';
      case 'Delivery':
        return 'Contoh: Antar paket kue brownies olshop dari Taman Fajar ke pelanggan di Tanjung Kesuma.';
      default:
        return 'Tuliskan rincian pesanan atau instruksi khusus untuk rider MAS JASTIP...';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Harap masukkan nama pemesan.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('Harap masukkan nomor WhatsApp yang valid agar rider bisa menghubungi.');
      return;
    }
    if (!pickupAddress.trim()) {
      setErrorMessage('Harap tentukan lokasi penjemputan / toko.');
      return;
    }
    if (!destAddress.trim()) {
      setErrorMessage('Harap tentukan lokasi tujuan pengantaran.');
      return;
    }
    if (!requestDetail.trim()) {
      setErrorMessage('Harap isi detail pesanan / barang yang ingin dititip.');
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
        note: (note.trim() ? `${note.trim()} | ` : '') + `Metode Bayar: ${paymentMethod === 'cod' ? 'COD (Tunai saat tiba)' : 'Transfer Bank / QRIS'}`,
        baseFee,
        perKmFee,
        estimatedMinutes: routeData.durationMinutes,
        roadPolyline: routeData.waypoints,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      onOrderCreated(newOrder);
      return newOrder;
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat membuat pesanan.');
      return null;
    }
  };

  const handleOrderViaWhatsApp = () => {
    const order = handleSubmit();
    if (!order) return;

    const waText = encodeURIComponent(
      `*PESANAN BARU - MAS JASTIP PURBOLINGGO*\n\n` +
      `📌 *No. Pesanan*: ${order.orderCode}\n` +
      `🛵 *Layanan*: ${order.serviceType}\n` +
      `👤 *Nama Pemesan*: ${order.customerName}\n` +
      `📱 *WhatsApp*: ${order.phone}\n\n` +
      `📍 *Titik Jemput/Beli*: ${order.pickupAddress}\n` +
      `🏠 *Titik Antar (Tujuan)*: ${order.destinationAddress}\n` +
      `📏 *Jarak Rute*: ± ${order.distance} KM (${order.estimatedMinutes || 15} Menit)\n\n` +
      `📝 *Detail Pesanan*:\n${order.requestDetail}\n\n` +
      (order.goodsPrice ? `🛒 *Estimasi Belanjaan*: ${formatRupiah(order.goodsPrice)}\n` : '') +
      `🏷️ *Ongkir Transparan*: ${formatRupiah(order.serviceFee)}\n` +
      `💵 *TOTAL PERKIRAAN*: ${formatRupiah(order.totalPrice)}\n` +
      `💳 *Metode Pembayaran*: ${paymentMethod === 'cod' ? 'COD (Bayar Tunai di Tempat)' : 'Transfer / QRIS'}\n\n` +
      `Mohon segera diproses ya Rider MAS JASTIP. Terima kasih!`
    );

    window.open(`https://wa.me/6285789528805?text=${waText}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Operating Hours & Hotline Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/60 rounded-3xl p-3 sm:p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="/mas-jastip-logo.png"
            alt="Logo MAS JASTIP"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-500 shadow-sm shrink-0"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black tracking-wide text-white">MAS JASTIP</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs">Purbolinggo</span>
            <span className="hidden sm:inline text-sky-200">• Buka 10.00 - 21.00 WIB</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-white/10 px-2.5 py-1 rounded-lg font-bold text-amber-300 border border-white/10">
            ONGKIR PER KM
          </span>
          <a
            href="https://wa.me/6285789528805?text=Halo%20MAS%20JASTIP%20Purbolinggo%2C%20saya%20mau%20order%20jasa"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-xs text-white"
            title="Chat WhatsApp MAS JASTIP"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>0857-8952-8805</span>
          </a>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xs">
        
        {/* Form Title & Guide */}
        <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold mb-2 border border-orange-200">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Formulir Pesanan Praktis &amp; Mudah</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Buat Pesanan Titip / Suruh
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Isi formulir di bawah ini dengan mudah. Ongkos dihitung transparan per KM jalan raya riil.
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <Info className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* LANGKAH 1: PILIH LAYANAN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">1</span>
                <span>Pilih Jenis Layanan:</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
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
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 relative cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 pr-4">
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {srv.label}
                      </div>
                      <div className="text-[10.5px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {srv.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-blue-600">
                        <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LANGKAH 2: LOKASI PENJEMPUTAN & PENGANTARAN */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">2</span>
                <span>Tentukan Lokasi Penjemputan &amp; Pengantaran:</span>
              </label>
              
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-xl transition flex items-center gap-1.5 border border-blue-200/80 cursor-pointer"
              >
                <Map className="w-3.5 h-3.5" />
                <span>{showMap ? 'Tutup Peta' : 'Buka Peta Interaktif'}</span>
              </button>
            </div>

            {/* Titik Jemput / Toko */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Titik Penjemputan / Toko / Warung:</span>
                </span>
                <span className="text-[11px] text-slate-400">Tempat rider mengambil barang</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => handlePickupInputChange(e.target.value)}
                  placeholder="Ketik nama toko, warung, pasar, atau ketik 'Metro'..."
                  className="w-full text-xs sm:text-sm p-3.5 pl-10 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs font-medium"
                />
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-4" />
                {isSearchingPickup && (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-4" />
                )}

                {pickupSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {pickupSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setPickupAddress(sug.displayName);
                          setPickupCoords([sug.lat, sug.lng]);
                          setPickupSuggestions([]);
                        }}
                        className="w-full text-left p-2.5 px-3.5 hover:bg-blue-50 text-xs border-b border-slate-100 flex items-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{sug.displayName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Pickup Presets Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10.5px] font-bold text-slate-400">Pilihan Cepat:</span>
                {QUICK_PICKUP_SPOTS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPickupPreset(s)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition border border-slate-200/80 cursor-pointer"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwapPoints}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition border border-slate-300 shadow-2xs flex items-center gap-1 text-[11px] font-bold px-3 cursor-pointer"
                title="Tukar Posisi Jemput & Antar"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Tukar Titik</span>
              </button>
            </div>

            {/* Titik Antar / Rumah Pemesan */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-orange-700">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>Titik Pengantaran / Alamat Anda:</span>
                </span>
                <span className="text-[11px] text-slate-400">Tempat pesanan diantarkan</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={destAddress}
                  onChange={(e) => handleDestInputChange(e.target.value)}
                  placeholder="Ketik desa Anda, nama jalan, patokan rumah..."
                  className="w-full text-xs sm:text-sm p-3.5 pl-10 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-2xs font-medium"
                />
                <MapPin className="w-4 h-4 text-orange-600 absolute left-3.5 top-4" />
                {isSearchingDest && (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-4" />
                )}

                {destSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {destSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setDestAddress(sug.displayName);
                          setDestCoords([sug.lat, sug.lng]);
                          setDestSuggestions([]);
                        }}
                        className="w-full text-left p-2.5 px-3.5 hover:bg-orange-50 text-xs border-b border-slate-100 flex items-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{sug.displayName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Destination Villages Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10.5px] font-bold text-slate-400">Desa Purbolinggo:</span>
                {QUICK_DEST_VILLAGES.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDestVillage(v)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-800 transition border border-orange-200/80 cursor-pointer"
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Map Picker Drawer */}
            {showMap && (
              <div className="pt-2 animate-in fade-in duration-200">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Pilih Titik Langsung di Peta:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSelectMode('pickup')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          activeSelectMode === 'pickup'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border text-slate-700'
                        }`}
                      >
                        Klik Jemput (Biru)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSelectMode('destination')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          activeSelectMode === 'destination'
                            ? 'bg-orange-600 text-white'
                            : 'bg-white border text-slate-700'
                        }`}
                      >
                        Klik Antar (Merah)
                      </button>
                    </div>
                  </div>
                  <div className="h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-200">
                    <MapPicker
                      pickupCoords={pickupCoords}
                      destinationCoords={destCoords}
                      onSelectCoords={(type, coords, name) => {
                        handleMapSelect(type, coords, name);
                      }}
                      activeSelectionMode={activeSelectMode}
                      roadPolyline={routeData.waypoints}
                      pickupAddress={pickupAddress}
                      destinationAddress={destAddress}
                      height="100%"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Distance & Route Summary Badge */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">
                  Jarak Rute Jalan: <strong className="text-blue-950 font-black">{effectiveDistance} KM</strong>
                </span>
                <span className="text-blue-400">•</span>
                <span className="text-blue-700">± {routeData.durationMinutes} Menit</span>
              </div>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                Rute Optimal
              </span>
            </div>

          </div>

          {/* LANGKAH 3: RINCIAN PESANAN & ESTIMASI HARGA BARANG */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">3</span>
                <span>Rincian Barang / Pesanan:</span>
              </label>
              <span className="text-[11px] text-slate-400">Jelaskan sejelas mungkin</span>
            </div>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={requestDetail}
                onChange={(e) => setRequestDetail(e.target.value)}
                placeholder={getDetailPlaceholder()}
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs font-medium resize-none leading-relaxed"
              />
            </div>

            {isShoppingType && (
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-orange-600" />
                    <span>Perkiraan Uang Belanjaan (Ditalangi Kurir Dulu):</span>
                  </span>
                  <span className="text-xs font-black text-orange-700 font-heading">
                    {formatRupiah(goodsPrice)}
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={goodsPrice || ''}
                  onChange={(e) => setGoodsPrice(Number(e.target.value) || 0)}
                  placeholder="Masukkan perkiraan harga barang (Rp)"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                />
                <p className="text-[10.5px] text-orange-700">
                  * Uang belanjaan ditalangi rider MAS JASTIP terlebih dahulu. Anda membayar total belanjaan + ongkir sesuai nota struk asli saat barang tiba.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Catatan Tambahan untuk Rider (Opsional):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Rumah cat hijau samping masjid, panggil 'Budi', uang pas disiapkan."
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
              />
            </div>

          </div>

          {/* LANGKAH 4: DATA PEMESAN & PEMBAYARAN */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">4</span>
                <span>Data Pemesan &amp; Metode Pembayaran:</span>
              </label>
              <span className="text-[11px] text-slate-400">Untuk koordinasi kurir</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Nama Lengkap Pemesan:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs sm:text-sm p-3.5 pl-10 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Nomor WhatsApp (Aktif):
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full text-xs sm:text-sm p-3.5 pl-10 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs font-medium"
                  />
                  <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-4" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Pilih Metode Pembayaran:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${paymentMethod === 'cod' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">COD (Bayar Tunai di Rumah)</div>
                    <div className="text-[10.5px] text-slate-500">Bayar saat kurir mengantarkan barang</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${paymentMethod === 'transfer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Transfer Bank / QRIS</div>
                    <div className="text-[10.5px] text-slate-500">Scan QRIS kurir / transfer langsung</div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* RINGKASAN BIAYA TRANSPARAN */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm font-heading">Ringkasan Biaya Transparan</h3>
              </div>
              <span className="text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Resmi Tanpa Mark-up
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Tarif Dasar Layanan:</span>
                <span className="font-semibold text-white">
                  {formatRupiah(isShoppingType ? tariffConfig.jasaTitipBase : tariffConfig.jasaSuruhBase)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tarif Jarak ({effectiveDistance} KM):</span>
                <span className="font-semibold text-white">
                  {formatRupiah(fareResult.serviceFee - (isShoppingType ? tariffConfig.jasaTitipBase : tariffConfig.jasaSuruhBase))}
                </span>
              </div>

              {isShoppingType && goodsPrice > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Estimasi Uang Belanjaan (Talangan):</span>
                  <span className="font-bold">{formatRupiah(goodsPrice)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base">
                <div>
                  <div className="font-black text-white font-heading">TOTAL PERKIRAAN</div>
                  <div className="text-[10px] text-slate-400">
                    Dibayar saat barang tiba ({paymentMethod === 'cod' ? 'COD' : 'QRIS / Transfer'})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-heading">
                    {formatRupiah(fareResult.totalPrice)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Ongkir: {formatRupiah(fareResult.serviceFee)}
                  </div>
                </div>
              </div>
            </div>

            {/* DUAL SUBMISSION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-white font-black py-3.5 px-5 rounded-2xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Pesan Sekarang (Lacak di Web)</span>
              </button>

              <button
                type="button"
                onClick={handleOrderViaWhatsApp}
                className="sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black py-3.5 px-5 rounded-2xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer"
                title="Kirim detail pesanan otomatis ke nomor WhatsApp MAS JASTIP"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pesan via WhatsApp</span>
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
};
