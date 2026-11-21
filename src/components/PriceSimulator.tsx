import { useMemo, useState } from 'react';
import {
  Ship,
  Plane,
  Minus,
  Plus,
  Copy,
  CheckCircle2,
  MapPin,
  Home,
  Building2,
  MessageCircle,
  Package,
} from 'lucide-react';
import {
  CongoDeliveryOption,
  DestinationCity,
  FrancePickupOption,
  ParcelInput,
  ShippingMode,
  CARTON_PRESETS,
  buildWhatsAppQuoteUrl,
  calculateSimulation,
  createDefaultParcel,
  formatEuro,
} from '../utils/shipping';
import { trackEvent } from '../lib/analytics';

export function PriceSimulator() {
  const [mode, setMode] = useState<ShippingMode>('maritime');
  const [destination, setDestination] = useState<DestinationCity>('Pointe-Noire');
  const [parcels, setParcels] = useState<ParcelInput[]>([createDefaultParcel(1)]);
  const [congoDelivery, setCongoDelivery] = useState<CongoDeliveryOption>('agency');
  const [francePickup, setFrancePickup] = useState<FrancePickupOption>('herblay');
  const [copiedFirst, setCopiedFirst] = useState(false);

  const parcelCount = parcels.length;

  const handleCountChange = (nextCount: number) => {
    const clamped = Math.max(1, Math.min(30, nextCount));
    setParcels((prev) => {
      if (clamped === prev.length) return prev;
      if (clamped < prev.length) return prev.slice(0, clamped);
      const additions: ParcelInput[] = [];
      for (let i = prev.length + 1; i <= clamped; i++) {
        additions.push(createDefaultParcel(i));
      }
      return [...prev, ...additions];
    });
  };

  const updateParcelField = (
    index: number,
    field: keyof Omit<ParcelInput, 'id'>,
    rawValue: string
  ) => {
    const parsed = parseFloat(rawValue);
    const value = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    setParcels((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const applyFirstParcelToAll = () => {
    if (parcels.length <= 1) return;
    const first = parcels[0];
    setParcels((prev) =>
      prev.map((p) => ({
        ...p,
        length: first.length,
        width: first.width,
        height: first.height,
        weight: first.weight,
      }))
    );
    setCopiedFirst(true);
    setTimeout(() => setCopiedFirst(false), 1800);
  };

  const result = useMemo(
    () => calculateSimulation(mode, destination, parcels, congoDelivery),
    [mode, destination, parcels, congoDelivery]
  );

  const whatsappUrl = useMemo(
    () => buildWhatsAppQuoteUrl(result, parcels, congoDelivery, francePickup),
    [result, parcels, congoDelivery, francePickup]
  );

  return (
    <div
      id="simulateur"
      className="bg-white text-[#0A1F44] rounded-2xl shadow-2xl border border-slate-200/90 p-5 sm:p-7"
    >
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-[#0E5AA8] mb-1">
          Simulateur tarifaire instantané
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1F44]">
          Calculez votre prix en 30 secondes
        </h2>
      </div>

      {/* 1. Type d'envoi */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          Type d'envoi
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('maritime');
              void trackEvent('simulator_interact', { mode: 'maritime', destination });
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              mode === 'maritime'
                ? 'bg-[#0A1F44] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#0A1F44]'
            }`}
          >
            <Ship className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Maritime - Groupage</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('air');
              void trackEvent('simulator_interact', { mode: 'air', destination });
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              mode === 'air'
                ? 'bg-[#0E5AA8] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#0A1F44]'
            }`}
          >
            <Plane className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Aérien - Express</span>
          </button>
        </div>
      </div>

      {/* 2. Destination & Nombre de colis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Destination au Congo
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-xl">
            {(['Pointe-Noire', 'Brazzaville'] as DestinationCity[]).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setDestination(city);
                  void trackEvent('simulator_interact', { mode, destination: city });
                }}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] px-2 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  destination === city
                    ? 'bg-white text-[#0A1F44] shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-[#0A1F44]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#0E5AA8]" aria-hidden="true" />
                <span>{city}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="parcel-count-range" className="text-xs font-semibold text-slate-600">
              Nombre de colis
            </label>
            <span className="font-mono text-sm font-semibold text-[#0A1F44] tabular-nums">
              {parcelCount} {parcelCount > 1 ? 'colis' : 'colis'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 h-[52px]">
            <button
              type="button"
              onClick={() => handleCountChange(parcelCount - 1)}
              disabled={parcelCount <= 1}
              aria-label="Retirer un colis"
              className="w-11 h-11 shrink-0 rounded-lg border border-slate-300 flex items-center justify-center text-[#0A1F44] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              id="parcel-count-range"
              type="range"
              min={1}
              max={20}
              value={Math.min(20, parcelCount)}
              onChange={(e) => handleCountChange(Number(e.target.value))}
              className="w-full accent-[#0E5AA8] cursor-pointer h-2"
            />
            <button
              type="button"
              onClick={() => handleCountChange(parcelCount + 1)}
              disabled={parcelCount >= 30}
              aria-label="Ajouter un colis"
              className="w-11 h-11 shrink-0 rounded-lg border border-slate-300 flex items-center justify-center text-[#0A1F44] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Dimensions & Poids pour chaque colis */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Dimensions (cm) et poids (kg) par colis
          </span>
          {parcelCount > 1 && (
            <button
              type="button"
              onClick={applyFirstParcelToAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E5AA8] hover:text-[#0A1F44] transition-colors py-1"
            >
              {copiedFirst ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">Appliqué à tous les colis</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copier Colis 1 sur tous</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
          {parcels.map((parcel, idx) => {
            const breakdown = result.parcelBreakdowns[idx];
            return (
              <div
                key={parcel.id}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A1F44]">
                    <Package className="w-3.5 h-3.5 text-[#0E5AA8]" aria-hidden="true" />
                    Colis #{idx + 1}
                  </span>
                  {mode === 'maritime' && breakdown && (
                    <span className="font-mono text-xs font-semibold text-[#0E5AA8] tabular-nums">
                      {breakdown.volumeM3.toFixed(3)} m³ · {formatEuro(breakdown.parcelTotal)}
                    </span>
                  )}
                </div>

                {mode === 'maritime' && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {CARTON_PRESETS.map((preset) => {
                      const isSelected =
                        parcel.length === preset.length &&
                        parcel.width === preset.width &&
                        parcel.height === preset.height;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            setParcels((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      length: preset.length,
                                      width: preset.width,
                                      height: preset.height,
                                    }
                                  : item
                              )
                            )
                          }
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#0A1F44] text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0E5AA8]'
                          }`}
                        >
                          {preset.dimensions} · {preset.priceEur}€
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label
                      htmlFor={`l-${parcel.id}`}
                      className="block text-[11px] font-medium text-slate-500 mb-1"
                    >
                      Long. (cm)
                    </label>
                    <input
                      id={`l-${parcel.id}`}
                      type="number"
                      min={1}
                      max={500}
                      value={parcel.length || ''}
                      onChange={(e) => updateParcelField(idx, 'length', e.target.value)}
                      className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`w-${parcel.id}`}
                      className="block text-[11px] font-medium text-slate-500 mb-1"
                    >
                      Larg. (cm)
                    </label>
                    <input
                      id={`w-${parcel.id}`}
                      type="number"
                      min={1}
                      max={500}
                      value={parcel.width || ''}
                      onChange={(e) => updateParcelField(idx, 'width', e.target.value)}
                      className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`h-${parcel.id}`}
                      className="block text-[11px] font-medium text-slate-500 mb-1"
                    >
                      Haut. (cm)
                    </label>
                    <input
                      id={`h-${parcel.id}`}
                      type="number"
                      min={1}
                      max={500}
                      value={parcel.height || ''}
                      onChange={(e) => updateParcelField(idx, 'height', e.target.value)}
                      className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`kg-${parcel.id}`}
                      className="block text-[11px] font-medium text-slate-500 mb-1"
                    >
                      Poids (kg)
                    </label>
                    <input
                      id={`kg-${parcel.id}`}
                      type="number"
                      min={1}
                      max={2000}
                      value={parcel.weight || ''}
                      onChange={(e) => updateParcelField(idx, 'weight', e.target.value)}
                      className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Options France & Congo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Départ France
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => setFrancePickup('herblay')}
              className={`flex items-center gap-2 min-h-[42px] px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-colors ${
                francePickup === 'herblay'
                  ? 'bg-[#0A1F44]/5 border-[#0A1F44] text-[#0A1F44]'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0 text-[#0E5AA8]" aria-hidden="true" />
              <span>Je dépose à Herblay (95)</span>
            </button>
            <button
              type="button"
              onClick={() => setFrancePickup('pickup')}
              className={`flex items-center gap-2 min-h-[42px] px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-colors ${
                francePickup === 'pickup'
                  ? 'bg-[#0A1F44]/5 border-[#0A1F44] text-[#0A1F44]'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Home className="w-4 h-4 shrink-0 text-[#0E5AA8]" aria-hidden="true" />
              <span>Collecte à domicile en France</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Réception au Congo
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => setCongoDelivery('agency')}
              className={`flex items-center gap-2 min-h-[42px] px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-colors ${
                congoDelivery === 'agency'
                  ? 'bg-[#0A1F44]/5 border-[#0A1F44] text-[#0A1F44]'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0 text-[#0E5AA8]" aria-hidden="true" />
              <span>Retrait à l'agence</span>
            </button>
            <button
              type="button"
              onClick={() => setCongoDelivery('home')}
              className={`flex items-center gap-2 min-h-[42px] px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-colors ${
                congoDelivery === 'home'
                  ? 'bg-[#0A1F44]/5 border-[#0A1F44] text-[#0A1F44]'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Home className="w-4 h-4 shrink-0 text-[#0E5AA8]" aria-hidden="true" />
              <span>Livraison à domicile (+25€/colis)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Résultat en temps réel */}
      <div className="bg-[#0A1F44] text-white rounded-xl p-4 sm:p-5 mb-4">
        {result.groupDiscountApplied && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#FFC400] mb-3 pb-2.5 border-b border-white/15">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Offre groupée appliquée (-20% dès 10 colis : -{formatEuro(result.groupDiscountAmount)})</span>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-slate-300 mb-1">
              {mode === 'maritime' ? 'Prix estimé total' : 'Prix total estimé (12€/kg · min. 5 kg)'}
            </p>
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFC400] tabular-nums leading-none">
              {formatEuro(result.estimatedTotal)}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs text-slate-200 tabular-nums">
            {mode === 'maritime' ? (
              <>
                <p>
                  Prix moyen par colis :{' '}
                  <strong className="text-white font-mono">
                    {formatEuro(result.averagePerParcel)}
                  </strong>
                </p>
                <p>
                  {result.parcelCount} {result.parcelCount > 1 ? 'colis' : 'colis'} · Destination :{' '}
                  <strong className="text-white">{result.destination}</strong>
                </p>
              </>
            ) : (
              <>
                <p>
                  Poids total :{' '}
                  <strong className="text-white font-mono">{result.totalWeight} kg</strong>
                  {result.totalWeight < 5 && (
                    <span className="text-[#FFC400]"> (facturé 5 kg min.)</span>
                  )}
                </p>
                <p>
                  Délai estimé : <strong className="text-white">{result.estimatedDelay}</strong>
                </p>
              </>
            )}
          </div>
        </div>

        {(result.congoDeliverySupplement > 0 || francePickup === 'pickup') && (
          <div className="mt-3 pt-2.5 border-t border-white/15 text-xs text-slate-300 space-y-1">
            {result.congoDeliverySupplement > 0 && (
              <p className="tabular-nums">
                Inclus livraison à domicile au Congo : +{formatEuro(result.congoDeliverySupplement)} (25€/colis)
              </p>
            )}
            {francePickup === 'pickup' && (
              <p>Collecte à domicile en France/Europe : tarif précisé sur WhatsApp selon votre ville.</p>
            )}
          </div>
        )}
      </div>

      {/* Note légale & rassurante */}
      <p className="text-xs text-slate-600 text-center mb-4">
        Prix estimé. Prix final confirmé sur WhatsApp après vérification de vos colis.
      </p>

      {/* Bouton final WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          void trackEvent('quote_whatsapp_click', {
            mode,
            destination,
            parcelCount: result.parcelCount,
            estimatedAmountEur: result.estimatedTotal,
            label: `${mode}_${destination}`,
          })
        }
        className="w-full min-h-[52px] inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-colors"
      >
        <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span>Recevoir mon devis exact sur WhatsApp</span>
      </a>
    </div>
  );
}
