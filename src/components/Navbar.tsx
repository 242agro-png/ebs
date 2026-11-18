import { useState } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { WHATSAPP_DISPLAY, buildSimpleWhatsAppUrl } from '../utils/shipping';

const NAV_LINKS = [
  { label: 'Simulateur', href: '#simulateur' },
  { label: 'Étapes', href: '#etapes' },
  { label: 'Services', href: '#services' },
  { label: 'Localisation', href: '#localisation' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappUrl = buildSimpleWhatsAppUrl(
    'Bonjour EBS FRET MARITIME, je souhaite des informations pour envoyer un colis au Congo.'
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A1F44]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand lockup with logo and wordmark */}
        <a
          href="#"
          className="inline-flex items-center gap-3 whitespace-nowrap shrink-0"
        >
          <span className="h-11 w-14 bg-white rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/logo_61ab13b2.webp"
              alt="Logo EBS FRET MARITIME"
              className="w-full h-full object-cover object-center scale-[1.35]"
            />
          </span>
          <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white">
            EBS FRET MARITIME
          </span>
        </a>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-200"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#FFC400] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#FFC400]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0A1F44] bg-[#FFC400] hover:bg-[#ffd033] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{WHATSAPP_DISPLAY}</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A1F44] border-t border-white/10 px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 text-base font-medium text-slate-100 hover:text-[#FFC400] hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-white/10">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-[#0A1F44] bg-[#FFC400] rounded-lg"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>WhatsApp : {WHATSAPP_DISPLAY}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
