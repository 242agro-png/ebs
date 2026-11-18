import { useEffect, useState, FormEvent } from 'react';
import {
  CalendarClock,
  Search,
  CheckCircle2,
  Ship,
  ArrowRight,
} from 'lucide-react';
import { buildSimpleWhatsAppUrl } from '../utils/shipping';

// Target departure: 30 Novembre 2026 at 10:30 Paris time
const TARGET_DATE_MS = new Date('2026-11-30T10:30:00+01:00').getTime();

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeRemaining(): TimeRemaining {
  const diff = Math.max(0, TARGET_DATE_MS - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function DepartureAndTracking() {
  const [countdown, setCountdown] = useState<TimeRemaining>(() => getTimeRemaining());
  const [containerCode, setContainerCode] = useState('');
  const [trackedCode, setTrackedCode] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bookingUrl = buildSimpleWhatsAppUrl(
    'Bonjour EBS FRET MARITIME, je souhaite réserver ma place dans le prochain conteneur du 30 Novembre 2026 à Herblay.'
  );

  const handleTrackSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = containerCode.trim().toUpperCase();
    if (!cleaned) {
      setTrackingError('Veuillez saisir un numéro de conteneur ou de scellé.');
      setTrackedCode(null);
      return;
    }
    setTrackingError('');
    setTrackedCode(cleaned);
  };

  const handleSampleTrack = (sample: string) => {
    setContainerCode(sample);
    setTrackingError('');
    setTrackedCode(sample);
  };

  return (
    <section className="bg-white border-b border-slate-200 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Prochain départ + Compte à rebours */}
          <div className="lg:col-span-6 bg-[#0A1F44] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FFC400] mb-2">
                <CalendarClock className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Prochain départ maritime</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Prochain chargement : 30 Novembre 2026 - Herblay
              </h2>
              <p className="text-sm text-slate-300 mb-6">
                Dépôt des colis le samedi et dimanche de 10h30 à 17h30 au 201 Route de
                Pierrelaye, 95220 Herblay.
              </p>

              {/* Compte à rebours */}
              <div
                aria-label="Compte à rebours avant le prochain chargement"
                className="grid grid-cols-4 gap-2.5 sm:gap-3 mb-6"
              >
                {[
                  { label: 'Jours', value: countdown.days },
                  { label: 'Heures', value: countdown.hours },
                  { label: 'Min', value: countdown.minutes },
                  { label: 'Sec', value: countdown.seconds },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="bg-white/10 border border-white/15 rounded-xl py-3 px-2 text-center"
                  >
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[#FFC400] tabular-nums leading-none">
                      {String(unit.value).padStart(2, '0')}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-1.5 font-medium">
                      {unit.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 bg-[#FFC400] hover:bg-[#ffd033] text-[#0A1F44] font-bold text-sm sm:text-base rounded-xl transition-colors"
            >
              <span>Réserver ma place dans le conteneur</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </a>
          </div>

          {/* Suivre mon colis */}
          <div
            id="suivi"
            className="lg:col-span-6 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0E5AA8] mb-2">
                <Ship className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Traçabilité maritime &amp; scellé</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1F44] mb-2">
                Suivre mon colis
              </h2>
              <p className="text-sm text-slate-600 mb-5">
                Entrez le numéro de conteneur ou de scellé transmis lors du chargement pour
                vérifier l'avancement de votre expédition.
              </p>

              <form onSubmit={handleTrackSubmit} className="space-y-3">
                <label
                  htmlFor="tracking-input"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Numéro de conteneur / scellé
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="tracking-input"
                    type="text"
                    value={containerCode}
                    onChange={(e) => {
                      setContainerCode(e.target.value);
                      if (trackingError) setTrackingError('');
                    }}
                    placeholder="Ex : EBS-0394715"
                    className="flex-1 min-h-[46px] px-4 bg-white border border-slate-300 rounded-xl font-mono text-sm text-[#0A1F44] placeholder:text-slate-400 focus:border-[#0E5AA8]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 bg-[#0E5AA8] hover:bg-[#0A1F44] text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Vérifier</span>
                  </button>
                </div>

                {trackingError && (
                  <p className="text-xs font-medium text-red-600" role="alert">
                    {trackingError}
                  </p>
                )}
              </form>

              {/* Exemples cliquables pour test rapide */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>Exemple rapide :</span>
                <button
                  type="button"
                  onClick={() => handleSampleTrack('EBS-PNR-0394715')}
                  className="font-mono text-[#0E5AA8] underline hover:text-[#0A1F44] cursor-pointer"
                >
                  EBS-PNR-0394715
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => handleSampleTrack('0394715')}
                  className="font-mono text-[#0E5AA8] underline hover:text-[#0A1F44] cursor-pointer"
                >
                  0394715
                </button>
              </div>
            </div>

            {/* Résultat de suivi */}
            {trackedCode ? (
              <div
                aria-live="polite"
                className="mt-5 bg-white border border-emerald-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-slate-500">
                      Référence : <strong className="text-[#0A1F44]">{trackedCode}</strong>
                    </p>
                    <p className="font-display font-bold text-base text-[#0A1F44]">
                      Votre conteneur est en transit vers Pointe-Noire
                    </p>
                    <p className="text-xs text-slate-600">
                      Chargé et scellé à Herblay · Embarquement Port du Havre effectué ·
                      Notification WhatsApp dès l'arrivée au port.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
                Le numéro de scellé officiel vous est envoyé en photo et vidéo sur WhatsApp le
                jour du chargement.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
