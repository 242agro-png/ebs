import { useState } from 'react';
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  Flame,
  Luggage,
  MapPin,
  MessageCircle,
  Microwave,
  Package,
  Phone,
  Refrigerator,
  ShieldCheck,
  Ship,
  Snowflake,
  Tv,
  Waves,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  IMAGES,
  OFFICIAL_AGENCIES,
  OFFICIAL_TARIFFS,
  TariffCategory,
  TariffItem,
  buildSimpleWhatsAppUrl,
  formatEuro,
} from '../utils/shipping';
import { trackEvent } from '../lib/analytics';

type FilterTab = 'all' | TariffCategory;

const TARIFF_ICONS: Record<string, typeof Package> = {
  'carton-60': Package,
  'carton-70': Package,
  'carton-80': Package,
  'carton-101': Package,
  gaziniere: Flame,
  'machine-laver': Waves,
  refrigerateur: Refrigerator,
  'refrigerateur-usa': Refrigerator,
  'congelateur-coffre': Snowflake,
  'micro-ondes': Microwave,
  television: Tv,
  barrique: Archive,
  cantine: Archive,
  'valise-30': Luggage,
  'valise-50': Luggage,
};

const GUARANTEE_BADGES = [
  { icon: Ship, label: 'Fret maritime sécurisé' },
  { icon: Package, label: 'Emballage renforcé' },
  { icon: CalendarClock, label: 'Départ tous les 30 jours' },
  { icon: ShieldCheck, label: 'Livraison sécurisée' },
];

export function TariffsAndContactsSection() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [flyerModalOpen, setFlyerModalOpen] = useState(false);
  const [unitValues, setUnitValues] = useState<Record<string, number>>({
    television: 100,
    barrique: 120,
    cantine: 100,
  });

  const visibleItems =
    activeTab === 'all'
      ? OFFICIAL_TARIFFS
      : OFFICIAL_TARIFFS.filter((item) => item.category === activeTab);

  const getItemWhatsAppUrl = (item: TariffItem) => {
    if (item.unitCalculator && item.unitRate) {
      const qty = unitValues[item.id] ?? item.defaultUnits ?? 100;
      const estimated = Math.round(qty * item.unitRate * 100) / 100;
      const unitWord = item.unitCalculator === 'cm' ? 'cm' : 'litres';
      return buildSimpleWhatsAppUrl(
        `Bonjour EBS FRET MARITIME, je souhaite expédier : ${item.name} (${qty} ${unitWord} — estimation ${formatEuro(estimated)} au tarif de ${item.priceLabel}) vers le Congo.`
      );
    }
    const priceText = item.pricePrefix
      ? `${item.pricePrefix} ${item.priceLabel}`
      : item.priceLabel;
    return buildSimpleWhatsAppUrl(
      `Bonjour EBS FRET MARITIME, je souhaite expédier : ${item.name} (${priceText}) de la France vers le Congo.`
    );
  };

  return (
    <section
      id="tarifs"
      className="bg-[#F8FAFC] py-14 sm:py-18 border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* En-tête officiel de la plaquette */}
        <div className="bg-[#0A1F44] text-white rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FFC400]">
              France / Congo-Brazzaville · Grille tarifaire officielle
            </p>
            <h2
              className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              1 départ tous les 30 jours, délai de livraison 45 jours
            </h2>
            <p className="text-sm sm:text-base text-slate-200">
              Tarifs transparents par carton, électroménager, barrique, cantine métallique et valise.{' '}
              <strong className="text-[#FFC400] font-semibold">
                Pour les autres appareils, merci de nous consulter !
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            {GUARANTEE_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-white"
                >
                  <Icon className="w-4 h-4 text-[#FFC400] shrink-0" aria-hidden="true" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grille principale : Affiche officielle + Cartes tarifaires */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne gauche : Image officielle de l'affiche tarifaire */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setFlyerModalOpen(true)}
                aria-label="Agrandir la plaquette tarifaire officielle EBS FRET MARITIME"
                className="relative w-full block group cursor-pointer bg-slate-100"
              >
                <img
                  src={IMAGES.officialFlyer}
                  alt="Plaquette tarifaire officielle EBS FRET MARITIME : cartons, électroménager, télévision, barrique, cantine métallique, valises et contacts France, Pointe-Noire et Brazzaville"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-contain"
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1F44]/90 text-white text-xs font-bold shadow-md group-hover:bg-[#0E5AA8] transition-colors">
                  <ZoomIn className="w-3.5 h-3.5 text-[#FFC400]" aria-hidden="true" />
                  <span>Agrandir l&apos;affiche</span>
                </span>
              </button>
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-600">
                <span className="font-semibold text-[#0A1F44]">
                  Plaquette officielle EBS
                </span>
                <a
                  href={buildSimpleWhatsAppUrl(
                    'Bonjour EBS FRET MARITIME, je souhaite consulter votre tarif pour un autre appareil / colis.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    void trackEvent('whatsapp_direct_click', { label: 'flyer_consult' })
                  }
                  className="font-bold text-[#0E5AA8] hover:underline whitespace-nowrap"
                >
                  Nous consulter →
                </a>
              </div>
            </div>
          </div>

          {/* Colonne droite : Catalogue détaillé interactif */}
          <div className="lg:col-span-8 space-y-5">
            {/* Onglets de filtre */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Filtrer les tarifs par catégorie"
                className="inline-flex flex-wrap gap-1.5 p-1 bg-white border border-slate-200 rounded-xl"
              >
                {(
                  [
                    { id: 'all', label: 'Tous les tarifs (15)' },
                    { id: 'cartons', label: 'Cartons (4)' },
                    { id: 'electromenager', label: 'Électroménager & TV (7)' },
                    { id: 'contenants', label: 'Barriques, Cantines & Valises (4)' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[#0A1F44] text-white'
                        : 'text-slate-600 hover:text-[#0A1F44]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cartes des montants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleItems.map((item) => {
                const Icon = TARIFF_ICONS[item.id] ?? Package;
                const unitQty = unitValues[item.id] ?? item.defaultUnits ?? 100;
                const calculatedUnitPrice =
                  item.unitCalculator && item.unitRate
                    ? Math.round(unitQty * item.unitRate * 100) / 100
                    : null;

                return (
                  <article
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-[#0E5AA8]/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0A1F44]/5 text-[#0E5AA8] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>

                        <div className="text-right">
                          {item.pricePrefix && (
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-[#0A1F44] bg-[#FFC400]/25 px-2 py-0.5 rounded mb-1">
                              {item.pricePrefix}
                            </span>
                          )}
                          <span className="font-display text-xl font-extrabold text-[#C81E1E] tabular-nums">
                            {item.priceLabel}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-display text-base font-bold text-[#0A1F44]">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.spec}
                        </p>
                      </div>

                      {item.unitCalculator && calculatedUnitPrice !== null && (
                        <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-600">
                            <label htmlFor={`calc-${item.id}`}>
                              {item.unitCalculator === 'cm'
                                ? 'Diagonale TV (cm)'
                                : 'Contenance (litres)'}
                            </label>
                            <span className="font-mono font-bold text-[#0A1F44]">
                              = {formatEuro(calculatedUnitPrice)}
                            </span>
                          </div>
                          <input
                            id={`calc-${item.id}`}
                            type="number"
                            min={10}
                            max={500}
                            value={unitQty || ''}
                            onChange={(e) => {
                              const parsed = parseFloat(e.target.value);
                              setUnitValues((prev) => ({
                                ...prev,
                                [item.id]: Number.isNaN(parsed)
                                  ? 0
                                  : Math.max(0, Math.min(500, parsed)),
                              }));
                            }}
                            className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-xs text-[#0A1F44] tabular-nums"
                          />
                        </div>
                      )}
                    </div>

                    <a
                      href={getItemWhatsAppUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        void trackEvent('whatsapp_direct_click', {
                          label: `tariff_${item.id}`,
                        })
                      }
                      className="inline-flex items-center justify-center gap-1.5 w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#16A34A] text-[#0A1F44] hover:text-white text-xs font-bold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Expédier cet article</span>
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contacts & Agences Officielles : France, Pointe-Noire, Brazzaville */}
        <div className="space-y-5 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#0E5AA8] mb-1">
                Réseau d&apos;agences France &amp; Congo
              </p>
              <h3 className="font-display text-2xl font-extrabold text-[#0A1F44]">
                Nos points de dépôt, de retrait et contacts directs
              </h3>
            </div>
            <p className="text-xs text-slate-600 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" aria-hidden="true" />
              <span>Paiement possible à l&apos;arrivée au Congo</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OFFICIAL_AGENCIES.map((agency) => (
              <article
                key={agency.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#0E5AA8]">
                    {agency.countryLabel}
                  </p>
                  <h4 className="font-display text-xl font-extrabold text-[#0A1F44]">
                    {agency.cityTitle}
                  </h4>
                  <p className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                    <MapPin className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{agency.address}</span>
                  </p>
                  {agency.reference && (
                    <p className="text-xs font-semibold text-[#0A1F44] pl-6">
                      {agency.reference}
                    </p>
                  )}
                  {agency.hours && (
                    <p className="text-xs text-slate-600 pl-6">{agency.hours}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {agency.phones.map((phone) => (
                    <div
                      key={phone.tel}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <a
                        href={`tel:${phone.tel}`}
                        className="inline-flex items-center gap-2 font-mono font-bold text-[#0A1F44] hover:text-[#0E5AA8]"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#0E5AA8] shrink-0" aria-hidden="true" />
                        <span>{phone.display}</span>
                      </a>
                      {phone.whatsapp && (
                        <a
                          href={`https://wa.me/${phone.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            void trackEvent('whatsapp_direct_click', {
                              label: `agency_${agency.id}`,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16A34A]/10 hover:bg-[#16A34A] text-[#15803D] hover:text-white text-xs font-bold transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" aria-hidden="true" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox plein écran de l'affiche tarifaire */}
      {flyerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Affiche tarifaire officielle EBS FRET MARITIME"
          onClick={() => setFlyerModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setFlyerModalOpen(false)}
              aria-label="Fermer l'affiche"
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={IMAGES.officialFlyer}
              alt="Plaquette tarifaire officielle EBS FRET MARITIME"
              referrerPolicy="no-referrer"
              className="w-full max-h-[85vh] object-contain bg-slate-100"
            />
          </div>
        </div>
      )}
    </section>
  );
}
