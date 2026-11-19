import { useEffect, useState } from 'react';
import {
  MessageCircle,
  ShieldCheck,
  ArrowDown,
  Container,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  IMAGES,
  WHATSAPP_DISPLAY,
  buildSimpleWhatsAppUrl,
} from '../utils/shipping';
import { PriceSimulator } from './PriceSimulator';
import { trackEvent } from '../lib/analytics';

interface HeroSlide {
  src: string;
  alt: string;
  caption: string;
  fallbackLabel: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    src: IMAGES.heroContainer,
    alt: 'Équipe logistique chargeant un conteneur maritime jaune au départ du port du Havre pour le Congo',
    caption: 'Départ Port du Havre · Chargement filmé et scellé devant nos clients à Herblay',
    fallbackLabel: 'Chargement Conteneur Jaune EBS — Port du Havre',
  },
  {
    src: IMAGES.heroCargoShip,
    alt: 'Navire porte-conteneurs chargé en mer reliant la France à Pointe-Noire',
    caption: 'Fret Maritime · Navires porte-conteneurs vers Pointe-Noire et Brazzaville',
    fallbackLabel: 'Navire Cargo EBS — Liaison Maritime France → Congo',
  },
  {
    src: IMAGES.heroCargoPlane,
    alt: 'Avion cargo en plein vol assurant le fret aérien express vers le Congo',
    caption: 'Fret Aérien Express · Avion cargo chaque vendredi, livraison sous 72h',
    fallbackLabel: 'Fret Aérien Express EBS — France → Congo',
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isPaused) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const goToPrevious = () => {
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const goToNext = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const whatsappDirectUrl = buildSimpleWhatsAppUrl(
    'Bonjour EBS FRET MARITIME, je souhaite envoyer des colis de la France vers le Congo.'
  );

  const scrollToSimulator = () => {
    const el = document.getElementById('simulateur');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <section className="relative bg-[#0A1F44] text-white overflow-hidden">
      {/* Subtle maritime ambient gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#06132b] via-[#0A1F44] to-[#0E5AA8]/40 pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Colonne gauche : Message principal + Preuves + Carrousel visuel */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-semibold text-[#FFC400] tracking-wide">
                EBS FRET MARITIME · France &amp; Europe vers le Congo
              </p>

              <h1
                className="font-display font-extrabold tracking-tight text-white leading-[1.08]"
                style={{ fontSize: 'clamp(2.1rem, 3.6vw, 3.35rem)', textWrap: 'balance' }}
              >
                Envoyez vos colis de France au Congo, en toute sécurité.
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
                Conteneurs sécurisés et scellés. Départ du Havre vers Pointe-Noire et
                Brazzaville. <strong className="text-white font-semibold">Vous payez à l'arrivée.</strong>
              </p>
            </div>

            {/* Boutons principaux */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={scrollToSimulator}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[#FFC400] hover:bg-[#ffd033] text-[#0A1F44] font-bold text-sm sm:text-base rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Simuler mon prix</span>
                <ArrowDown className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void trackEvent('whatsapp_direct_click', { label: 'hero' })}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/25 font-semibold text-sm sm:text-base rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" aria-hidden="true" />
                <span>WhatsApp : {WHATSAPP_DISPLAY}</span>
              </a>
            </div>

            {/* Preuves en texte propre (zéro pill) */}
            <div className="pt-2 border-t border-white/15">
              <ul className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-200 font-medium">
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FFC400] shrink-0" aria-hidden="true" />
                  <span>11 ans d'expérience</span>
                </li>
                <li className="hidden sm:inline text-white/30" aria-hidden="true">·</li>
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FFC400] shrink-0" aria-hidden="true" />
                  <span>Conteneurs scellés</span>
                </li>
                <li className="hidden sm:inline text-white/30" aria-hidden="true">·</li>
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FFC400] shrink-0" aria-hidden="true" />
                  <span>Paiement à l'arrivée</span>
                </li>
                <li className="hidden sm:inline text-white/30" aria-hidden="true">·</li>
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FFC400] shrink-0" aria-hidden="true" />
                  <span>Départs réguliers</span>
                </li>
              </ul>
            </div>

            {/* Carrousel visuel : chargement conteneur, bateau cargo et avion en vol */}
            <figure
              role="region"
              aria-roledescription="carousel"
              aria-label="Aperçu du fret maritime et aérien EBS"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              className="group relative rounded-2xl overflow-hidden border border-white/15 bg-[#06132b] aspect-[16/9]"
            >
              {HERO_SLIDES.map((slide, index) => {
                const isActive = index === activeSlide;
                const hasFailed = failedSlides[index];

                return (
                  <div
                    key={slide.src}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {!hasFailed ? (
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedSlides((prev) => ({ ...prev, [index]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0A1F44] to-[#0E5AA8]">
                        <Container className="w-12 h-12 text-[#FFC400] mb-2" aria-hidden="true" />
                        <p className="font-display font-bold text-white">
                          {slide.fallbackLabel}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Boutons Précédent / Suivant */}
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Image précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0A1F44]/75 hover:bg-[#0A1F44] text-white border border-white/25 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Image suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0A1F44]/75 hover:bg-[#0A1F44] text-white border border-white/25 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Légende + indicateurs de défilement */}
              <figcaption className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pt-8 pb-3 flex items-end justify-between gap-3">
                <span className="text-xs sm:text-sm text-slate-100 leading-snug">
                  {currentSlide.caption}
                </span>

                <div
                  className="flex items-center gap-1.5 shrink-0 pb-0.5"
                  role="tablist"
                  aria-label="Choisir une image"
                >
                  {HERO_SLIDES.map((slide, index) => {
                    const isActive = index === activeSlide;
                    return (
                      <button
                        key={slide.src}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Afficher l'image ${index + 1} sur ${HERO_SLIDES.length}`}
                        onClick={() => setActiveSlide(index)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          isActive
                            ? 'w-6 bg-[#FFC400]'
                            : 'w-2 bg-white/45 hover:bg-white/75'
                        }`}
                      />
                    );
                  })}
                </div>
              </figcaption>
            </figure>
          </div>

          {/* Colonne droite : Simulateur interactif visible dès la première section */}
          <div className="lg:col-span-6">
            <PriceSimulator />
          </div>
        </div>
      </div>
    </section>
  );
}
