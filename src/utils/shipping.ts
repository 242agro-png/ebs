export type ShippingMode = 'maritime' | 'air';
export type DestinationCity = 'Pointe-Noire' | 'Brazzaville';
export type CongoDeliveryOption = 'agency' | 'home';
export type FrancePickupOption = 'herblay' | 'pickup';

export interface ParcelInput {
  id: number;
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface ParcelBreakdown {
  id: number;
  volumeM3: number;
  volumePrice: number;
  weightSurcharge: number;
  parcelTotal: number;
}

export interface SimulationResult {
  mode: ShippingMode;
  destination: DestinationCity;
  parcelCount: number;
  totalWeight: number;
  billableWeight: number;
  totalVolumeM3: number;
  parcelBreakdowns: ParcelBreakdown[];
  freightSubtotal: number;
  groupDiscountApplied: boolean;
  groupDiscountAmount: number;
  congoDeliverySupplement: number;
  estimatedTotal: number;
  averagePerParcel: number;
  estimatedDelay: string;
}

export const WHATSAPP_NUMBER = '33615274466';
export const WHATSAPP_DISPLAY = '+33 6 15 27 44 66';
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/BANDZOUZI/';

export const IMAGES = {
  heroContainer: '/src/assets/images/hero_container_african_team_1795051215271.jpg',
  heroCargoShip: '/src/assets/images/hero_cargo_ship_1795051215243.jpg',
  heroCargoPlane: '/src/assets/images/hero_cargo_plane_1795051215573.jpg',
  warehouseHerblay: '/assets/aistudio/unnamed__2__7998f231.webp',
  securitySeal: '/src/assets/images/container_security_seal_1795037360805.jpg',
  airCargo: '/src/assets/images/air_freight_cargo_1795037361047.jpg',
  depotContainerPark: '/assets/aistudio/unnamed__3__9d09a43d.webp',
  craneLoading: '/assets/aistudio/unnamed__1__7a181fd5.webp',
  containerChassis: '/assets/aistudio/unnamed_e5d3c17f.webp',
  depotEntrance: '/assets/aistudio/unnamed__6__4f3f90a7.webp',
};

export function createDefaultParcel(id: number): ParcelInput {
  return {
    id,
    length: 60,
    width: 40,
    height: 40,
    weight: 25,
  };
}

export function calculateSimulation(
  mode: ShippingMode,
  destination: DestinationCity,
  parcels: ParcelInput[],
  congoDelivery: CongoDeliveryOption
): SimulationResult {
  const parcelCount = parcels.length;
  const safeNumber = (n: number, min = 1) => (Number.isFinite(n) && n > 0 ? n : min);

  let totalWeight = 0;
  let totalVolumeM3 = 0;

  const parcelBreakdowns: ParcelBreakdown[] = parcels.map((parcel) => {
    const l = safeNumber(parcel.length, 1);
    const w = safeNumber(parcel.width, 1);
    const h = safeNumber(parcel.height, 1);
    const weight = safeNumber(parcel.weight, 1);

    const volumeM3 = (l * w * h) / 1_000_000;
    totalWeight += weight;
    totalVolumeM3 += volumeM3;

    // Maritime formula: standard 60x40x40 = 80 EUR; larger = volume * 650 EUR, min 80 EUR
    const rawVolumePrice = volumeM3 * 650;
    const volumePrice = Math.max(80, Math.round(rawVolumePrice * 100) / 100);

    // Weight > 100kg per carton: +30 EUR per bracket of 20kg above 100kg
    const weightSurcharge =
      weight > 100 ? Math.ceil((weight - 100) / 20) * 30 : 0;

    const parcelTotal = volumePrice + weightSurcharge;

    return {
      id: parcel.id,
      volumeM3,
      volumePrice,
      weightSurcharge,
      parcelTotal,
    };
  });

  if (mode === 'maritime') {
    const freightSubtotal = parcelBreakdowns.reduce((acc, p) => acc + p.parcelTotal, 0);
    const groupDiscountApplied = parcelCount >= 10;
    const groupDiscountAmount = groupDiscountApplied
      ? Math.round(freightSubtotal * 0.2 * 100) / 100
      : 0;
    const congoDeliverySupplement = congoDelivery === 'home' ? parcelCount * 25 : 0;
    const estimatedTotal =
      Math.round((freightSubtotal - groupDiscountAmount + congoDeliverySupplement) * 100) / 100;
    const averagePerParcel =
      parcelCount > 0 ? Math.round((estimatedTotal / parcelCount) * 100) / 100 : 0;

    return {
      mode,
      destination,
      parcelCount,
      totalWeight,
      billableWeight: totalWeight,
      totalVolumeM3,
      parcelBreakdowns,
      freightSubtotal,
      groupDiscountApplied,
      groupDiscountAmount,
      congoDeliverySupplement,
      estimatedTotal,
      averagePerParcel,
      estimatedDelay: '4 à 6 semaines (départ Port du Havre)',
    };
  }

  // Aérien - Express: 12 EUR / kg, minimum 5 kg billed
  const billableWeight = Math.max(5, totalWeight);
  const freightSubtotal = Math.round(billableWeight * 12 * 100) / 100;
  const congoDeliverySupplement = congoDelivery === 'home' ? parcelCount * 25 : 0;
  const estimatedTotal = Math.round((freightSubtotal + congoDeliverySupplement) * 100) / 100;
  const averagePerParcel =
    parcelCount > 0 ? Math.round((estimatedTotal / parcelCount) * 100) / 100 : 0;

  return {
    mode,
    destination,
    parcelCount,
    totalWeight,
    billableWeight,
    totalVolumeM3,
    parcelBreakdowns,
    freightSubtotal,
    groupDiscountApplied: false,
    groupDiscountAmount: 0,
    congoDeliverySupplement,
    estimatedTotal,
    averagePerParcel,
    estimatedDelay: 'Livraison sous 72h (départ chaque vendredi)',
  };
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function buildWhatsAppQuoteUrl(
  result: SimulationResult,
  parcels: ParcelInput[],
  congoDelivery: CongoDeliveryOption,
  francePickup: FrancePickupOption
): string {
  const modeLabel =
    result.mode === 'maritime' ? 'Fret Maritime - Groupage' : 'Fret Aérien - Express';
  const congoLabel =
    congoDelivery === 'agency'
      ? `Retrait à l'agence (${result.destination})`
      : `Livraison à domicile à ${result.destination} (+25€/colis)`;
  const franceLabel =
    francePickup === 'herblay'
      ? 'Dépôt à Herblay (201 Route de Pierrelaye, 95220)'
      : 'Collecte à domicile en France / Europe (à organiser)';

  const parcelLines = parcels
    .map(
      (p, idx) =>
        `  - Colis ${idx + 1} : ${p.length}x${p.width}x${p.height} cm | ${p.weight} kg`
    )
    .join('\n');

  const lines = [
    'Bonjour EBS FRET MARITIME,',
    'Je souhaite recevoir mon devis exact suite à ma simulation :',
    '',
    `• Type d'envoi : ${modeLabel}`,
    `• Destination : ${result.destination}`,
    `• Nombre de colis : ${result.parcelCount}`,
    `• Option France : ${franceLabel}`,
    `• Option Congo : ${congoLabel}`,
    '',
    'Détail des colis :',
    parcelLines,
    '',
    result.mode === 'air'
      ? `• Poids total : ${result.totalWeight} kg (facturé ${result.billableWeight} kg min. 5 kg)`
      : `• Volume total estimé : ${result.totalVolumeM3.toFixed(3)} m3 | Poids total : ${result.totalWeight} kg`,
    result.groupDiscountApplied
      ? `• Offre groupée (-20% pour 10+ colis) : -${formatEuro(result.groupDiscountAmount)}`
      : '',
    `• Prix estimé total : ${formatEuro(result.estimatedTotal)}`,
    `• Prix moyen par colis : ${formatEuro(result.averagePerParcel)}`,
    '',
    'Merci de me confirmer le tarif final et la procédure.',
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildSimpleWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
