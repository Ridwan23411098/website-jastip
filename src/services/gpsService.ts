import { Order } from '../types';
import { updateOrderStatus, getOrders, saveOrders } from './storageService';

// Active GPS watch id
let activeWatchId: number | null = null;
let simulationIntervalId: any = null;
let activeSimCourierId: string | null = null;

/**
 * Calculate bearing angle in degrees between two GPS points
 * (used to rotate the courier motorcycle icon on the map)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Check if simulation is currently running
 */
export function isSimulationActive(): boolean {
  return simulationIntervalId !== null;
}

/**
 * Start real device GPS watching for courier
 */
export function startRealGpsBroadcast(
  courierId: string,
  targetOrderId?: string,
  onPositionUpdate?: (coords: [number, number], heading?: number) => void,
  onError?: (error: GeolocationPositionError) => void
): boolean {
  if (!('geolocation' in navigator)) {
    return false;
  }

  stopGpsBroadcast();

  activeWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const heading = pos.coords.heading || undefined;

      updateCourierPositionInOrders(courierId, [lat, lng], heading);
      if (onPositionUpdate) onPositionUpdate([lat, lng], heading);
    },
    (err) => {
      console.warn('GPS watch error:', err.message);
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 10000,
    }
  );

  return true;
}

/**
 * Stop GPS broadcast
 */
export function stopGpsBroadcast(courierId?: string): void {
  if (activeWatchId !== null && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(activeWatchId);
    activeWatchId = null;
  }
}

/**
 * Stop courier trip simulation
 */
export function stopCourierTripSimulation(courierId?: string): void {
  if (simulationIntervalId) {
    clearInterval(simulationIntervalId);
    simulationIntervalId = null;
    activeSimCourierId = null;
  }
}

/**
 * Update active orders assigned to this courier with latest GPS coordinate
 */
export function updateCourierPositionInOrders(
  courierId: string,
  coords: [number, number],
  heading?: number
): void {
  const orders = getOrders();
  let changed = false;

  const updatedOrders = orders.map((ord) => {
    if (
      ord.courierId === courierId &&
      (ord.status === 'Menuju Lokasi' ||
        ord.status === 'Barang Diambil' ||
        ord.status === 'Dalam Perjalanan')
    ) {
      changed = true;
      return {
        ...ord,
        courierCoords: coords,
        courierHeading: heading,
        courierSpeedKmh: Math.floor(25 + Math.random() * 15),
        updatedAt: new Date().toISOString(),
      };
    }
    return ord;
  });

  if (changed) {
    saveOrders(updatedOrders);
  }
}

/**
 * Run realistic step-by-step trip simulation along road waypoints
 * (ideal for live testing and demonstration on desktop or laptop)
 */
export function startCourierTripSimulation(
  order: Order,
  courierId?: string,
  onStep?: (currentCoords: [number, number], heading: number, progressPct: number) => void,
  onComplete?: () => void
): () => void {
  stopCourierTripSimulation();
  const cId = courierId || order.courierId || 'courier-1';
  activeSimCourierId = cId;

  // Route path waypoints
  const waypoints = order.roadPolyline && order.roadPolyline.length > 2
    ? order.roadPolyline
    : [
        [order.pickupLat, order.pickupLng] as [number, number],
        [
          (order.pickupLat + order.destinationLat) / 2 + 0.002,
          (order.pickupLng + order.destinationLng) / 2 - 0.002,
        ] as [number, number],
        [order.destinationLat, order.destinationLng] as [number, number],
      ];

  let currentIndex = 0;
  const total = waypoints.length;

  simulationIntervalId = setInterval(() => {
    if (currentIndex >= total - 1) {
      clearInterval(simulationIntervalId);
      simulationIntervalId = null;
      activeSimCourierId = null;
      updateCourierPositionInOrders(cId, waypoints[total - 1], 0);
      if (onComplete) onComplete();
      return;
    }

    const current = waypoints[currentIndex];
    const next = waypoints[currentIndex + 1];
    const heading = calculateBearing(current[0], current[1], next[0], next[1]);
    const progress = Math.round(((currentIndex + 1) / total) * 100);

    updateCourierPositionInOrders(cId, current, heading);
    if (onStep) onStep(current, heading, progress);

    currentIndex++;
  }, 1400);

  return () => {
    stopCourierTripSimulation();
  };
}
