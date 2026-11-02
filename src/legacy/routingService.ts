export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lat, lng] array for Leaflet
  source: 'osrm' | 'fallback';
}

// Haversine formula for fallback distance
export function calculateHaversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = R * c;
  // Multiply by 1.3 to estimate real city road network winding factor
  return directDistance * 1.3;
}

// Fetch real route from OpenStreetMap OSRM
export async function getRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<RouteResult> {
  const [lat1, lng1] = origin;
  const [lat2, lng2] = destination;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Number((route.distance / 1000).toFixed(1));
        const durationMinutes = Math.max(5, Math.round(route.duration / 60));
        
        // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        return {
          distanceKm,
          durationMinutes,
          coordinates,
          source: 'osrm',
        };
      }
    }
  } catch (err) {
    console.warn('OSRM routing failed or timed out, using fallback calculation:', err);
  }

  // Fallback geometric route
  const fallbackDistance = Number(calculateHaversineDistance(origin, destination).toFixed(1));
  const fallbackDuration = Math.max(8, Math.round(fallbackDistance * 2.8 + 4));

  // Generate intermediate points for a smooth map line
  const steps = 10;
  const coordinates: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const factor = i / steps;
    const lat = lat1 + (lat2 - lat1) * factor;
    const lng = lng1 + (lng2 - lng1) * factor;
    coordinates.push([lat, lng]);
  }

  return {
    distanceKm: Math.max(1.0, fallbackDistance),
    durationMinutes: fallbackDuration,
    coordinates,
    source: 'fallback',
  };
}

// Reverse geocoding helper (OpenStreetMap Nominatim)
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SuruhID-App/1.0' },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.display_name) {
        // Shorten long addresses
        const parts = data.display_name.split(', ');
        return parts.slice(0, 3).join(', ');
      }
    }
  } catch (err) {
    // Ignore error and return coordinates
  }

  return `Titik Lokasi (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
