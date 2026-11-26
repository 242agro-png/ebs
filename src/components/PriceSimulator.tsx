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
  AIR_MERCHANDISE_OPTIONS,
  APPLIANCE_OPTIONS,
  ApplianceKind,
  CARTON_PRESETS,
  CongoDeliveryOption,
  ContainerKind,
  DestinationCity,
  FrancePickupOption,
  LuggageKind,
  MERCHANDISE_CATEGORY_OPTIONS,
  MerchandiseCategory,
  ParcelInput,
  ShippingMode,
  buildWhatsAppQuoteUrl,
  calculateSimulation,
  createDefaultParcel,
  formatEuro,
} from '../utils/shipping';
import { trackEvent } from '../lib/analytics';

const TV_CM_PRESETS = [80, 100, 127, 140];
const CONTAINER_LITER_PRESETS = [60, 120, 220];

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

  const updateParcelProps = (index: number, patch: Partial<ParcelInput>) => {
    setParcels((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const updateParcelNumberField = (
    index: number,
    field: 'length' | 'width' | 'height' | 'weight' | 'tvCm' | 'liters',
    rawValue: string
  ) => {
    const parsed = parseFloat(rawValue);
    const value = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    updateParcelProps(index, { [field]: value });
  };

  const applyFirstParcelToAll = () => {
    if (parcels.length <= 1) return;
    const first = parcels[0];
    setParcels((prev) =>
      prev.map((p) => ({
        ...p,
        category: first.category,
        length: first.length,
        width: first.width,
        height: first.height,
        weight: first.weight,
        applianceKind: first.applianceKind,
        tvCm: first.tvCm,
        containerKind: first.containerKind,
        liters: first.liters,
        luggageKind: first.luggageKind,
        customLabel: first.customLabel,
        airGoodsType: first.airGoodsType,
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
            className={`flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
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

      {/* 2. Destination & Nombre d'articles / colis */}
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
                className={`flex items-center justify-center gap-1.5 min-h-[44px] px-2 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
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
              Nombre d'articles / colis
            </label>
            <span className="font-mono text-sm font-semibold text-[#0A1F44] tabular-nums">
              {parcelCount} {parcelCount > 1 ? 'articles' : 'article'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 h-[52px]">
            <button
              type="button"
              onClick={() => handleCountChange(parcelCount - 1)}
              disabled={parcelCount <= 1}
              aria-label="Retirer un article"
              className="w-11 h-11 shrink-0 rounded-lg border border-slate-300 flex items-center justify-center text-[#0A1F44] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
              aria-label="Ajouter un article"
              className="w-11 h-11 shrink-0 rounded-lg border border-slate-300 flex items-center justify-center text-[#0A1F44] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Détail des marchandises par article */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            {mode === 'maritime'
              ? 'Type de marchandise et caractéristiques par article'
              : 'Nature de la marchandise, poids et dimensions par colis'}
          </span>
          {parcelCount > 1 && (
            <button
              type="button"
              onClick={applyFirstParcelToAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E5AA8] hover:text-[#0A1F44] transition-colors py-1 cursor-pointer"
            >
              {copiedFirst ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">Appliqué à tous</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copier Article 1 sur tous</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {parcels.map((parcel, idx) => {
            const breakdown = result.parcelBreakdowns[idx];
            return (
              <div
                key={parcel.id}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A1F44]">
                    <Package className="w-3.5 h-3.5 text-[#0E5AA8]" aria-hidden="true" />
                    {mode === 'maritime' ? `Article #${idx + 1}` : `Colis #${idx + 1}`}
                  </span>
                  {breakdown && (
                    <span className="font-mono text-xs font-semibold text-[#0E5AA8] tabular-nums">
                      {breakdown.isStartingFrom ? 'Dès ' : ''}
                      {formatEuro(breakdown.parcelTotal)}
                      {mode === 'maritime' &&
                        breakdown.volumeM3 > 0 &&
                        (parcel.category === 'carton' || parcel.category === 'custom') &&
                        ` · ${breakdown.volumeM3.toFixed(3)} m³`}
                    </span>
                  )}
                </div>

                {mode === 'maritime' ? (
                  <>
                    {/* Sélecteur de type de marchandise */}
                    <div>
                      <label
                        htmlFor={`cat-${parcel.id}`}
                        className="block text-[11px] font-semibold text-slate-600 mb-1"
                      >
                        Type de marchandise
                      </label>
                      <select
                        id={`cat-${parcel.id}`}
                        value={parcel.category}
                        onChange={(e) => {
                          const nextCategory = e.target.value as MerchandiseCategory;
                          updateParcelProps(idx, { category: nextCategory });
                          void trackEvent('simulator_interact', {
                            mode,
                            destination,
                            label: `category_${nextCategory}`,
                          });
                        }}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-[#0A1F44] focus:border-[#0E5AA8]"
                      >
                        {MERCHANDISE_CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Champs dynamiques selon le type */}
                    {parcel.category === 'carton' && (
                      <>
                        <div className="flex flex-wrap gap-1.5">
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
                                  updateParcelProps(idx, {
                                    length: preset.length,
                                    width: preset.width,
                                    height: preset.height,
                                  })
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                              onChange={(e) => updateParcelNumberField(idx, 'length', e.target.value)}
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
                              onChange={(e) => updateParcelNumberField(idx, 'width', e.target.value)}
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
                              onChange={(e) => updateParcelNumberField(idx, 'height', e.target.value)}
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
                              onChange={(e) => updateParcelNumberField(idx, 'weight', e.target.value)}
                              className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {parcel.category === 'appliance' && (
                      <div className="space-y-1.5">
                        <label
                          htmlFor={`app-${parcel.id}`}
                          className="block text-[11px] font-medium text-slate-500"
                        >
                          Appareil électroménager
                        </label>
                        <select
                          id={`app-${parcel.id}`}
                          value={parcel.applianceKind}
                          onChange={(e) =>
                            updateParcelProps(idx, {
                              applianceKind: e.target.value as ApplianceKind,
                            })
                          }
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-[#0A1F44] focus:border-[#0E5AA8]"
                        >
                          {APPLIANCE_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label} — à partir de {opt.minPriceEur}€
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500">
                          Tarif indicatif « à partir de » selon gabarit, confirmé sur WhatsApp.
                        </p>
                      </div>
                    )}

                    {parcel.category === 'tv' && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {TV_CM_PRESETS.map((cm) => (
                            <button
                              key={cm}
                              type="button"
                              onClick={() => updateParcelProps(idx, { tvCm: cm })}
                              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                parcel.tvCm === cm
                                  ? 'bg-[#0A1F44] text-white'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0E5AA8]'
                              }`}
                            >
                              {cm} cm · {formatEuro(cm * 1.5)}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label
                            htmlFor={`tv-${parcel.id}`}
                            className="block text-[11px] font-medium text-slate-500 mb-1"
                          >
                            Diagonale de l'écran (cm) — Tarif : 1,50€ / cm
                          </label>
                          <input
                            id={`tv-${parcel.id}`}
                            type="number"
                            min={30}
                            max={300}
                            value={parcel.tvCm || ''}
                            onChange={(e) => updateParcelNumberField(idx, 'tvCm', e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                          />
                        </div>
                      </div>
                    )}

                    {parcel.category === 'container' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {(
                            [
                              { id: 'barrique', label: 'Barrique' },
                              { id: 'cantine', label: 'Cantine métallique' },
                            ] as { id: ContainerKind; label: string }[]
                          ).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => updateParcelProps(idx, { containerKind: item.id })}
                              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                parcel.containerKind === item.id
                                  ? 'bg-[#0A1F44] text-white border-[#0A1F44]'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#0E5AA8]'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {CONTAINER_LITER_PRESETS.map((liters) => (
                            <button
                              key={liters}
                              type="button"
                              onClick={() => updateParcelProps(idx, { liters })}
                              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                parcel.liters === liters
                                  ? 'bg-[#0A1F44] text-white'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0E5AA8]'
                              }`}
                            >
                              {liters} L · {liters}€
                            </button>
                          ))}
                        </div>
                        <div>
                          <label
                            htmlFor={`liters-${parcel.id}`}
                            className="block text-[11px] font-medium text-slate-500 mb-1"
                          >
                            Contenance (litres) — Tarif : 1,00€ / litre
                          </label>
                          <input
                            id={`liters-${parcel.id}`}
                            type="number"
                            min={10}
                            max={500}
                            value={parcel.liters || ''}
                            onChange={(e) => updateParcelNumberField(idx, 'liters', e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                          />
                        </div>
                      </div>
                    )}

                    {parcel.category === 'luggage' && (
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: 'valise-30', label: 'Valise 30 kg · 50€', weight: 30 },
                            { id: 'valise-50', label: 'Valise 50 kg · 80€', weight: 50 },
                          ] as { id: LuggageKind; label: string; weight: number }[]
                        ).map((lug) => (
                          <button
                            key={lug.id}
                            type="button"
                            onClick={() =>
                              updateParcelProps(idx, {
                                luggageKind: lug.id,
                                weight: lug.weight,
                              })
                            }
                            className={`min-h-[42px] px-2.5 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              parcel.luggageKind === lug.id
                                ? 'bg-[#0A1F44] text-white border-[#0A1F44]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-[#0E5AA8]'
                            }`}
                          >
                            {lug.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {parcel.category === 'custom' && (
                      <div className="space-y-2">
                        <div>
                          <label
                            htmlFor={`custom-label-${parcel.id}`}
                            className="block text-[11px] font-medium text-slate-500 mb-1"
                          >
                            Nom de la marchandise (meuble, pièce auto, colis hors format...)
                          </label>
                          <input
                            id={`custom-label-${parcel.id}`}
                            type="text"
                            maxLength={80}
                            placeholder="Ex : Matelas, Fauteuil, Lot alimentaire..."
                            value={parcel.customLabel}
                            onChange={(e) =>
                              updateParcelProps(idx, { customLabel: e.target.value })
                            }
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-[#0A1F44] focus:border-[#0E5AA8]"
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label
                              htmlFor={`cl-${parcel.id}`}
                              className="block text-[11px] font-medium text-slate-500 mb-1"
                            >
                              Long. (cm)
                            </label>
                            <input
                              id={`cl-${parcel.id}`}
                              type="number"
                              min={1}
                              max={500}
                              value={parcel.length || ''}
                              onChange={(e) => updateParcelNumberField(idx, 'length', e.target.value)}
                              className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`cw-${parcel.id}`}
                              className="block text-[11px] font-medium text-slate-500 mb-1"
                            >
                              Larg. (cm)
                            </label>
                            <input
                              id={`cw-${parcel.id}`}
                              type="number"
                              min={1}
                              max={500}
                              value={parcel.width || ''}
                              onChange={(e) => updateParcelNumberField(idx, 'width', e.target.value)}
                              className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`ch-${parcel.id}`}
                              className="block text-[11px] font-medium text-slate-500 mb-1"
                            >
                              Haut. (cm)
                            </label>
                            <input
                              id={`ch-${parcel.id}`}
                              type="number"
                              min={1}
                              max={500}
                              value={parcel.height || ''}
                              onChange={(e) => updateParcelNumberField(idx, 'height', e.target.value)}
                              className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`ckg-${parcel.id}`}
                              className="block text-[11px] font-medium text-slate-500 mb-1"
                            >
                              Poids (kg)
                            </label>
                            <input
                              id={`ckg-${parcel.id}`}
                              type="number"
                              min={1}
                              max={2000}
                              value={parcel.weight || ''}
                              onChange={(e) => updateParcelNumberField(idx, 'weight', e.target.value)}
                              className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label
                        htmlFor={`air-type-${parcel.id}`}
                        className="block text-[11px] font-semibold text-slate-600 mb-1"
                      >
                        Nature de la marchandise (12€/kg · min. 5 kg)
                      </label>
                      <select
                        id={`air-type-${parcel.id}`}
                        value={parcel.airGoodsType}
                        onChange={(e) =>
                          updateParcelProps(idx, { airGoodsType: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-[#0A1F44] focus:border-[#0E5AA8]"
                      >
                        {AIR_MERCHANDISE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label
                          htmlFor={`akg-${parcel.id}`}
                          className="block text-[11px] font-medium text-slate-500 mb-1"
                        >
                          Poids (kg)
                        </label>
                        <input
                          id={`akg-${parcel.id}`}
                          type="number"
                          min={1}
                          max={2000}
                          value={parcel.weight || ''}
                          onChange={(e) => updateParcelNumberField(idx, 'weight', e.target.value)}
                          className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`al-${parcel.id}`}
                          className="block text-[11px] font-medium text-slate-500 mb-1"
                        >
                          Long. (cm)
                        </label>
                        <input
                          id={`al-${parcel.id}`}
                          type="number"
                          min={1}
                          max={500}
                          value={parcel.length || ''}
                          onChange={(e) => updateParcelNumberField(idx, 'length', e.target.value)}
                          className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`aw-${parcel.id}`}
                          className="block text-[11px] font-medium text-slate-500 mb-1"
                        >
                          Larg. (cm)
                        </label>
                        <input
                          id={`aw-${parcel.id}`}
                          type="number"
                          min={1}
                          max={500}
                          value={parcel.width || ''}
                          onChange={(e) => updateParcelNumberField(idx, 'width', e.target.value)}
                          className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`ah-${parcel.id}`}
                          className="block text-[11px] font-medium text-slate-500 mb-1"
                        >
                          Haut. (cm)
                        </label>
                        <input
                          id={`ah-${parcel.id}`}
                          type="number"
                          min={1}
                          max={500}
                          value={parcel.height || ''}
                          onChange={(e) => updateParcelNumberField(idx, 'height', e.target.value)}
                          className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm text-[#0A1F44] tabular-nums focus:border-[#0E5AA8]"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
              className={`flex items-center gap-2 min-h-[42px] px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
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
              className={`flex items-center gap-2 min-h-[42px] px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
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
              className={`flex items-center gap-2 min-h-[42px] px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
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
              className={`flex items-center gap-2 min-h-[42px] px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                congoDelivery === 'home'
                  ? 'bg-[#0A1F44]/5 border-[#0A1F44] text-[#0A1F44]'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Home className="w-4 h-4 shrink-0 text-[#0E5AA8]" aria-hidden="true" />
              <span>Livraison à domicile (+25€/article)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Résultat en temps réel */}
      <div className="bg-[#0A1F44] text-white rounded-xl p-4 sm:p-5 mb-4">
        {result.groupDiscountApplied && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#FFC400] mb-3 pb-2.5 border-b border-white/15">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              Offre groupée appliquée (-20% dès 10 articles : -{formatEuro(result.groupDiscountAmount)})
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-slate-300 mb-1">
              {mode === 'maritime'
                ? result.hasStartingFromPrice
                  ? 'Prix estimé total (à partir de)'
                  : 'Prix estimé total'
                : 'Prix total estimé (12€/kg · min. 5 kg)'}
            </p>
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFC400] tabular-nums leading-none">
              {result.hasStartingFromPrice ? 'Dès ' : ''}
              {formatEuro(result.estimatedTotal)}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs text-slate-200 tabular-nums">
            {mode === 'maritime' ? (
              <>
                <p>
                  Prix moyen par article :{' '}
                  <strong className="text-white font-mono">
                    {formatEuro(result.averagePerParcel)}
                  </strong>
                </p>
                <p>
                  {result.parcelCount} {result.parcelCount > 1 ? 'articles' : 'article'} · Destination :{' '}
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
                Inclus livraison à domicile au Congo : +{formatEuro(result.congoDeliverySupplement)} (25€/article)
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
        Prix estimé. Prix final confirmé sur WhatsApp après vérification de vos marchandises.
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
