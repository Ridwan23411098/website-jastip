import { RouteCalculationResult } from '../types';

export type { RouteCalculationResult };

/**
 * Build Google Maps turn-by-turn navigation URL for two-wheeler / motor
 */
export function getGoogleMapsNavUrl(
  origin: [number, number],
  destination: [number, number]
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&travelmode=two_wheeler`;
}

/**
 * Fetch real driving road route between two points using OSRM
 * Returns actual road distance, ETA, and turn-by-turn road coordinates.
 */
export async function getRealRoadRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<RouteCalculationResult> {
  const [lat1, lon1] = origin;
  const [lat2, lon2] = destination;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        // Motorcycle speed estimate (faster than heavy car traffic, around 30 km/h)
        const durationMinutes = Math.max(3, Math.ceil((distanceKm / 30) * 60));
        
        // GeoJSON coordinates are [lon, lat], convert to Leaflet [lat, lon]
        const waypoints: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        return {
          distanceKm: Math.max(0.5, distanceKm),
          durationMinutes,
          waypoints,
          isRealRoad: true,
          summary: route.legs?.[0]?.summary || 'Rute Jalan Raya',
        };
      }
    }
  } catch (error) {
    console.warn('OSRM routing API unavailable, using simulated curved road trajectory:', error);
  }

  // Graceful Fallback: Generate curved road-like waypoint interpolation
  return generateCurvedRoadRoute(origin, destination);
}

/**
 * Generates an interpolated multi-point road curve trajectory
 * ensuring the line looks like a road rather than an unrealistic straight flight path.
 */
function generateCurvedRoadRoute(
  origin: [number, number],
  destination: [number, number]
): RouteCalculationResult {
  const [lat1, lon1] = origin;
  const [lat2, lon2] = destination;

  // Haversine base distance
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  
  // Real road factor: roads are ~25-30% longer than straight lines
  const distanceKm = Math.max(0.5, Math.round(straightKm * 1.28 * 10) / 10);
  const durationMinutes = Math.max(3, Math.ceil((distanceKm / 30) * 60));

  // Generate 8-point smooth road curve
  const steps = 8;
  const waypoints: [number, number][] = [];
  
  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;
  // Perpendicular offset for organic road curvature
  const perpLat = -(lon2 - lon1) * 0.15;
  const perpLon = (lat2 - lat1) * 0.15;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier curve: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const ctrlLat = midLat + perpLat;
    const ctrlLon = midLon + perpLon;

    const lat = Math.pow(1 - t, 2) * lat1 + 2 * (1 - t) * t * ctrlLat + Math.pow(t, 2) * lat2;
    const lon = Math.pow(1 - t, 2) * lon1 + 2 * (1 - t) * t * ctrlLon + Math.pow(t, 2) * lon2;
    waypoints.push([lat, lon]);
  }

  return {
    distanceKm,
    durationMinutes,
    waypoints,
    isRealRoad: false,
    summary: 'Rute Jalan Diestimasi',
  };
}

import { LOCATION_LANDMARKS } from '../data/initialData';
import { LocationLandmark } from '../types';

export interface AddressSearchResult {
  displayName: string;
  lat: number;
  lng: number;
  name: string;
  category?: string;
  categoryLabel?: string;
  isCurated?: boolean;
}

/**
 * Find the best matching curated landmark for any input query.
 * Useful for instant auto-sync when a user types "metro", "kotagajah", "sukadana", etc.
 */
export function findBestLandmarkMatch(query: string): LocationLandmark | null {
  if (!query || query.trim().length < 2) return null;
  const q = query.toLowerCase().trim();

  // 1. Exact alias match
  for (const loc of LOCATION_LANDMARKS) {
    if (loc.aliases.some((alias) => alias.toLowerCase() === q)) {
      return loc;
    }
  }

  // 2. Exact name or address match
  for (const loc of LOCATION_LANDMARKS) {
    if (loc.name.toLowerCase() === q || loc.address.toLowerCase() === q) {
      return loc;
    }
  }

  // 3. Substring match on aliases or name
  for (const loc of LOCATION_LANDMARKS) {
    if (
      loc.aliases.some((alias) => q.includes(alias.toLowerCase())) ||
      loc.name.toLowerCase().includes(q)
    ) {
      return loc;
    }
  }

  return null;
}

/**
 * Autocomplete address search that prioritizes accurate local landmarks
 * in Purbolinggo, Kota Metro, Lampung Tengah, and Lampung Timur,
 * with fallback to OpenStreetMap Nominatim.
 */
export async function searchAddressOnline(query: string): Promise<AddressSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();

  // 1. Curated local landmarks matching
  const localMatches: AddressSearchResult[] = LOCATION_LANDMARKS.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q) ||
      loc.aliases.some((alias) => alias.toLowerCase().includes(q))
    );
  }).map((loc) => ({
    displayName: `${loc.name} (${loc.categoryLabel}) - ${loc.address}`,
    name: loc.name,
    lat: loc.lat,
    lng: loc.lng,
    category: loc.category,
    categoryLabel: loc.categoryLabel,
    isCurated: true,
  }));

  // If query specifically targets a well-known area and we have local matches,
  // return them right away for instant feedback
  let onlineResults: AddressSearchResult[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    // Bias search to Lampung, Indonesia
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query + ', Lampung'
    )}&countrycodes=id&limit=4&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'id',
        'User-Agent': 'MasJastipPurbolinggo/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      onlineResults = data.map((item: any) => ({
        displayName: item.display_name,
        name: item.name || item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        isCurated: false,
      }));
    }
  } catch (err) {
    // ignore online search error, local landmarks already cover main destinations
  }

  // Combine curated results first, then online results
  const combined = [...localMatches];
  for (const item of onlineResults) {
    const isDuplicate = combined.some(
      (c) => Math.abs(c.lat - item.lat) < 0.005 && Math.abs(c.lng - item.lng) < 0.005
    );
    if (!isDuplicate) {
      combined.push(item);
    }
  }

  return combined.slice(0, 8);
}

/**
 * Reverse geocode coordinates to street address
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<string> {
  // Check if close to a curated landmark first (< 300m)
  for (const loc of LOCATION_LANDMARKS) {
    const dLat = Math.abs(loc.lat - lat);
    const dLng = Math.abs(loc.lng - lng);
    if (dLat < 0.003 && dLng < 0.003) {
      return `${loc.name}, ${loc.categoryLabel}`;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'id',
        'User-Agent': 'MasJastipPurbolinggo/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.display_name) {
        return data.display_name.split(',').slice(0, 3).join(',').trim();
      }
    }
  } catch (err) {
    // ignore
  }

  return `Koordinat [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
}

