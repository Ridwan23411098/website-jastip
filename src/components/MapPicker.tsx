import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCATION_LANDMARKS } from '../data/initialData';
import { LandmarkCategory, LocationLandmark } from '../types';
import { ExternalLink, Navigation, ArrowLeftRight, MapPin, Check } from 'lucide-react';

interface MapPickerProps {
  pickupCoords: [number, number];
  destinationCoords: [number, number];
  roadPolyline?: [number, number][];
  courierCoords?: [number, number];
  courierHeading?: number;
  activeSelectionMode?: 'pickup' | 'destination' | null;
  onSelectCoords?: (type: 'pickup' | 'destination', coords: [number, number], name?: string) => void;
  onSwapPoints?: () => void;
  showPresets?: boolean;
  interactive?: boolean;
  height?: string;
  courierName?: string;
  pickupAddress?: string;
  destinationAddress?: string;
}

const CATEGORIES: { id: LandmarkCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Semua Patokan', icon: '🌟' },
  { id: 'purbolinggo', label: 'Purbolinggo (12 Desa)', icon: '🏠' },
  { id: 'metro', label: 'Kota Metro', icon: '🏙️' },
  { id: 'lamteng', label: 'Lampung Tengah', icon: '🌾' },
  { id: 'lamtim', label: 'Lampung Timur', icon: '📍' },
  { id: 'bandarlampung', label: 'Bandar Lampung', icon: '🏢' },
];

export const MapPicker: React.FC<MapPickerProps> = ({
  pickupCoords,
  destinationCoords,
  roadPolyline,
  courierCoords,
  courierHeading = 0,
  activeSelectionMode = null,
  onSelectCoords,
  onSwapPoints,
  showPresets = true,
  interactive = true,
  height = '380px',
  courierName,
  pickupAddress,
  destinationAddress,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LandmarkCategory | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: pickupCoords || [-5.0092, 105.4880],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: interactive,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Click to place marker if interactive
      if (interactive && onSelectCoords) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const mode = activeSelectionMode || 'destination';
          onSelectCoords(mode, [e.latlng.lat, e.latlng.lng]);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update Markers, Courier Marker, and Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Pickup Marker (Blue A)
    const pickupIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #2563eb;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(37,99,235,0.45);
        ">A</div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const pickupMarker = L.marker(pickupCoords, {
      icon: pickupIcon,
      draggable: interactive,
    }).addTo(layer);

    pickupMarker.bindPopup(`<strong>Titik Penjemputan (A)</strong><br/>${pickupAddress || ''}`);

    if (interactive && onSelectCoords) {
      pickupMarker.on('dragend', () => {
        const latlng = pickupMarker.getLatLng();
        onSelectCoords('pickup', [latlng.lat, latlng.lng]);
      });
    }

    // 2. Destination Marker (Red B)
    const destIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #ef4444;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(239,68,68,0.45);
        ">B</div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const destMarker = L.marker(destinationCoords, {
      icon: destIcon,
      draggable: interactive,
    }).addTo(layer);

    destMarker.bindPopup(`<strong>Titik Tujuan (B)</strong><br/>${destinationAddress || ''}`);

    if (interactive && onSelectCoords) {
      destMarker.on('dragend', () => {
        const latlng = destMarker.getLatLng();
        onSelectCoords('destination', [latlng.lat, latlng.lng]);
      });
    }

    // 3. Courier Marker (Live GPS / Moving Simulation)
    if (courierCoords) {
      const courierIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              background-color: #10b981;
              color: white;
              padding: 4px 8px;
              border-radius: 20px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: 800;
              font-size: 11px;
              border: 2px solid white;
              box-shadow: 0 4px 14px rgba(16,185,129,0.5);
              white-space: nowrap;
              z-index: 20;
            ">
              <span style="display: inline-block; transform: rotate(${courierHeading}deg); transition: transform 0.4s ease;">🛵</span>
              <span>${courierName || 'Kurir Live'}</span>
            </div>
            <div style="
              position: absolute;
              top: 2px;
              left: 50%;
              transform: translateX(-50%);
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: rgba(16,185,129,0.25);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              z-index: 10;
              pointer-events: none;
            "></div>
          </div>
        `,
        iconSize: [100, 36],
        iconAnchor: [50, 18],
      });

      const courierMarker = L.marker(courierCoords, { icon: courierIcon, zIndexOffset: 1000 }).addTo(layer);
      courierMarker.bindPopup(`<strong>Posisi Kurir:</strong> ${courierName || 'Kurir Mas Jastip'}<br/>GPS Live Aktif`);
    }

    // 4. Polyline Road Routing
    const pointsToDraw = roadPolyline && roadPolyline.length > 1
      ? roadPolyline
      : [pickupCoords, destinationCoords];

    // Background road casing for contrast
    L.polyline(pointsToDraw, {
      color: '#1e3a8a',
      weight: 6,
      opacity: 0.35,
    }).addTo(layer);

    // Foreground dynamic road line
    L.polyline(pointsToDraw, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(layer);

    // Fit bounds smoothly with generous padding
    try {
      const allPoints = courierCoords ? [...pointsToDraw, courierCoords] : pointsToDraw;
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } catch (e) {
      // ignore
    }
  }, [pickupCoords, destinationCoords, roadPolyline, courierCoords, courierHeading, interactive, activeSelectionMode]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords[0]},${pickupCoords[1]}&destination=${destinationCoords[0]},${destinationCoords[1]}&travelmode=two_wheeler`;

  // Filtered landmarks for presets
  const filteredLandmarks = LOCATION_LANDMARKS.filter((loc) => {
    const matchCat = selectedCategory === 'all' || loc.category === selectedCategory;
    const matchQuery =
      !searchFilter.trim() ||
      loc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.aliases.some((a) => a.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <div
          ref={mapContainerRef}
          style={{ height, minHeight: '340px' }}
          className="w-full relative z-0"
        />

        {/* Floating Top Helper Badge */}
        {interactive && (
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-md border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>
              {activeSelectionMode === 'pickup'
                ? '📍 Klik peta untuk menentukan Titik Jemput (A)'
                : activeSelectionMode === 'destination'
                ? '🏁 Klik peta untuk menentukan Titik Tujuan (B)'
                : 'Geser marker A atau B untuk menyesuaikan rute rute jalan'}
            </span>
          </div>
        )}

        {/* Floating Controls: Swap & Google Maps */}
        <div className="absolute bottom-3 right-3 z-[400] flex items-center gap-2 flex-wrap">
          {onSwapPoints && (
            <button
              type="button"
              onClick={onSwapPoints}
              className="bg-white/95 hover:bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs border border-slate-300 shadow-md transition flex items-center gap-1.5 active:scale-95"
              title="Tukar Titik Jemput (A) dan Tujuan (B)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
              <span>Tukar A ⇄ B</span>
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
            title="Buka rute navigasi Google Maps untuk motor"
          >
            <Navigation className="w-3.5 h-3.5 text-white" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-blue-200" />
          </a>
        </div>
      </div>

      {/* Fleksibel Maps Presets & Landmarks Selector */}
      {showPresets && onSelectCoords && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Patokan Titik Cepat (Purbolinggo, Metro, Lamteng, Lamtim):</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Pilih patokan di bawah ini, langsung set jadi <strong>Titik Jemput (A)</strong> atau <strong>Tujuan (B)</strong>.
              </p>
            </div>
            
            {/* Quick Search inside landmarks */}
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari patokan (cth: chandra, kotagajah)..."
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 w-full sm:w-56"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-3 py-1 rounded-xl whitespace-nowrap transition border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat.icon} {cat.label}</span>
              </button>
            ))}
          </div>

          {/* Landmarks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1 pr-1.5">
            {filteredLandmarks.map((loc) => {
              const isPickup = Math.abs(pickupCoords[0] - loc.lat) < 0.001 && Math.abs(pickupCoords[1] - loc.lng) < 0.001;
              const isDest = Math.abs(destinationCoords[0] - loc.lat) < 0.001 && Math.abs(destinationCoords[1] - loc.lng) < 0.001;

              return (
                <div
                  key={loc.id}
                  className={`p-2.5 rounded-xl border bg-white text-left transition flex flex-col justify-between gap-2 ${
                    isPickup
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40'
                      : isDest
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/40'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {loc.categoryLabel}
                      </span>
                      {loc.typicalKmFromPurbolinggo !== undefined && (
                        <span className="text-[10px] font-bold text-slate-500">
                          ~{loc.typicalKmFromPurbolinggo} KM
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-800 line-clamp-1">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {loc.subCategory || loc.address}
                    </div>
                  </div>

                  {/* Action Buttons for A and B */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectCoords('pickup', [loc.lat, loc.lng], loc.address)}
                      className={`flex-1 text-[11px] font-bold py-1 px-2 rounded-lg transition border flex items-center justify-center gap-1 ${
                        isPickup
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                      title="Jadikan Titik Penjemputan / Toko (A)"
                    >
                      {isPickup ? <Check className="w-3 h-3" /> : <span>A:</span>}
                      <span>Jemput</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectCoords('destination', [loc.lat, loc.lng], loc.address)}
                      className={`flex-1 text-[11px] font-bold py-1 px-2 rounded-lg transition border flex items-center justify-center gap-1 ${
                        isDest
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                      }`}
                      title="Jadikan Titik Tujuan / Antar (B)"
                    >
                      {isDest ? <Check className="w-3 h-3" /> : <span>B:</span>}
                      <span>Tujuan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

