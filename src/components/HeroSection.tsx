import { useState } from 'react';
import { MessageCircle, ShieldCheck, ArrowDown, Container } from 'lucide-react';
import {
  IMAGES,
  WHATSAPP_DISPLAY,
  buildSimpleWhatsAppUrl,
} from '../utils/shipping';
import { PriceSimulator } from './PriceSimulator';

export function HeroSection() {
  const [heroImgError, setHeroImgError] = useState(false);

  const whatsappDirectUrl = buildSimpleWhatsAppUrl(
    'Bonjour EBS FRET MARITIME, je souhaite envoyer des colis de la France vers le Congo.'
  );

  const scrollToSimulator = () => {
    const el = document.getElementById('simulateur');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-[#0A1F44] text-white overflow-hidden">
      {/* Subtle maritime ambient gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#06132b] via-[#0A1F44] to-[#0E5AA8]/40 pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Colonne gauche : Message principal + Preuves + Visuel Conteneur Jaune */}
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

            {/* Visuel conteneur maritime jaune & entrepôt */}
            <figure className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#06132b] aspect-[16/9]">
              {!heroImgError ? (
                <img
                  src={IMAGES.heroContainer}
                  alt="Grand conteneur maritime jaune en chargement au port du Havre pour le Congo"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0A1F44] to-[#0E5AA8]">
                  <Container className="w-12 h-12 text-[#FFC400] mb-2" aria-hidden="true" />
                  <p className="font-display font-bold text-white">
                    Conteneur Maritime Jaune EBS — Port du Havre
                  </p>
                </div>
              )}
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-3 text-xs sm:text-sm text-slate-100">
                Départ Port du Havre · Chargement filmé et scellé devant nos clients à Herblay
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
