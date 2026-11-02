import { FeeItem, PricingConfig, ZoneTariff } from '../types';

export interface CalculationResult {
  distanceKm: number;
  estimatedMinutes: number;
  baseFare: number;
  extraFees: FeeItem[];
  subtotal: number;
  roundedTotal: number;
  methodUsed: 'zone' | 'distance';
  zoneMatched?: ZoneTariff;
  breakdown: string[];
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount).replace('Rp', 'Rp ');
}

export function roundToNearest(val: number, rounding: number): number {
  if (!rounding || rounding <= 1) return Math.round(val);
  return Math.ceil(val / rounding) * rounding;
}

export function calculateFare(
  distanceKm: number,
  originKecamatan: string,
  destinationKecamatan: string,
  config: PricingConfig,
  zones: ZoneTariff[],
  extraFeeSelections: { isNight?: boolean; hasWaiting?: boolean; isHeavy?: boolean; customFee?: number } = {}
): CalculationResult {
  const breakdown: string[] = [];
  let baseFare = 0;
  let estimatedMinutes = Math.max(10, Math.round(distanceKm * 2.8 + 5)); // average local motorcycle speed ~25 km/h + 5 min buffer
  let methodUsed: 'zone' | 'distance' = 'distance';
  let zoneMatched: ZoneTariff | undefined;

  // 1. Check Zone priority if enabled and kecamatans are selected
  if (config.enableZones && originKecamatan && destinationKecamatan) {
    const directMatch = zones.find(
      (z) =>
        (z.originKecamatan.toLowerCase() === originKecamatan.toLowerCase() &&
          z.destinationKecamatan.toLowerCase() === destinationKecamatan.toLowerCase()) ||
        (z.originKecamatan.toLowerCase() === destinationKecamatan.toLowerCase() &&
          z.destinationKecamatan.toLowerCase() === originKecamatan.toLowerCase())
    );

    if (directMatch) {
      baseFare = directMatch.fixedPrice;
      estimatedMinutes = directMatch.estimatedMinutes || estimatedMinutes;
      methodUsed = 'zone';
      zoneMatched = directMatch;
      breakdown.push(`Tarif Khusus Zona: ${directMatch.zoneName} (${formatRupiah(directMatch.fixedPrice)})`);
    } else if (originKecamatan.toLowerCase() === destinationKecamatan.toLowerCase()) {
      // Intra-kecamatan default zone
      const intraZone = zones.find((z) => z.category === 'Dalam Kecamatan');
      if (intraZone) {
        baseFare = intraZone.fixedPrice;
        methodUsed = 'zone';
        zoneMatched = intraZone;
        breakdown.push(`Tarif Dalam Kecamatan (${formatRupiah(intraZone.fixedPrice)})`);
      }
    }
  }

  // 2. Fallback to Distance-based calculation if no zone matched
  if (baseFare === 0) {
    methodUsed = 'distance';
    // Formula from prompt: Tarif Minimum + (Jarak × Tarif per KM)
    const distanceCost = Math.round(distanceKm * config.pricePerKm);
    baseFare = config.minimumPrice + distanceCost;
    breakdown.push(`Tarif Minimum: ${formatRupiah(config.minimumPrice)}`);
    breakdown.push(`Jarak ${distanceKm.toFixed(1)} KM × ${formatRupiah(config.pricePerKm)}: ${formatRupiah(distanceCost)}`);
  }

  // 3. Additional Fees
  const extraFees: FeeItem[] = [];

  if (extraFeeSelections.isNight) {
    extraFees.push({
      id: 'night',
      name: 'Biaya Malam (20:00 - 06:00)',
      amount: config.nightFee,
      description: 'Tambahan insentif pengantaran malam hari',
    });
    breakdown.push(`+ Biaya Malam: ${formatRupiah(config.nightFee)}`);
  }

  if (extraFeeSelections.hasWaiting) {
    extraFees.push({
      id: 'waiting',
      name: 'Biaya Antre / Tunggu (>15 Mnt)',
      amount: config.waitingFee,
      description: 'Layanan menunggu antrean pesanan/toko',
    });
    breakdown.push(`+ Biaya Tunggu: ${formatRupiah(config.waitingFee)}`);
  }

  if (extraFeeSelections.isHeavy) {
    extraFees.push({
      id: 'heavy',
      name: 'Barang Besar / Muatan Berat (>10 Kg)',
      amount: config.heavyItemFee,
      description: 'Kebutuhan bagasi atau tas kurir ekstra',
    });
    breakdown.push(`+ Biaya Muatan Ekstra: ${formatRupiah(config.heavyItemFee)}`);
  }

  if (extraFeeSelections.customFee && extraFeeSelections.customFee > 0) {
    extraFees.push({
      id: 'custom',
      name: 'Biaya Khusus Tambahan',
      amount: extraFeeSelections.customFee,
    });
    breakdown.push(`+ Biaya Tambahan: ${formatRupiah(extraFeeSelections.customFee)}`);
  }

  const extraTotal = extraFees.reduce((acc, curr) => acc + curr.amount, 0);
  const subtotal = baseFare + extraTotal;
  const roundedTotal = roundToNearest(subtotal, config.rounding);

  if (roundedTotal !== subtotal) {
    breakdown.push(`Pembulatan (kelipatan ${formatRupiah(config.rounding)}): ${formatRupiah(roundedTotal)}`);
  }

  return {
    distanceKm: Number(distanceKm.toFixed(1)),
    estimatedMinutes,
    baseFare,
    extraFees,
    subtotal,
    roundedTotal,
    methodUsed,
    zoneMatched,
    breakdown,
  };
}
