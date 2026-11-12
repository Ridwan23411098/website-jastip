import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Order } from '../types';
import { formatRupiah } from '../services/storageService';
import {
  Phone,
  HelpCircle,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Clock,
  Utensils,
  Package,
  ShoppingCart,
  ShoppingBag,
  Bike,
  Compass,
  Zap,
  Navigation
} from 'lucide-react';

interface ShopeeFoodTrackingViewProps {
  order: Order;
  onRefresh?: () => void;
}

// Calculate bearing angle between two lat/lng coordinates (0 = North, 90 = East, etc.)
function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Interpolate between two points
function interpolatePoint(p1: [number, number], p2: [number, number], fraction: number): [number, number] {
  return [
    p1[0] + (p2[0] - p1[0]) * fraction,
    p1[1] + (p2[1] - p1[1]) * fraction,
  ];
}

// Generate smooth road fallback waypoints if OSRM was not available
function generateSmoothRoadWaypoints(
  start: [number, number],
  end: [number, number],
  numPoints: number = 50
): [number, number][] {
  const waypoints: [number, number][] = [];
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  // slight realistic curve offset
  const offsetLat = (end[1] - start[1]) * 0.12;
  const offsetLng = -(end[0] - start[0]) * 0.12;

  const ctrl: [number, number] = [midLat + offsetLat, midLng + offsetLng];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // quadratic bezier
    const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * ctrl[0] + t * t * end[0];
    const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * ctrl[1] + t * t * end[1];
    waypoints.push([lat, lng]);
  }
  return waypoints;
}

export const ShopeeFoodTrackingView: React.FC<ShopeeFoodTrackingViewProps> = ({
  order,
  onRefresh,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Road waypoints
  const waypoints = useRef<[number, number][]>([]);

  // Animation states
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(35);
  const [distanceRemaining, setDistanceRemaining] = useState<string>('~' + order.distance + ' KM');
  const [estimatedArrivalRange, setEstimatedArrivalRange] = useState<string>('');

  // Prepare road waypoints
  useEffect(() => {
    if (order.roadPolyline && order.roadPolyline.length > 5) {
      waypoints.current = order.roadPolyline;
    } else {
      waypoints.current = generateSmoothRoadWaypoints(
        [order.pickupLat, order.pickupLng],
        [order.destinationLat, order.destinationLng],
        60
      );
    }
  }, [order.pickupLat, order.pickupLng, order.destinationLat, order.destinationLng, order.roadPolyline]);

  // Calculate ETA range like ShopeeFood (e.g. 22:56 - 23:11)
  useEffect(() => {
    const now = new Date();
    const durationMin = order.estimatedMinutes || Math.max(5, Math.ceil(order.distance * 2.5));
    const startEta = new Date(now.getTime() + (durationMin - 2) * 60000);
    const endEta = new Date(now.getTime() + (durationMin + 8) * 60000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    setEstimatedArrivalRange(
      `${pad(startEta.getHours())}:${pad(startEta.getMinutes())} - ${pad(endEta.getHours())}:${pad(endEta.getMinutes())}`
    );
  }, [order.distance, order.estimatedMinutes]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const startPos = waypoints.current[0] || [order.pickupLat, order.pickupLng];
    const map = L.map(mapContainerRef.current, {
      center: startPos,
      zoom: 14,
      zoomControl: false, // Cleaner mobile ShopeeFood look
      attributionControl: false,
    });

    // Clean Google Maps / Carto Voyager styled tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 1. Pickup / Merchant Marker (Fork & Spoon in Blue/Orange Circle)
    const pickupIcon = L.divIcon({
      className: 'custom-shopee-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            background: #2563eb;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(37,99,235,0.45);
            border: 3px solid white;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path>
              <path d="M15 2v18"></path>
              <path d="M6 2v7a3 3 0 0 0 6 0V2"></path>
              <path d="M9 2v18"></path>
            </svg>
          </div>
          <div style="
            background: #1e293b;
            color: white;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 6px;
            margin-top: 3px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          ">
            Resto / Jemput
          </div>
        </div>
      `,
      iconSize: [42, 60],
      iconAnchor: [21, 55],
    });

    L.marker([order.pickupLat, order.pickupLng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<b>Titik Jemput/Beli:</b><br/>${order.pickupAddress}`);

    // 2. Destination / Home Marker (Red Circle with Home Icon)
    const destIcon = L.divIcon({
      className: 'custom-shopee-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            background: #ef4444;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(239,68,68,0.45);
            border: 3px solid white;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div style="
            background: #1e293b;
            color: white;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 6px;
            margin-top: 3px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          ">
            Alamat Anda
          </div>
        </div>
      `,
      iconSize: [42, 60],
      iconAnchor: [21, 55],
    });

    L.marker([order.destinationLat, order.destinationLng], { icon: destIcon })
      .addTo(map)
      .bindPopup(`<b>Tujuan Antar:</b><br/>${order.destinationAddress}`);

    // 3. Road Polyline (ShopeeFood Blue/Orange Road)
    L.polyline(waypoints.current, {
      color: '#0284c7',
      weight: 6,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 4. Moving Motorcycle Marker (ShopeeFood Top-Down Scooter with Red Thermal Bag)
    const createMotorcycleHtml = (angle: number) => `
      <div id="shopee-courier-wrapper" style="
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Radar Pulsing Waves -->
        <div style="
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.25);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          pointer-events: none;
        "></div>
        
        <!-- Rotating Top-Down Motor Rider Graphic -->
        <div id="shopee-motor-rotator" style="
          transform: rotate(${angle}deg);
          transition: transform 0.2s linear;
          width: 48px;
          height: 48px;
          filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.35));
        ">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Scooter Shadow -->
            <ellipse cx="24" cy="25" rx="14" ry="20" fill="rgba(0,0,0,0.22)"/>
            
            <!-- Scooter Front Wheel & Fender (Facing UP 0 deg) -->
            <rect x="22" y="2" width="4" height="8" rx="2" fill="#0f172a"/>
            <rect x="20" y="5" width="8" height="5" rx="2.5" fill="#2563eb"/>
            
            <!-- Handlebars -->
            <path d="M12 12C16 10 32 10 36 12" stroke="#334155" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="2" fill="#0f172a"/>
            <circle cx="36" cy="12" r="2" fill="#0f172a"/>
            <!-- Mirrors -->
            <circle cx="10" cy="9" r="1.5" fill="#94a3b8"/>
            <circle cx="38" cy="9" r="1.5" fill="#94a3b8"/>
            
            <!-- Scooter Body (Blue Scooter) -->
            <path d="M18 13C18 13 16 22 17 32C17.5 37 30.5 37 31 32C32 22 30 13 30 13Z" fill="#2563eb"/>
            <path d="M20 14H28V24H20Z" fill="#1d4ed8"/>
            
            <!-- Rider Arms -->
            <path d="M14 13L18 20" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>
            <path d="M34 13L30 20" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>
            
            <!-- Rider Body (Navy/Dark Jacket) -->
            <ellipse cx="24" cy="23" rx="7" ry="5" fill="#0f172a"/>
            
            <!-- Rider Helmet (Red Helmet with Visor) -->
            <circle cx="24" cy="20" r="5.5" fill="#ef4444"/>
            <path d="M21 17C22 16 26 16 27 17" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
            
            <!-- Red Delivery Thermal Box on rear rack (ShopeeFood Style) -->
            <rect x="18" y="29" width="12" height="13" rx="2.5" fill="#dc2626"/>
            <rect x="19" y="30" width="10" height="11" rx="1.5" fill="#ea580c"/>
            <rect x="21" y="32" width="6" height="4" rx="1" fill="#ffffff" fill-opacity="0.9"/>
            <line x1="18" y1="35" x2="30" y2="35" stroke="#991b1b" stroke-width="1.5"/>
          </svg>
        </div>
      </div>
    `;

    const initialAngle = waypoints.current.length > 1
      ? getBearing(
          waypoints.current[0][0],
          waypoints.current[0][1],
          waypoints.current[1][0],
          waypoints.current[1][1]
        )
      : 45;

    const courierIcon = L.divIcon({
      className: 'shopee-moving-motor-icon',
      html: createMotorcycleHtml(initialAngle),
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const courierMarker = L.marker(startPos, {
      icon: courierIcon,
      zIndexOffset: 2000,
    }).addTo(map);

    courierMarker.bindPopup(`
      <b>Kurir OTW: ${order.courierName || 'Budi Santoso'}</b><br/>
      Motor: Honda Beat Street (BE 4521 AA)<br/>
      Status: Sedang meluncur membawa pesanan
    `);

    courierMarkerRef.current = courierMarker;
    mapInstanceRef.current = map;

    // Fit map bounds to whole route with nice padding
    try {
      const bounds = L.latLngBounds([
        [order.pickupLat, order.pickupLng],
        [order.destinationLat, order.destinationLng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch (e) {
      // ignore
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [order.pickupLat, order.pickupLng, order.destinationLat, order.destinationLng]);

  // Real-time Road Animation Ticker Loop (Motorcycle moves along the polyline)
  useEffect(() => {
    if (!isPlaying || waypoints.current.length < 2) return;

    let currentIndex = Math.floor((progressPercent / 100) * (waypoints.current.length - 1));
    let localFraction = ((progressPercent / 100) * (waypoints.current.length - 1)) % 1;

    let lastTimestamp = performance.now();

    const animateLoop = (timestamp: number) => {
      const deltaMs = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Speed configuration: step speed based on speedMultiplier
      const stepIncrement = (0.00065 * speedMultiplier * deltaMs) / 16;
      localFraction += stepIncrement;

      if (localFraction >= 1) {
        currentIndex += Math.floor(localFraction);
        localFraction = localFraction % 1;
      }

      // Loop or restart when reaching end
      if (currentIndex >= waypoints.current.length - 1) {
        currentIndex = 0;
        localFraction = 0;
      }

      const p1 = waypoints.current[currentIndex];
      const p2 = waypoints.current[Math.min(currentIndex + 1, waypoints.current.length - 1)];

      if (p1 && p2 && courierMarkerRef.current) {
        const currentCoord = interpolatePoint(p1, p2, localFraction);
        const heading = getBearing(p1[0], p1[1], p2[0], p2[1]);

        // Move Leaflet Marker position
        courierMarkerRef.current.setLatLng(currentCoord);

        // Rotate motorcycle SVG
        const rotatorEl = document.getElementById('shopee-motor-rotator');
        if (rotatorEl) {
          rotatorEl.style.transform = `rotate(${heading}deg)`;
        }

        // Calculate progress percentage
        const totalWp = waypoints.current.length - 1;
        const currentProgress = Math.min(100, Math.round(((currentIndex + localFraction) / totalWp) * 100));
        setProgressPercent(currentProgress);

        // Update remaining distance
        const kmRemaining = Math.max(0.1, Math.round(order.distance * (1 - currentProgress / 100) * 10) / 10);
        setDistanceRemaining(`${kmRemaining} KM`);
      }

      animFrameRef.current = requestAnimationFrame(animateLoop);
    };

    animFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, speedMultiplier, order.distance]);

  const handleReset = () => {
    setProgressPercent(0);
    if (waypoints.current.length > 0 && courierMarkerRef.current) {
      courierMarkerRef.current.setLatLng(waypoints.current[0]);
    }
  };

  const getStatusHeadline = () => {
    switch (order.status) {
      case 'Menuju Lokasi':
        return 'Driver Menuju Lokasi Jemput';
      case 'Barang Diambil':
        return 'Driver Sedang Menyiapkan Pesanan';
      case 'Dalam Perjalanan':
        return 'Driver Menuju Alamat Anda';
      case 'Selesai':
        return 'Pesanan Telah Tiba di Tujuan';
      default:
        return 'Driver Sedang Dalam Perjalanan';
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 max-w-2xl mx-auto text-slate-800">
      
      {/* 1. ShopeeFood Realtime Interactive Map Container */}
      <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-100">
        
        {/* Leaflet Map DOM container */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Top-Right ShopeeFood Help Button '?' */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
          <a
            href="https://wa.me/6285789528805?text=Halo%20Admin%20JSP%20KURIR%2C%20saya%20butuh%20bantuan%20pesanan"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-slate-700 hover:text-orange-600 flex items-center justify-center transition active:scale-95"
            title="Bantuan Pesanan"
          >
            <HelpCircle className="w-5 h-5" />
          </a>
        </div>

        {/* Top-Left Order Code Badge */}
        <div className="absolute top-3.5 left-3.5 z-20">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md flex items-center gap-2 text-xs font-black font-mono text-slate-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{order.orderCode}</span>
          </div>
        </div>

        {/* Floating Bottom Estimated Arrival Time Pill (Exact ShopeeFood Styling) */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md z-20">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xl flex items-center justify-between gap-3 text-xs font-bold text-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <div className="truncate">
                <span className="text-slate-500 font-medium">Perkiraan pesanan tiba: </span>
                <span className="text-slate-900 font-extrabold">{estimatedArrivalRange || '22:56 - 23:11'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onRefresh) onRefresh();
              }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-orange-600 transition shrink-0"
              title="Perbarui Estimasi"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 2. ShopeeFood Bottom Sheet / Status Card (Matching Screenshot Directly) */}
      <div className="p-5 sm:p-7 space-y-6 bg-white border-t border-slate-100">
        
        {/* Grey Drag Handle line */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1 mb-3"></div>

        {/* Main Status Headline */}
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            {getStatusHeadline()}
          </h2>
          <p className="text-xs text-slate-500">
            Kurir sedang bergerak di rute jalan raya membawa pesanan Anda ({distanceRemaining} lagi).
          </p>
        </div>

        {/* ShopeeFood 3-Point Horizontal Step Progress (Pesanan Diterima - Diambil - Selesai) */}
        <div className="pt-2 pb-4">
          <div className="relative flex items-center justify-between max-w-sm mx-auto px-4">
            
            {/* Connecting Track Line */}
            <div className="absolute top-3.5 left-10 right-10 h-0.5 bg-slate-200 -z-0">
              {/* Active filled line portion */}
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(15, progressPercent))}%` }}
              ></div>
            </div>

            {/* Step 1: Pesanan Diterima */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 mt-1.5">Pesanan Diterima</span>
              <span className="text-[10px] text-slate-400">10.15</span>
            </div>

            {/* Step 2: Diambil */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                progressPercent > 25
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {progressPercent > 25 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
                )}
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${
                progressPercent > 25 ? 'text-slate-800' : 'text-slate-400'
              }`}>
                Diambil
              </span>
              <span className="text-[10px] text-slate-400">
                {progressPercent > 25 ? '10.28' : 'Proses'}
              </span>
            </div>

            {/* Step 3: Selesai */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                order.status === 'Selesai' || progressPercent >= 98
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {order.status === 'Selesai' || progressPercent >= 98 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
                )}
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${
                order.status === 'Selesai' || progressPercent >= 98
                  ? 'text-slate-800'
                  : 'text-slate-400'
              }`}>
                Selesai
              </span>
              <span className="text-[10px] text-slate-400">Tujuan</span>
            </div>

          </div>
        </div>

        {/* Interactive Motor Simulation Controls (Play, Pause, Speed) */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-orange-500" />
              <span>Simulasi Motor OTW:</span>
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-800 flex items-center gap-1 shadow-2xs active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-orange-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isPlaying ? 'Jeda' : 'Jalankan'}</span>
            </button>
            <button
              onClick={handleReset}
              className="px-2 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-600 flex items-center gap-1 shadow-2xs active:scale-95"
              title="Ulangi dari Awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Kecepatan:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition ${
                  speedMultiplier === spd
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Driver Profile & Vehicle Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/mas-jastip-logo.png"
                alt="Foto Profil Driver"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full">
                <Bike className="w-3 h-3" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="font-extrabold text-sm text-slate-900 truncate">
                {order.courierName || 'Budi Santoso'}
              </div>
              <div className="text-xs text-slate-500 truncate mt-0.5">
                Honda Beat Street • <strong>BE 4521 AA</strong>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>GPS Live Aktif • Posisi Motor Bergerak</span>
              </div>
            </div>
          </div>

          {/* Contact Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://wa.me/6285789528805?text=Halo%20driver%20JSP%20KURIR%20(${encodeURIComponent(order.courierName || 'Budi Santoso')})%2C%20saya%20pemesan%20${order.orderCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Chat Driver via WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Chat Driver</span>
            </a>
          </div>
        </div>

        {/* Order Details Accordion / Summary */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-start justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-slate-400 text-[11px] block">Layanan:</span>
              <span className="font-bold text-slate-800">{order.serviceType}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">Total Ongkir:</span>
              <span className="font-black text-orange-600 text-sm">{formatRupiah(order.totalPrice)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                A
              </span>
              <div className="text-slate-700">
                <strong>Jemput/Beli:</strong> {order.pickupAddress}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                B
              </span>
              <div className="text-slate-700">
                <strong>Tujuan Antar:</strong> {order.destinationAddress}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
