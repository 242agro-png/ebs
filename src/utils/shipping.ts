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
  officialFlyer: '/assets/aistudio/f09a43c9147642ad9a03bad9d68b8d08_5b85f8d8.jpg',
};

export interface AgencyContact {
  id: 'france' | 'pointe-noire' | 'brazzaville';
  countryLabel: string;
  cityTitle: string;
  address: string;
  reference?: string;
  hours?: string;
  phones: { display: string; tel: string; whatsapp?: string }[];
}

export const OFFICIAL_AGENCIES: AgencyContact[] = [
  {
    id: 'france',
    countryLabel: 'France · Entrepôt Europe',
    cityTitle: 'Herblay (Île-de-France)',
    address: '201 Route de Pierrelaye, 95200 / 95220 Herblay',
    hours: 'Samedi & Dimanche : 10h30 - 17h30',
    phones: [
      {
        display: '+33 6 15 27 44 66',
        tel: '+33615274466',
        whatsapp: '33615274466',
      },
    ],
  },
  {
    id: 'pointe-noire',
    countryLabel: 'Congo-Brazzaville · Port',
    cityTitle: 'Pointe-Noire',
    address: "Avenue de l'Indépendance, entre l'arrêt de bus Maternité ou Le Willys",
    phones: [
      {
        display: '+242 06 905 91 06',
        tel: '+242069059106',
        whatsapp: '242069059106',
      },
      {
        display: '+242 05 658 03 54',
        tel: '+242056580354',
      },
    ],
  },
  {
    id: 'brazzaville',
    countryLabel: 'Congo-Brazzaville · Capitale',
    cityTitle: 'Brazzaville',
    address: '664 Rue Nganga Antoine (Makélékélé)',
    reference: 'Réf : La petite Boulangerie',
    phones: [
      {
        display: '+242 06 421 96 83',
        tel: '+242064219683',
        whatsapp: '242064219683',
      },
      {
        display: '+242 06 628 09 04',
        tel: '+242066280904',
      },
    ],
  },
];

export interface CartonPreset {
  id: string;
  label: string;
  dimensions: string;
  length: number;
  width: number;
  height: number;
  priceEur: number;
}

export const CARTON_PRESETS: CartonPreset[] = [
  { id: 'c60', label: '60×40×40 cm', dimensions: '60x40x40', length: 60, width: 40, height: 40, priceEur: 50 },
  { id: 'c70', label: '70×50×50 cm', dimensions: '70x50x50', length: 70, width: 50, height: 50, priceEur: 100 },
  { id: 'c80', label: '80×50×50 cm', dimensions: '80x50x50', length: 80, width: 50, height: 50, priceEur: 150 },
  { id: 'c101', label: '101×54×54 cm', dimensions: '101x54x54', length: 101, width: 54, height: 54, priceEur: 250 },
];

export type TariffCategory = 'cartons' | 'electromenager' | 'contenants';

export interface TariffItem {
  id: string;
  category: TariffCategory;
  name: string;
  spec: string;
  priceLabel: string;
  pricePrefix?: string;
  unitCalculator?: 'cm' | 'litre';
  unitRate?: number;
  defaultUnits?: number;
}

export const OFFICIAL_TARIFFS: TariffItem[] = [
  { id: 'carton-60', category: 'cartons', name: 'Carton 60×40×40', spec: 'Format standard (60 × 40 × 40 cm)', priceLabel: '50€' },
  { id: 'carton-70', category: 'cartons', name: 'Carton 70×50×50', spec: 'Format moyen (70 × 50 × 50 cm)', priceLabel: '100€' },
  { id: 'carton-80', category: 'cartons', name: 'Carton 80×50×50', spec: 'Grand format (80 × 50 × 50 cm)', priceLabel: '150€' },
  { id: 'carton-101', category: 'cartons', name: 'Carton 101×54×54', spec: 'Très grand format (101 × 54 × 54 cm)', priceLabel: '250€' },
  { id: 'gaziniere', category: 'electromenager', name: 'Gazinière', spec: 'Cuisinière gaz / mixte protégée', pricePrefix: 'À partir de', priceLabel: '200€' },
  { id: 'machine-laver', category: 'electromenager', name: 'Machine à laver', spec: 'Lave-linge hublot ou top', pricePrefix: 'À partir de', priceLabel: '200€' },
  { id: 'refrigerateur', category: 'electromenager', name: 'Réfrigérateur', spec: 'Modèle standard simple ou double porte', pricePrefix: 'À partir de', priceLabel: '300€' },
  { id: 'refrigerateur-usa', category: 'electromenager', name: 'Réfrigérateur USA', spec: 'Frigo américain double battant', pricePrefix: 'À partir de', priceLabel: '450€' },
  { id: 'congelateur-coffre', category: 'electromenager', name: 'Congélateur coffre', spec: 'Bahut / coffre toutes capacités', pricePrefix: 'À partir de', priceLabel: '200€' },
  { id: 'micro-ondes', category: 'electromenager', name: 'Micro-ondes', spec: 'Four micro-ondes emballé', pricePrefix: 'À partir de', priceLabel: '30€' },
  {
    id: 'television',
    category: 'electromenager',
    name: 'Télévision',
    spec: 'Tarif calculé selon la diagonale en cm',
    priceLabel: '1,50€ / cm',
    unitCalculator: 'cm',
    unitRate: 1.5,
    defaultUnits: 100,
  },
  {
    id: 'barrique',
    category: 'contenants',
    name: 'Barrique',
    spec: 'Fût bleu étanche · selon contenance',
    priceLabel: '1,00€ / litre',
    unitCalculator: 'litre',
    unitRate: 1,
    defaultUnits: 120,
  },
  {
    id: 'cantine',
    category: 'contenants',
    name: 'Cantine métallique',
    spec: 'Malle / cantine bleue sécurisée',
    priceLabel: '1,00€ / litre',
    unitCalculator: 'litre',
    unitRate: 1,
    defaultUnits: 100,
  },
  { id: 'valise-30', category: 'contenants', name: 'Valise 30 kg', spec: 'Bagage jusqu’à 30 kg', priceLabel: '50€' },
  { id: 'valise-50', category: 'contenants', name: 'Valise 50 kg', spec: 'Grand bagage jusqu’à 50 kg', priceLabel: '80€' },
];

export function createDefaultParcel(id: number): ParcelInput {
  return {
    id,
    length: 60,
    width: 40,
    height: 40,
    weight: 25,
  };
}

function getStandardCartonPrice(l: number, w: number, h: number): number | null {
  const sorted = [Math.round(l), Math.round(w), Math.round(h)].sort((a, b) => b - a);
  if (sorted[0] === 60 && sorted[1] === 40 && sorted[2] === 40) return 50;
  if (sorted[0] === 70 && sorted[1] === 50 && sorted[2] === 50) return 100;
  if (sorted[0] === 80 && sorted[1] === 50 && sorted[2] === 50) return 150;
  if (sorted[0] === 101 && sorted[1] === 54 && sorted[2] === 54) return 250;
  return null;
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

    // Official carton tiers from EBS flyer: 60x40x40=50€, 70x50x50=100€, 80x50x50=150€, 101x54x54=250€
    const presetPrice = getStandardCartonPrice(l, w, h);
    const rawVolumePrice = volumeM3 * 650;
    const volumePrice =
      presetPrice !== null ? presetPrice : Math.max(50, Math.round(rawVolumePrice * 100) / 100);

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
      estimatedDelay: '45 jours (1 départ tous les 30 jours — Port du Havre)',
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
