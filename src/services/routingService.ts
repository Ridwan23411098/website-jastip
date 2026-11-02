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

export interface AddressSearchResult {
  displayName: string;
  lat: number;
  lng: number;
  name: string;
}

/**
 * Autocomplete address search using Nominatim OpenStreetMap API
 */
export async function searchAddressOnline(query: string): Promise<AddressSearchResult[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'id',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data.map((item: any) => ({
        displayName: item.display_name,
        name: item.name || item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    }
  } catch (err) {
    console.warn('Address autocomplete search error:', err);
  }

  return [];
}

/**
 * Reverse geocode coordinates to street address
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'id',
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
