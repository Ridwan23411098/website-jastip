import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { POPULAR_LOCATIONS } from '../data/initialData';
import { ExternalLink, Navigation } from 'lucide-react';

interface MapPickerProps {
  pickupCoords: [number, number];
  destinationCoords: [number, number];
  roadPolyline?: [number, number][];
  courierCoords?: [number, number];
  courierHeading?: number;
  activeSelectionMode?: 'pickup' | 'destination' | null;
  onSelectCoords?: (type: 'pickup' | 'destination', coords: [number, number], name?: string) => void;
  showPresets?: boolean;
  interactive?: boolean;
  height?: string;
  courierName?: string;
  pickupAddress?: string;
  destinationAddress?: string;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  pickupCoords,
  destinationCoords,
  roadPolyline,
  courierCoords,
  courierHeading = 0,
  activeSelectionMode = null,
  onSelectCoords,
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

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: pickupCoords || [-5.0092, 105.4880],
        zoom: 13,
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
      courierMarker.bindPopup(`<strong>Posisi Kurir:</strong> ${courierName || 'Kurir AntarAja'}<br/>GPS Live Aktif`);
    }

    // 4. Polyline Road Routing
    const pointsToDraw = roadPolyline && roadPolyline.length > 1
      ? roadPolyline
      : [pickupCoords, destinationCoords];

    // Background road casing for premium contrast
    L.polyline(pointsToDraw, {
      color: '#1e3a8a',
      weight: 6,
      opacity: 0.35,
    }).addTo(layer);

    // Foreground dynamic road line
    const polyline = L.polyline(pointsToDraw, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(layer);

    // Fit bounds smoothly without excessive zoom jitter
    try {
      const allPoints = courierCoords ? [...pointsToDraw, courierCoords] : pointsToDraw;
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    } catch (e) {
      // ignore
    }
  }, [pickupCoords, destinationCoords, roadPolyline, courierCoords, courierHeading, interactive, activeSelectionMode]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords[0]},${pickupCoords[1]}&destination=${destinationCoords[0]},${destinationCoords[1]}&travelmode=two_wheeler`;

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
                : 'Geser marker A atau B untuk menyesuaikan rute'}
            </span>
          </div>
        )}

        {/* Google Maps External Deep Link Button */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 z-[400] bg-white/95 hover:bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-xs border border-blue-200 shadow-md transition flex items-center gap-1.5"
          title="Buka rute navigasi di Google Maps"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Buka di Google Maps</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>

      {/* Quick Location Presets */}
      {showPresets && onSelectCoords && (
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Pilihan Cepat Lokasi Populer:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => {
                  const mode = activeSelectionMode || 'destination';
                  onSelectCoords(mode, [loc.lat, loc.lng], loc.address);
                }}
                className="text-xs font-medium bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200 transition active:scale-95 shadow-xs"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
