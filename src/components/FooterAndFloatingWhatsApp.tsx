import { MapPin, Clock, MessageCircle, Globe, UserCheck, Facebook } from 'lucide-react';
import {
  WHATSAPP_DISPLAY,
  FACEBOOK_PAGE_URL,
  buildSimpleWhatsAppUrl,
} from '../utils/shipping';

export function FooterAndFloatingWhatsApp() {
  const whatsappUrl = buildSimpleWhatsAppUrl(
    'Bonjour EBS FRET MARITIME, je souhaite un devis gratuit et sans engagement.'
  );

  return (
    <>
      <footer className="bg-[#0A1F44] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-white/15">
            {/* Identité de marque */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-20 h-16 bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src="/assets/aistudio/logo_61ab13b2.webp"
                    alt="Logo EBS FRET MARITIME"
                    className="w-full h-full object-cover object-center scale-[1.3]"
                  />
                </div>
                <p className="font-display text-xl font-extrabold tracking-tight text-white">
                  EBS FRET MARITIME
                </p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                « Vos colis, en toute sécurité, de la France au Congo. »
              </p>
              <div className="flex items-center gap-2 text-xs text-[#FFC400] font-semibold pt-1">
                <UserCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Gérant : Philippe Bandzouzi · Devis gratuit, sans engagement</span>
              </div>
            </div>

            {/* Adresse & Horaires */}
            <div className="lg:col-span-4 space-y-3 text-sm text-slate-300">
              <p className="font-display font-bold text-white text-base">
                Entrepôt de dépôt France
              </p>
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" aria-hidden="true" />
                <span>201 Route de Pierrelaye, 95220 Herblay, France</span>
              </p>
              <p className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Samedi et Dimanche : 10h30 - 17h30</span>
              </p>
              <p className="pt-1">
                <a
                  href="https://share.google/CKah9QqMZ7F8KDQFI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#FFC400] hover:underline"
                >
                  Voir la fiche &amp; itinéraire sur Google Maps →
                </a>
              </p>
            </div>

            {/* Contact & Destinations */}
            <div className="lg:col-span-4 space-y-3 text-sm text-slate-300">
              <p className="font-display font-bold text-white text-base">
                Contact &amp; Destinations Congo
              </p>
              <p className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Pointe-Noire, Brazzaville, Makélékélé, Mpaka</span>
              </p>
              <p className="text-xs text-slate-300">
                Facebook officiel : <strong className="text-white">EBS FRET MARITIME</strong>
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>WhatsApp : {WHATSAPP_DISPLAY}</span>
                </a>
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap"
                >
                  <Facebook className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Page Facebook EBS</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} EBS FRET MARITIME — Philippe Bandzouzi. Tous droits réservés.</p>
            <p>Fret Maritime (Port du Havre) &amp; Fret Aérien Express · France / Europe — Congo</p>
          </div>
        </div>
      </footer>

      {/* Bouton WhatsApp vert fixe en bas à droite */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Contacter EBS FRET MARITIME sur WhatsApp au ${WHATSAPP_DISPLAY}`}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2 px-4 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm rounded-full shadow-lg border border-white/20 transition-transform hover:scale-[1.03]"
      >
        <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline whitespace-nowrap">WhatsApp · {WHATSAPP_DISPLAY}</span>
        <span className="sm:hidden whitespace-nowrap">WhatsApp</span>
      </a>
    </>
  );
}
