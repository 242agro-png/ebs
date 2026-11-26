export type ShippingMode = 'maritime' | 'air';
export type DestinationCity = 'Pointe-Noire' | 'Brazzaville';
export type CongoDeliveryOption = 'agency' | 'home';
export type FrancePickupOption = 'herblay' | 'pickup';

export type MerchandiseCategory =
  | 'carton'
  | 'appliance'
  | 'tv'
  | 'container'
  | 'luggage'
  | 'custom';

export type ApplianceKind =
  | 'micro-ondes'
  | 'gaziniere'
  | 'machine-laver'
  | 'congelateur-coffre'
  | 'refrigerateur'
  | 'refrigerateur-usa';

export type ContainerKind = 'barrique' | 'cantine';
export type LuggageKind = 'valise-30' | 'valise-50';

export interface ApplianceOption {
  id: ApplianceKind;
  label: string;
  minPriceEur: number;
  estimatedWeightKg: number;
}

export const APPLIANCE_OPTIONS: ApplianceOption[] = [
  { id: 'micro-ondes', label: 'Micro-ondes', minPriceEur: 30, estimatedWeightKg: 15 },
  { id: 'gaziniere', label: 'Gazinière', minPriceEur: 200, estimatedWeightKg: 55 },
  { id: 'machine-laver', label: 'Machine à laver', minPriceEur: 200, estimatedWeightKg: 65 },
  { id: 'congelateur-coffre', label: 'Congélateur coffre', minPriceEur: 200, estimatedWeightKg: 60 },
  { id: 'refrigerateur', label: 'Réfrigérateur', minPriceEur: 300, estimatedWeightKg: 75 },
  { id: 'refrigerateur-usa', label: 'Réfrigérateur USA', minPriceEur: 450, estimatedWeightKg: 110 },
];

export const MERCHANDISE_CATEGORY_OPTIONS: { id: MerchandiseCategory; label: string }[] = [
  { id: 'carton', label: 'Carton' },
  { id: 'appliance', label: 'Électroménager' },
  { id: 'tv', label: 'Télévision (1,50€/cm)' },
  { id: 'container', label: 'Barrique / Cantine (1€/L)' },
  { id: 'luggage', label: 'Valise (30 ou 50 kg)' },
  { id: 'custom', label: 'Autre marchandise' },
];

export const AIR_MERCHANDISE_OPTIONS: string[] = [
  'Effets personnels / Vêtements',
  'Achats en ligne / Colis standard',
  'Électronique / Petit matériel',
  'Produits secs / Cosmétiques',
  'Documents / Colis urgent',
];

export interface ParcelInput {
  id: number;
  category: MerchandiseCategory;
  length: number;
  width: number;
  height: number;
  weight: number;
  applianceKind: ApplianceKind;
  tvCm: number;
  containerKind: ContainerKind;
  liters: number;
  luggageKind: LuggageKind;
  customLabel: string;
  airGoodsType: string;
}

export interface ParcelBreakdown {
  id: number;
  category: MerchandiseCategory;
  description: string;
  volumeM3: number;
  volumePrice: number;
  weightSurcharge: number;
  parcelTotal: number;
  isStartingFrom: boolean;
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
  hasStartingFromPrice: boolean;
  estimatedDelay: string;
}

export const WHATSAPP_NUMBER = '393271839426';
export const WHATSAPP_DISPLAY = '+39 327 183 9426';
export const PHONE_DISPLAY = '348 262 93 40';
export const PHONE_TEL = '+393482629340';
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
  italyFlyer: '/assets/aistudio/WhatsApp_Image_2026-11-22_at_17.41.13__2__f17616d4.jpeg',
};

export interface AgencyContact {
  id: 'france' | 'pointe-noire' | 'brazzaville';
  countryLabel: string;
  cityTitle: string;
  address: string;
  reference?: string;
  hours?: string;
}

export const OFFICIAL_AGENCIES: AgencyContact[] = [
  {
    id: 'france',
    countryLabel: 'France · Entrepôt Europe',
    cityTitle: 'Herblay (Île-de-France)',
    address: '201 Route de Pierrelaye, 95200 / 95220 Herblay',
    hours: 'Samedi & Dimanche : 10h30 - 17h30',
  },
  {
    id: 'pointe-noire',
    countryLabel: 'Congo-Brazzaville · Port',
    cityTitle: 'Pointe-Noire',
    address: "Avenue de l'Indépendance, entre l'arrêt de bus Maternité ou Le Willys",
  },
  {
    id: 'brazzaville',
    countryLabel: 'Congo-Brazzaville · Capitale',
    cityTitle: 'Brazzaville',
    address: '664 Rue Nganga Antoine (Makélékélé)',
    reference: 'Réf : La petite Boulangerie',
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
    category: 'carton',
    length: 60,
    width: 40,
    height: 40,
    weight: 25,
    applianceKind: 'refrigerateur',
    tvCm: 100,
    containerKind: 'barrique',
    liters: 120,
    luggageKind: 'valise-30',
    customLabel: '',
    airGoodsType: AIR_MERCHANDISE_OPTIONS[0],
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

  if (mode === 'maritime') {
    const parcelBreakdowns: ParcelBreakdown[] = parcels.map((parcel) => {
      const l = safeNumber(parcel.length, 1);
      const w = safeNumber(parcel.width, 1);
      const h = safeNumber(parcel.height, 1);
      const weight = safeNumber(parcel.weight, 1);

      if (parcel.category === 'appliance') {
        const option =
          APPLIANCE_OPTIONS.find((item) => item.id === parcel.applianceKind) ?? APPLIANCE_OPTIONS[4];
        totalWeight += option.estimatedWeightKg;
        return {
          id: parcel.id,
          category: 'appliance',
          description: `${option.label} (à partir de ${option.minPriceEur}€)`,
          volumeM3: 0,
          volumePrice: option.minPriceEur,
          weightSurcharge: 0,
          parcelTotal: option.minPriceEur,
          isStartingFrom: true,
        };
      }

      if (parcel.category === 'tv') {
        const cm = safeNumber(parcel.tvCm, 1);
        const price = Math.round(cm * 1.5 * 100) / 100;
        totalWeight += Math.max(8, Math.round(cm * 0.2));
        return {
          id: parcel.id,
          category: 'tv',
          description: `Télévision ${cm} cm (1,50€/cm)`,
          volumeM3: 0,
          volumePrice: price,
          weightSurcharge: 0,
          parcelTotal: price,
          isStartingFrom: false,
        };
      }

      if (parcel.category === 'container') {
        const liters = safeNumber(parcel.liters, 1);
        const price = Math.round(liters * 1 * 100) / 100;
        const containerName = parcel.containerKind === 'cantine' ? 'Cantine métallique' : 'Barrique';
        totalWeight += Math.max(15, Math.round(liters * 0.45));
        return {
          id: parcel.id,
          category: 'container',
          description: `${containerName} ${liters} L (1,00€/L)`,
          volumeM3: Math.round((liters / 1000) * 1000) / 1000,
          volumePrice: price,
          weightSurcharge: 0,
          parcelTotal: price,
          isStartingFrom: false,
        };
      }

      if (parcel.category === 'luggage') {
        const is50 = parcel.luggageKind === 'valise-50';
        const price = is50 ? 80 : 50;
        totalWeight += is50 ? 50 : 30;
        return {
          id: parcel.id,
          category: 'luggage',
          description: is50 ? 'Valise 50 kg' : 'Valise 30 kg',
          volumeM3: 0,
          volumePrice: price,
          weightSurcharge: 0,
          parcelTotal: price,
          isStartingFrom: false,
        };
      }

      const volumeM3 = (l * w * h) / 1_000_000;
      totalWeight += weight;
      totalVolumeM3 += volumeM3;

      const presetPrice =
        parcel.category === 'carton' ? getStandardCartonPrice(l, w, h) : null;
      const rawVolumePrice = volumeM3 * 650;
      const volumePrice =
        presetPrice !== null ? presetPrice : Math.max(50, Math.round(rawVolumePrice * 100) / 100);

      // Weight > 100kg per parcel: +30 EUR per bracket of 20kg above 100kg
      const weightSurcharge =
        weight > 100 ? Math.ceil((weight - 100) / 20) * 30 : 0;

      const parcelTotal = volumePrice + weightSurcharge;
      const itemLabel =
        parcel.category === 'custom'
          ? parcel.customLabel.trim() || 'Autre marchandise'
          : 'Carton';

      return {
        id: parcel.id,
        category: parcel.category,
        description: `${itemLabel} ${l}×${w}×${h} cm (${weight} kg)`,
        volumeM3,
        volumePrice,
        weightSurcharge,
        parcelTotal,
        isStartingFrom: false,
      };
    });

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
    const hasStartingFromPrice = parcelBreakdowns.some((p) => p.isStartingFrom);

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
      hasStartingFromPrice,
      estimatedDelay: '45 jours (1 départ tous les 30 jours — Port du Havre)',
    };
  }

  // Aérien - Express: 12 EUR / kg, minimum 5 kg billed
  const parcelBreakdowns: ParcelBreakdown[] = parcels.map((parcel) => {
    const l = safeNumber(parcel.length, 1);
    const w = safeNumber(parcel.width, 1);
    const h = safeNumber(parcel.height, 1);
    const weight = safeNumber(parcel.weight, 1);
    const volumeM3 = (l * w * h) / 1_000_000;
    totalWeight += weight;
    totalVolumeM3 += volumeM3;
    const parcelTotal = Math.round(weight * 12 * 100) / 100;

    return {
      id: parcel.id,
      category: parcel.category,
      description: `${parcel.airGoodsType || AIR_MERCHANDISE_OPTIONS[0]} (${weight} kg · ${l}×${w}×${h} cm)`,
      volumeM3,
      volumePrice: parcelTotal,
      weightSurcharge: 0,
      parcelTotal,
      isStartingFrom: false,
    };
  });

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
    hasStartingFromPrice: false,
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
  _parcels: ParcelInput[],
  congoDelivery: CongoDeliveryOption,
  francePickup: FrancePickupOption
): string {
  const modeLabel =
    result.mode === 'maritime' ? 'Fret Maritime - Groupage' : 'Fret Aérien - Express';
  const congoLabel =
    congoDelivery === 'agency'
      ? `Retrait à l'agence (${result.destination})`
      : `Livraison à domicile à ${result.destination} (+25€/article)`;
  const franceLabel =
    francePickup === 'herblay'
      ? 'Dépôt à Herblay (201 Route de Pierrelaye, 95220)'
      : 'Collecte à domicile en France / Europe (à organiser)';

  const parcelLines = result.parcelBreakdowns
    .map(
      (b, idx) =>
        `  - Article ${idx + 1} : ${b.description} → ${formatEuro(b.parcelTotal)}`
    )
    .join('\n');

  const lines = [
    'Bonjour EBS FRET MARITIME,',
    'Je souhaite recevoir mon devis exact suite à ma simulation :',
    '',
    `• Type d'envoi : ${modeLabel}`,
    `• Destination : ${result.destination}`,
    `• Nombre d'articles / colis : ${result.parcelCount}`,
    `• Option France : ${franceLabel}`,
    `• Option Congo : ${congoLabel}`,
    '',
    'Détail des marchandises :',
    parcelLines,
    '',
    result.mode === 'air'
      ? `• Poids total : ${result.totalWeight} kg (facturé ${result.billableWeight} kg min. 5 kg)`
      : `• Poids total estimé : ${result.totalWeight} kg${result.totalVolumeM3 > 0 ? ` | Volume cartons/colis : ${result.totalVolumeM3.toFixed(3)} m³` : ''}`,
    result.groupDiscountApplied
      ? `• Offre groupée (-20% pour 10+ articles) : -${formatEuro(result.groupDiscountAmount)}`
      : '',
    `• Prix estimé total : ${result.hasStartingFromPrice ? 'À partir de ' : ''}${formatEuro(result.estimatedTotal)}`,
    `• Prix moyen par article : ${formatEuro(result.averagePerParcel)}`,
    '',
    'Merci de me confirmer le tarif final et la procédure.',
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildSimpleWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
