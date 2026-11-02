export type ServiceType =
  | 'Pesanin Makanan/Minuman'
  | 'Ambil / Antar Barang'
  | 'Jemput / Antar Orang'
  | 'Ambil / Antar Hewan Peliharaan'
  | 'Delivery'
  | 'Order (Titip Belanja)'
  | 'Dan lain-lain'
  | 'Jasa Titip'
  | 'Jasa Suruh';

export type OrderStatus =
  | 'Menunggu Kurir'
  | 'Kurir Ditugaskan'
  | 'Menuju Lokasi'
  | 'Barang Diambil'
  | 'Dalam Perjalanan'
  | 'Selesai'
  | 'Dibatalkan';

export type UserRole = 'customer' | 'admin' | 'courier';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderCode: string; // e.g. AA-2026-001
  customerId?: string;
  customerName: string;
  phone: string;
  serviceType: ServiceType;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  roadPolyline?: [number, number][]; // Real road waypoints from OSRM
  distance: number; // in KM (actual road distance)
  estimatedMinutes?: number; // ETA
  baseFee: number;
  perKmFee: number;
  serviceFee: number;
  goodsPrice?: number;
  totalPrice: number;
  requestDetail: string;
  note?: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierCoords?: [number, number];
  courierHeading?: number;
  courierSpeedKmh?: number;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  pickupPhoto?: string;
  pickupPhotoTime?: string;
  pickupPhotoNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  status: 'Tersedia' | 'Sibuk' | 'Offline';
  rating: number;
  completedCount: number;
  lat: number;
  lng: number;
  heading?: number;
  isGpsLive?: boolean;
  lastGpsUpdate?: string;
}

export interface TariffConfig {
  jasaTitipBase: number;  // Rp 5.000
  jasaTitipPerKm: number; // Rp 3.000
  jasaSuruhBase: number;  // Rp 4.000
  jasaSuruhPerKm: number; // Rp 2.500
  minimumFee: number;     // Rp 10.000
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export type AuthUser = User;

export interface RouteCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  waypoints: [number, number][];
  isRealRoad: boolean;
  summary?: string;
}
