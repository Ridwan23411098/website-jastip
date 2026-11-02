import {
  Order,
  Courier,
  TariffConfig,
  UserRole,
  OrderStatus,
  ServiceType,
  StatusHistoryItem
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_COURIERS,
  INITIAL_TARIFF_CONFIG
} from '../data/initialData';

const STORAGE_KEYS = {
  ORDERS: 'masjastip_orders_v1',
  COURIERS: 'masjastip_couriers_v1',
  TARIFF: 'masjastip_tariff_v1',
  ROLE: 'masjastip_active_role_v1',
};

// Reactive subscription listeners
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySubscribers() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error('Store subscriber notification error:', e);
    }
  });
}

// 1. ORDERS
export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse orders:', e);
  }

  // Initialize with initial orders
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  return INITIAL_ORDERS;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  notifySubscribers();
}

export function createOrder(
  orderData: Omit<Order, 'id' | 'orderCode' | 'createdAt' | 'updatedAt' | 'status' | 'statusHistory'>
): Order {
  const current = getOrders();
  const year = new Date().getFullYear();
  const count = current.length + 1;
  const orderCode = `MJ-${year}-${String(count).padStart(3, '0')}`;
  const nowIso = new Date().toISOString();

  const initialHistory: StatusHistoryItem = {
    status: 'Menunggu Kurir',
    timestamp: nowIso,
    note: 'Pesanan berhasil dibuat oleh pelanggan dan menunggu penugasan kurir.',
    updatedBy: orderData.customerName,
  };

  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderCode,
    status: 'Menunggu Kurir',
    statusHistory: [initialHistory],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  saveOrders([newOrder, ...current]);
  return newOrder;
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  courierId?: string,
  note?: string
): Order | null {
  const orders = getOrders();
  const couriers = getCouriers();
  const index = orders.findIndex((o) => o.id === orderId || o.orderCode === orderId);

  if (index === -1) return null;

  const order = orders[index];
  const nowIso = new Date().toISOString();

  let courierInfo = {
    courierId: order.courierId,
    courierName: order.courierName,
    courierPhone: order.courierPhone,
  };

  if (courierId) {
    const courier = couriers.find((c) => c.id === courierId);
    if (courier) {
      courierInfo = {
        courierId: courier.id,
        courierName: courier.name,
        courierPhone: courier.phone,
      };
    }
  }

  const historyItem: StatusHistoryItem = {
    status,
    timestamp: nowIso,
    note: note || `Status diperbarui menjadi ${status}`,
    updatedBy: courierInfo.courierName || 'Admin AntarAja',
  };

  const updated: Order = {
    ...order,
    status,
    ...courierInfo,
    statusHistory: [historyItem, ...(order.statusHistory || [])],
    updatedAt: nowIso,
  };

  orders[index] = updated;
  saveOrders(orders);
  return updated;
}

export function assignCourier(orderId: string, courierId: string): Order | null {
  return updateOrderStatus(orderId, 'Kurir Ditugaskan', courierId, 'Kurir telah ditugaskan ke pesanan ini.');
}

export function findOrderByCode(code: string): Order | undefined {
  if (!code) return undefined;
  const trimmed = code.trim().toUpperCase();
  return getOrders().find((o) => o?.orderCode && o.orderCode.toUpperCase() === trimmed);
}

// 2. COURIERS
export function getCouriers(): Courier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COURIERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse couriers:', e);
  }
  localStorage.setItem(STORAGE_KEYS.COURIERS, JSON.stringify(INITIAL_COURIERS));
  return INITIAL_COURIERS;
}

export function saveCouriers(couriers: Courier[]): void {
  localStorage.setItem(STORAGE_KEYS.COURIERS, JSON.stringify(couriers));
  notifySubscribers();
}

export function updateCourierStatus(courierId: string, status: Courier['status'], isGpsLive?: boolean): void {
  const current = getCouriers().map((c) =>
    c.id === courierId
      ? {
          ...c,
          status,
          ...(isGpsLive !== undefined ? { isGpsLive } : {}),
          lastGpsUpdate: new Date().toISOString(),
        }
      : c
  );
  saveCouriers(current);
}

// 3. TARIFF CONFIG
export function getTariffConfig(): TariffConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TARIFF);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse tariff:', e);
  }
  localStorage.setItem(STORAGE_KEYS.TARIFF, JSON.stringify(INITIAL_TARIFF_CONFIG));
  return INITIAL_TARIFF_CONFIG;
}

export function saveTariffConfig(config: TariffConfig): void {
  localStorage.setItem(STORAGE_KEYS.TARIFF, JSON.stringify(config));
  notifySubscribers();
}

// 4. ACTIVE ROLE
export function getCurrentRole(): UserRole {
  try {
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (role === 'customer' || role === 'admin' || role === 'courier') {
      return role as UserRole;
    }
  } catch (e) {
    // fallback
  }
  return 'customer';
}

export function setCurrentRole(role: UserRole): void {
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
  notifySubscribers();
}

// 5. REAL FARE CALCULATION
export function calculateFare(
  serviceType: ServiceType,
  distanceKm: number,
  goodsPrice: number = 0
): {
  serviceFee: number;
  totalPrice: number;
  baseFee: number;
  perKmFee: number;
  minimumFee: number;
} {
  const config = getTariffConfig();
  const safeDistance = Math.max(0.5, Number(distanceKm) || 1);

  const isShoppingType =
    serviceType === 'Pesanin Makanan/Minuman' ||
    serviceType === 'Order (Titip Belanja)' ||
    serviceType === 'Jasa Titip';

  let baseFee = isShoppingType ? config.jasaTitipBase : config.jasaSuruhBase;
  let perKmFee = isShoppingType ? config.jasaTitipPerKm : config.jasaSuruhPerKm;

  // Formula: Biaya dasar + (Jarak x Tarif per KM)
  const rawFee = baseFee + safeDistance * perKmFee;
  // Apply minimum fee protection if configured
  const calculatedServiceFee = Math.max(config.minimumFee || 10000, rawFee);
  // Round to clean nearest Rp 500
  const roundedServiceFee = Math.ceil(calculatedServiceFee / 500) * 500;
  const safeGoodsPrice = Math.max(0, Number(goodsPrice) || 0);

  return {
    serviceFee: roundedServiceFee,
    totalPrice: roundedServiceFee + safeGoodsPrice,
    baseFee,
    perKmFee,
    minimumFee: config.minimumFee || 10000,
  };
}

// 6. FORMAT RUPIAH
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

// 7. RESET DEMO DATA
export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.COURIERS, JSON.stringify(INITIAL_COURIERS));
  localStorage.setItem(STORAGE_KEYS.TARIFF, JSON.stringify(INITIAL_TARIFF_CONFIG));
  localStorage.setItem(STORAGE_KEYS.ROLE, 'customer');
  notifySubscribers();
}
