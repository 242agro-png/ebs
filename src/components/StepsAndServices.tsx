import { useState } from 'react';
import {
  Calculator,
  MapPin,
  Lock,
  Banknote,
  Ship,
  Plane,
  ShoppingBag,
  Globe2,
  Home,
} from 'lucide-react';
import { IMAGES } from '../utils/shipping';

const STEPS = [
  {
    number: '01.',
    title: 'Simulez votre prix',
    description:
      'Utilisez notre calculateur ci-dessus pour estimer en 30 secondes le coût de votre envoi maritime ou aérien.',
    icon: Calculator,
  },
  {
    number: '02.',
    title: 'Déposez vos colis à Herblay',
    description:
      '201 Route de Pierrelaye, 95220 Herblay — Samedi et Dimanche de 10h30 à 17h30 (ou collecte à domicile).',
    icon: MapPin,
  },
  {
    number: '03.',
    title: 'Chargement et scellé sécurisé',
    description:
      'Nous chargeons et scellons votre conteneur devant vous ou en vidéo, avec numéro de scellé vérifiable.',
    icon: Lock,
  },
  {
    number: '04.',
    title: "Paiement à l'arrivée au Congo",
    description:
      "Vous récupérez vos colis à Pointe-Noire / Brazzaville ou en livraison à domicile, et vous payez à l'arrivée.",
    icon: Banknote,
  },
];

const ONLINE_SHOPS = [
  'Zalando',
  'Amazon',
  'AliExpress',
  'Alibaba',
  'Zara',
  'eBay',
  'Rakuten',
  'Leboncoin',
  'Vinted',
  'BackMarket',
];

const EUROPEAN_COUNTRIES = [
  'France',
  'Belgique',
  'Allemagne',
  'Pays-Bas',
  'Suisse',
];

export function StepsAndServices() {
  const [warehouseImgErr, setWarehouseImgErr] = useState(false);
  const [airImgErr, setAirImgErr] = useState(false);

  return (
    <>
      {/* SECTION 3 : COMMENT ÇA MARCHE - 4 ÉTAPES */}
      <section id="etapes" className="bg-[#F8FAFC] py-14 sm:py-18 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-[#0E5AA8] mb-2">
              Procédure simple et transparente
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44]"
              style={{ textWrap: 'balance' }}
            >
              Comment ça marche en 4 étapes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.number}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-lg font-bold text-[#0E5AA8] tabular-nums">
                        {step.number}
                      </span>
                      <Icon className="w-5 h-5 text-[#0A1F44]" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0A1F44] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 : NOS SERVICES (Bento asymétrique) */}
      <section id="services" className="bg-white py-14 sm:py-18 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-[#0E5AA8] mb-2">
              Solutions logistiques France / Europe — Congo
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44]"
              style={{ textWrap: 'balance' }}
            >
              Des services adaptés à chaque envoi
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Service 1 : Fret Maritime Groupage (Large card) */}
            <article className="lg:col-span-7 bg-[#F8FAFC] border border-slate-200 rounded-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/2 aspect-[4/3] md:aspect-auto bg-slate-200 shrink-0">
                {!warehouseImgErr ? (
                  <img
                    src={IMAGES.warehouseHerblay}
                    alt="Équipe EBS Fret Maritime chargeant des colis et effets personnels dans le conteneur à Herblay"
                    referrerPolicy="no-referrer"
                    onError={() => setWarehouseImgErr(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0A1F44] text-white p-6">
                    <Ship className="w-10 h-10 text-[#FFC400]" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-7 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0E5AA8] mb-2">
                  <Ship className="w-4 h-4" aria-hidden="true" />
                  <span>01. Maritime · Départ Port du Havre</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0A1F44] mb-2.5">
                  Fret Maritime Groupage
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Expédiez en toute sécurité vos cartons, matelas, frigos, congélateurs,
                  meubles, électroménager et effets personnels. Remise automatique de -20%
                  dès 10 colis.
                </p>
                <p className="font-mono text-xs font-semibold text-[#0A1F44]">
                  Carton 60×40×40 cm : 50€ · 1 départ tous les 30 jours · Livraison 45 jours
                </p>
              </div>
            </article>

            {/* Service 2 : Fret Aérien Express */}
            <article className="lg:col-span-5 bg-[#0A1F44] text-white rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="aspect-[16/9] bg-[#06132b] overflow-hidden">
                {!airImgErr ? (
                  <img
                    src={IMAGES.airCargo}
                    alt="Fret aérien express sur tarmac européen vers le Congo"
                    referrerPolicy="no-referrer"
                    onError={() => setAirImgErr(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0E5AA8]">
                    <Plane className="w-10 h-10 text-[#FFC400]" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FFC400] mb-2">
                  <Plane className="w-4 h-4" aria-hidden="true" />
                  <span>02. Aérien · Livraison 72h</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                  Fret Aérien Express
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  12€/kg (minimum 5 kg facturé). Départ garanti chaque vendredi, livraison sous
                  72h à Pointe-Noire et Brazzaville. Idéal pour vos achats en ligne et colis
                  urgents.
                </p>
                <p className="font-mono text-xs font-semibold text-[#FFC400]">
                  12€ / kg · Départ chaque vendredi
                </p>
              </div>
            </article>

            {/* Service 3 : Aide aux Achats en Ligne */}
            <article className="lg:col-span-6 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0E5AA8] mb-2">
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>03. Réception &amp; Regroupement E-commerce</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0A1F44] mb-2.5">
                Aide aux Achats en Ligne
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Commandez sur vos sites préférés et faites livrer chez nous : nous
                réceptionnons vos colis et les regroupons dans un seul envoi vers le Congo.
              </p>
              <p className="text-xs font-semibold text-[#0A1F44] leading-relaxed">
                {ONLINE_SHOPS.join(' · ')}
              </p>
            </article>

            {/* Service 4 & 5 : Collecte en Europe & Livraison à domicile au Congo */}
            <article className="lg:col-span-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0E5AA8] mb-2">
                  <Globe2 className="w-4 h-4" aria-hidden="true" />
                  <span>04. Réseau européen</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#0A1F44] mb-2.5">
                  Collecte en Europe
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Nos collaborateurs assurent la collecte de vos colis dans 5 pays d'Europe.
                </p>
              </div>
              <p className="mt-4 pt-4 border-t border-slate-200 text-xs font-semibold text-[#0A1F44]">
                {EUROPEAN_COUNTRIES.join(' · ')}
              </p>
            </article>

            <article className="lg:col-span-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0E5AA8] mb-2">
                  <Home className="w-4 h-4" aria-hidden="true" />
                  <span>05. Dernier kilomètre</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#0A1F44] mb-2.5">
                  Livraison à domicile au Congo
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  En option, nous livrons directement chez vos proches à Pointe-Noire,
                  Brazzaville, Makélékélé et Mpaka.
                </p>
              </div>
              <p className="mt-4 pt-4 border-t border-slate-200 font-mono text-xs font-semibold text-[#0A1F44]">
                Option +25€ / colis
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
