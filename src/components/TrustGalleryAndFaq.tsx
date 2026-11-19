import { useState } from 'react';
import { ChevronDown, ShieldCheck, Quote, Container } from 'lucide-react';
import { IMAGES } from '../utils/shipping';

const KEY_FIGURES = [
  {
    value: '+11 ans',
    label: "d'expérience",
    context: 'Fret maritime & aérien France — Congo',
  },
  {
    value: '+1 000',
    label: 'colis expédiés',
    context: 'Cartons, électroménager et commandes en ligne',
  },
  {
    value: '2',
    label: 'destinations principales',
    context: 'Pointe-Noire & Brazzaville (Makélékélé, Mpaka)',
  },
];

const GALLERY_ITEMS = [
  {
    src: IMAGES.depotContainerPark,
    alt: "Conteneur maritime 40 pieds stationné devant l'entrepôt EBS à Herblay",
    caption: 'Conteneur 40 pieds devant notre dépôt à Herblay',
  },
  {
    src: IMAGES.craneLoading,
    alt: 'Chargement de matériel volumineux par camion-grue dans le conteneur maritime',
    caption: 'Chargement par camion-grue · Colis volumineux',
  },
  {
    src: IMAGES.containerChassis,
    alt: 'Conteneur maritime 40 pieds CAI prêt pour le départ vers le Port du Havre',
    caption: 'Conteneur prêt pour le Port du Havre',
  },
  {
    src: IMAGES.securitySeal,
    alt: 'Scellé métallique numéroté verrouillant les portes du conteneur',
    caption: 'Scellé de sécurité numéroté filmé devant vous',
  },
];

const TESTIMONIALS = [
  {
    quote:
      "J'ai envoyé 5 cartons, tout est arrivé intact à Pointe-Noire. Merci EBS !",
    author: 'Grâce M.',
    route: 'Île-de-France → Pointe-Noire (Mpaka)',
  },
  {
    quote:
      "Service sérieux, j'ai payé à l'arrivée comme promis. Recevoir la vidéo du scellé au chargement rassure énormément.",
    author: 'Kevin B.',
    route: 'Herblay → Brazzaville (Makélékélé)',
  },
  {
    quote:
      "J'ai commandé sur Amazon et Zalando puis fait regrouper mes colis chez EBS. Livraison à domicile impeccable à Brazzaville.",
    author: 'Mireille N.',
    route: 'Lyon → Brazzaville',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Où déposer mes colis ?',
    answer:
      "Vous pouvez déposer vos colis à notre entrepôt situé au 201 Route de Pierrelaye, 95220 Herblay (France), ouvert le samedi et le dimanche de 10h30 à 17h30. Si vous ne pouvez pas vous déplacer, nous proposons également une collecte à domicile en France et via nos collaborateurs en Belgique, Allemagne, Pays-Bas et Suisse.",
  },
  {
    question: "Puis-je payer à l'arrivée ?",
    answer:
      "Oui. Pour le fret maritime, vous pouvez régler les frais d'expédition à l'arrivée de vos colis à Pointe-Noire ou à Brazzaville lors du retrait ou de la livraison. Le tarif estimé sur le simulateur est confirmé au préalable sur WhatsApp après vérification de vos colis.",
  },
  {
    question: 'Combien de temps pour arriver au Congo ?',
    answer:
      "Par voie maritime (départ du Port du Havre), le transit jusqu'au Congo prend généralement entre 4 et 6 semaines selon le calendrier maritime. Par fret aérien express, le départ a lieu chaque vendredi avec une livraison sous 72 heures.",
  },
  {
    question: 'Que puis-je envoyer ?',
    answer:
      "Nous transportons vos cartons de vêtements et effets personnels, chaussures, denrées sèches, matelas, téléviseurs, réfrigérateurs, congélateurs, machines à laver, meubles et achats e-commerce (Amazon, Zalando, Vinted, AliExpress, etc.). Contactez-nous sur WhatsApp pour tout objet spécifique.",
  },
  {
    question: 'Comment suivre mon conteneur ?',
    answer:
      "Lors du chargement à Herblay, nous scellons le conteneur devant vous ou en vidéo et vous communiquons le numéro de scellé et de conteneur. Vous pouvez vérifier l'état de votre envoi dans la rubrique « Suivre mon colis » sur ce site et recevoir des points d'étape réguliers sur WhatsApp.",
  },
  {
    question: 'Livrez-vous à domicile à Pointe-Noire et Brazzaville ?',
    answer:
      "Oui, en option. Vous pouvez soit retirer gratuitement vos colis à notre agence locale, soit choisir la livraison à domicile au Congo (+25€ par colis), y compris dans les zones de Pointe-Noire, Brazzaville, Makélékélé et Mpaka.",
  },
];

export function TrustGalleryAndFaq() {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  return (
    <>
      {/* SECTION 6 : PREUVES / CONFIANCE */}
      <section className="bg-[#F8FAFC] py-14 sm:py-18 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header + 3 chiffres */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold text-[#0E5AA8] mb-2">
                Confiance &amp; Preuves terrain
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44]"
                style={{ textWrap: 'balance' }}
              >
                Dirigé par Philippe Bandzouzi, au service de la diaspora
              </h2>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {KEY_FIGURES.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-slate-200 rounded-2xl p-5"
                >
                  <p className="font-display text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-sm font-bold text-[#0E5AA8] mt-1">{stat.label}</p>
                  <p className="text-xs text-slate-600 mt-1">{stat.context}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Galerie photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {GALLERY_ITEMS.map((item, idx) => (
              <figure
                key={item.caption}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="aspect-[4/3] bg-slate-200 overflow-hidden">
                  {!imgErrors[idx] ? (
                    <img
                      src={item.src}
                      alt={item.alt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [idx]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A1F44] text-white p-4 text-center">
                      <Container className="w-8 h-8 text-[#FFC400] mb-2" aria-hidden="true" />
                      <span className="text-xs font-medium">{item.caption}</span>
                    </div>
                  )}
                </div>
                <figcaption className="px-4 py-3 text-xs font-semibold text-[#0A1F44] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0E5AA8] shrink-0" aria-hidden="true" />
                  <span>{item.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Témoignages clients */}
          <div>
            <h3 className="font-display text-2xl font-bold text-[#0A1F44] mb-6">
              Avis de nos clients France &amp; Congo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <blockquote
                  key={t.author}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <Quote className="w-5 h-5 text-[#FFC400] mb-3" aria-hidden="true" />
                    <p className="text-sm sm:text-base text-[#0A1F44] leading-relaxed mb-5">
                      « {t.quote} »
                    </p>
                  </div>
                  <footer className="pt-4 border-t border-slate-100">
                    <p className="font-display font-bold text-sm text-[#0A1F44]">
                      {t.author}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.route}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 : FAQ */}
      <section id="faq" className="bg-white py-14 sm:py-18">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#0E5AA8] mb-2">
              Questions fréquentes
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44]">
              Tout savoir avant d'expédier
            </h2>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <span className="font-display font-bold text-base sm:text-lg text-[#0A1F44]">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#0E5AA8] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
