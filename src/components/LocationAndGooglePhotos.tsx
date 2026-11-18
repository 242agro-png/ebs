/// <reference types="google.maps" />
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Star,
  Clock,
  Camera,
  X,
  Loader2,
  AlertCircle,
  Eye,
  Map as MapIcon,
  RotateCcw,
} from 'lucide-react';

const SHARE_GOOGLE_MAPS_URL = 'https://share.google/CKah9QqMZ7F8KDQFI';
const PLACE_SEARCH_QUERY = 'EBS FRET MARITIME 201 Route de Pierrelaye Herblay';
const INITIAL_VIEWPORT_CENTER = { lat: 49.0, lng: 2.16 };
const MAPS_LIBRARIES = ['places', 'marker', 'streetView'];

declare const process: { env?: { GOOGLE_MAPS_API_KEY?: string } } | undefined;

function getGoogleMapsApiKey(): string {
  const viteKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (viteKey && viteKey.trim()) return viteKey.trim();
  if (typeof process !== 'undefined' && process?.env?.GOOGLE_MAPS_API_KEY) {
    return process.env.GOOGLE_MAPS_API_KEY.trim();
  }
  return '';
}

interface PlacePhotoItem {
  url: string;
  googleMapsURI: string | null;
  attributionName: string | null;
  attributionUri: string | null;
}

interface PlaceReviewItem {
  authorName: string;
  authorUri: string | null;
  rating: number | null;
  text: string | null;
  relativeTime: string | null;
}

interface ResolvedPlaceDetails {
  id: string;
  displayName: string;
  formattedAddress: string | null;
  location: google.maps.LatLngLiteral;
  rating: number | null;
  userRatingCount: number | null;
  googleMapsURI: string | null;
  photosURI: string | null;
  reviewsURI: string | null;
  directionsURI: string | null;
  weekdayDescriptions: string[];
  photos: PlacePhotoItem[];
  reviews: PlaceReviewItem[];
}

function StreetViewPanel({ location }: { location: google.maps.LatLngLiteral }) {
  const streetViewLib = useMapsLibrary('streetView');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasStreetView, setHasStreetView] = useState<boolean | null>(null);

  useEffect(() => {
    if (!streetViewLib || !containerRef.current) return;

    let cancelled = false;
    const svService = new streetViewLib.StreetViewService();

    svService
      .getPanorama({
        location,
        radius: 120,
        source: streetViewLib.StreetViewSource.OUTDOOR,
      })
      .then((res) => {
        if (cancelled || !containerRef.current) return;
        const panoLoc = res.data?.location?.latLng;
        if (!panoLoc) {
          setHasStreetView(false);
          return;
        }
        setHasStreetView(true);
        new streetViewLib.StreetViewPanorama(containerRef.current, {
          position: panoLoc,
          pov: { heading: 180, pitch: 0 },
          zoom: 1,
          addressControl: false,
          fullscreenControl: true,
        });
      })
      .catch(() => {
        if (!cancelled) setHasStreetView(false);
      });

    return () => {
      cancelled = true;
    };
  }, [streetViewLib, location]);

  return (
    <div className="relative w-full h-full bg-slate-100">
      <div ref={containerRef} className="w-full h-full" />
      {hasStreetView === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs font-semibold text-slate-600 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#0E5AA8]" aria-hidden="true" />
          <span>Chargement Street View...</span>
        </div>
      )}
      {hasStreetView === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 p-6 text-center gap-3">
          <Camera className="w-8 h-8 text-[#0E5AA8]" aria-hidden="true" />
          <p className="text-sm font-semibold text-[#0A1F44]">
            Aperçu Street View indisponible pour cette position précise.
          </p>
          <a
            href={SHARE_GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E5AA8] hover:underline"
          >
            <span>Voir sur Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

function HerblayMapAndPlacesContent() {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const apiStatus = useApiLoadingStatus();
  const [markerRef, marker] = useAdvancedMarkerRef();

  const [placeData, setPlaceData] = useState<ResolvedPlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'map' | 'streetview'>('map');
  const [lightboxPhoto, setLightboxPhoto] = useState<PlacePhotoItem | null>(null);

  useEffect(() => {
    if (
      apiStatus === APILoadingStatus.FAILED ||
      apiStatus === APILoadingStatus.AUTH_FAILURE
    ) {
      setIsLoading(false);
      setErrorMsg('Impossible de charger Google Maps pour le moment.');
      if (apiStatus === APILoadingStatus.AUTH_FAILURE) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    }
  }, [apiStatus]);

  useEffect(() => {
    if (!placesLib) return;

    let cancelled = false;
    setIsLoading(true);
    setErrorMsg(null);

    const fetchPlace = async () => {
      try {
        const { places } = await placesLib.Place.searchByText({
          textQuery: PLACE_SEARCH_QUERY,
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'photos',
            'rating',
            'userRatingCount',
            'regularOpeningHours',
            'googleMapsURI',
            'googleMapsLinks',
            'reviews',
          ],
          language: 'fr',
          region: 'FR',
          maxResultCount: 1,
        });

        if (cancelled) return;

        const match = places?.[0];
        if (!match || !match.location) {
          setPlaceData(null);
          setErrorMsg(
            "Fiche Google Maps introuvable via la recherche. Utilisez le lien direct Google Maps ci-dessous."
          );
          setIsLoading(false);
          return;
        }

        const latLng: google.maps.LatLngLiteral = {
          lat: match.location.lat(),
          lng: match.location.lng(),
        };

        const photos: PlacePhotoItem[] = (match.photos ?? [])
          .slice(0, 6)
          .map((photo: google.maps.places.Photo) => {
            const firstAttr = photo.authorAttributions?.[0];
            return {
              url: photo.getURI({ maxWidth: 900, maxHeight: 700 }),
              googleMapsURI: photo.googleMapsURI ?? null,
              attributionName: firstAttr?.displayName ?? null,
              attributionUri: firstAttr?.uri ?? null,
            };
          });

        const reviews: PlaceReviewItem[] = (match.reviews ?? [])
          .slice(0, 3)
          .map((rev: google.maps.places.Review) => ({
            authorName: rev.authorAttribution?.displayName ?? 'Client Google',
            authorUri: rev.authorAttribution?.uri ?? null,
            rating: rev.rating ?? null,
            text: rev.text ?? rev.originalText ?? null,
            relativeTime: rev.relativePublishTimeDescription ?? null,
          }));

        const resolved: ResolvedPlaceDetails = {
          id: match.id,
          displayName: match.displayName ?? 'EBS FRET MARITIME',
          formattedAddress: match.formattedAddress ?? null,
          location: latLng,
          rating: match.rating ?? null,
          userRatingCount: match.userRatingCount ?? null,
          googleMapsURI: match.googleMapsURI ?? null,
          photosURI: match.googleMapsLinks?.photosURI ?? null,
          reviewsURI: match.googleMapsLinks?.reviewsURI ?? null,
          directionsURI: match.googleMapsLinks?.directionsURI ?? null,
          weekdayDescriptions: match.regularOpeningHours?.weekdayDescriptions ?? [],
          photos,
          reviews,
        };

        setPlaceData(resolved);
        setIsLoading(false);

        if (map) {
          map.panTo(latLng);
          map.setZoom(16);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('429') ||
          msg.includes('Quota')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setErrorMsg(
          'Impossible de récupérer les détails de la fiche Google Maps pour le moment.'
        );
        setIsLoading(false);
      }
    };

    fetchPlace();

    return () => {
      cancelled = true;
    };
  }, [placesLib, map]);

  useEffect(() => {
    if (map && placeData?.location && viewMode === 'map') {
      map.panTo(placeData.location);
      map.setZoom(16);
    }
  }, [map, placeData, viewMode]);

  const handleMarkerClick = useCallback(() => {
    setInfoOpen((prev) => !prev);
  }, []);

  const mapsPlaceLink = placeData?.googleMapsURI || SHARE_GOOGLE_MAPS_URL;
  const mapsPhotosLink = placeData?.photosURI || mapsPlaceLink;
  const mapsReviewsLink = placeData?.reviewsURI || mapsPlaceLink;
  const directionsLink =
    placeData?.directionsURI ||
    (placeData
      ? `https://www.google.com/maps/dir/?api=1&destination=${placeData.location.lat},${placeData.location.lng}&destination_place_id=${encodeURIComponent(placeData.id)}`
      : SHARE_GOOGLE_MAPS_URL);

  return (
    <div className="space-y-8">
      {/* Carte interactive / Street View + Fiche Google Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Carte Google Maps ou Street View */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {placeData && (
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-[#0A1F44] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#0A1F44]'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Carte Google Maps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('streetview')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'streetview'
                      ? 'bg-[#0E5AA8] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#0A1F44]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Street View (Façade)</span>
                </button>
              </div>

              <a
                href={mapsPhotosLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E5AA8] hover:underline whitespace-nowrap"
              >
                <Camera className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Photos Google Maps</span>
              </a>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-[360px] sm:h-[440px] relative">
            {viewMode === 'streetview' && placeData ? (
              <StreetViewPanel location={placeData.location} />
            ) : (
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={INITIAL_VIEWPORT_CENTER}
                defaultZoom={11}
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {placeData && (
                  <>
                    <AdvancedMarker
                      ref={markerRef}
                      position={placeData.location}
                      title={placeData.displayName}
                      onClick={handleMarkerClick}
                    >
                      <Pin
                        background="#FFC400"
                        borderColor="#0A1F44"
                        glyphColor="#0A1F44"
                        scale={1.2}
                      />
                    </AdvancedMarker>

                    {infoOpen && marker && (
                      <InfoWindow
                        anchor={marker}
                        maxWidth={260}
                        onCloseClick={() => setInfoOpen(false)}
                      >
                        <div className="p-1 text-[#0A1F44] space-y-1">
                          <p className="font-display font-bold text-sm">
                            {placeData.displayName}
                          </p>
                          {placeData.formattedAddress && (
                            <p className="text-xs text-slate-600">
                              {placeData.formattedAddress}
                            </p>
                          )}
                          <a
                            href={directionsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E5AA8] hover:underline pt-1"
                          >
                            <span>Itinéraire Google Maps</span>
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        </div>
                      </InfoWindow>
                    )}
                  </>
                )}
              </GoogleMap>
            )}

            {isLoading && (
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-[#0A1F44] shadow-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E5AA8]" aria-hidden="true" />
                <span>Localisation Google Maps en cours...</span>
              </div>
            )}
          </div>
        </div>

        {/* Panneau d'informations Google Maps */}
        <div className="lg:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#0E5AA8] mb-1">
                  Fiche Google Maps vérifiée
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#0A1F44]">
                  {placeData?.displayName || 'EBS FRET MARITIME'}
                </h3>
              </div>

              {placeData?.rating != null && (
                <a
                  href={mapsReviewsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-right shrink-0 group"
                >
                  <div className="inline-flex items-center gap-1 font-mono text-base font-bold text-[#0A1F44] tabular-nums">
                    <Star
                      className="w-4 h-4 text-[#FFC400] fill-[#FFC400]"
                      aria-hidden="true"
                    />
                    <span>{placeData.rating.toFixed(1)}</span>
                  </div>
                  {placeData.userRatingCount != null && (
                    <p className="text-[11px] text-[#0E5AA8] group-hover:underline tabular-nums">
                      {placeData.userRatingCount} avis Google
                    </p>
                  )}
                </a>
              )}
            </div>

            {errorMsg && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0E5AA8] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {placeData?.formattedAddress ||
                    '201 Route de Pierrelaye, 95220 Herblay, France'}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#0E5AA8] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#0A1F44]">
                    Dépôt des colis : Samedi &amp; Dimanche 10h30 - 17h30
                  </p>
                  {placeData && placeData.weekdayDescriptions.length > 0 && (
                    <details className="text-xs text-slate-600">
                      <summary className="cursor-pointer font-medium text-[#0E5AA8] hover:underline">
                        Voir les horaires Google Maps
                      </summary>
                      <ul className="mt-1.5 space-y-0.5">
                        {placeData.weekdayDescriptions.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </div>

            {/* Avis Google Maps récents si retournés par l'API */}
            {placeData && placeData.reviews.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <p className="text-xs font-semibold text-slate-500">
                  Derniers avis Google Maps
                </p>
                {placeData.reviews.slice(0, 2).map((rev, idx) => (
                  <div
                    key={`${rev.authorName}-${idx}`}
                    className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {rev.authorUri ? (
                        <a
                          href={rev.authorUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#0A1F44] hover:underline"
                        >
                          {rev.authorName}
                        </a>
                      ) : (
                        <span className="font-bold text-[#0A1F44]">{rev.authorName}</span>
                      )}
                      {rev.rating != null && (
                        <span className="inline-flex items-center gap-0.5 font-mono font-semibold text-[#0A1F44]">
                          <Star
                            className="w-3 h-3 text-[#FFC400] fill-[#FFC400]"
                            aria-hidden="true"
                          />
                          {rev.rating}
                        </span>
                      )}
                    </div>
                    {rev.text && (
                      <p className="text-slate-600 line-clamp-2">{rev.text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-5 mt-5 border-t border-slate-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={directionsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 bg-[#0A1F44] hover:bg-[#0E5AA8] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap"
              >
                <Navigation className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Itinéraire GPS</span>
              </a>

              <a
                href={mapsPlaceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 bg-white hover:bg-slate-100 text-[#0A1F44] border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4 shrink-0 text-[#0E5AA8]" aria-hidden="true" />
                <span>Page Google Maps</span>
              </a>
            </div>

            <a
              href={mapsPhotosLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-[#FFC400]/20 hover:bg-[#FFC400]/35 text-[#0A1F44] font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap"
            >
              <Camera className="w-4 h-4 shrink-0 text-[#0A1F44]" aria-hidden="true" />
              <span>Voir les photos sur la fiche Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Galerie des photos issues de la fiche Google Maps (si retournées par l'API Places) */}
      {placeData && placeData.photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#0E5AA8]" aria-hidden="true" />
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0A1F44]">
                Photos de notre agence sur Google Maps
              </h3>
            </div>
            <a
              href={mapsPhotosLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0E5AA8] hover:underline"
            >
              <span>Voir toutes les photos sur Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {placeData.photos.map((photo, idx) => (
              <figure
                key={`${photo.url}-${idx}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(photo)}
                  className="aspect-[4/3] w-full bg-slate-100 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={photo.url}
                    alt={`Photo Google Maps ${idx + 1} de ${placeData.displayName}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                </button>
                <figcaption className="px-4 py-2.5 text-[11px] text-slate-500 flex items-center justify-between gap-2">
                  <span className="truncate">
                    {photo.attributionName ? (
                      <>
                        Photo Google Maps ·{' '}
                        {photo.attributionUri ? (
                          <a
                            href={photo.attributionUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#0A1F44]"
                          >
                            {photo.attributionName}
                          </a>
                        ) : (
                          photo.attributionName
                        )}
                      </>
                    ) : (
                      'Photo Google Maps'
                    )}
                  </span>
                  {photo.googleMapsURI && (
                    <a
                      href={photo.googleMapsURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0E5AA8] font-semibold hover:underline shrink-0"
                    >
                      Source
                    </a>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox modale pour agrandir une photo Google Maps */}
      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu photo Google Maps"
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              aria-label="Fermer l'aperçu"
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt="Photo Google Maps EBS FRET MARITIME"
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="px-5 py-3 flex items-center justify-between gap-4 text-xs text-slate-600">
              <span>
                {lightboxPhoto.attributionName
                  ? `Crédit photo Google Maps : ${lightboxPhoto.attributionName}`
                  : 'Photo Google Maps — EBS FRET MARITIME'}
              </span>
              <a
                href={lightboxPhoto.googleMapsURI || mapsPlaceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#0E5AA8] hover:underline"
              >
                <span>Ouvrir dans Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LocationAndGooglePhotos() {
  const apiKey = getGoogleMapsApiKey();
  const [providerLoadError, setProviderLoadError] = useState(false);
  const [retrySeed, setRetrySeed] = useState(0);

  const handleApiError = useCallback(() => {
    setProviderLoadError(true);
  }, []);

  const handleRetry = () => {
    setProviderLoadError(false);
    setRetrySeed((prev) => prev + 1);
  };

  return (
    <section
      id="localisation"
      className="bg-white py-14 sm:py-18 border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-[#0E5AA8] mb-2">
            Localisation &amp; Fiche Google Maps
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44]"
            style={{ textWrap: 'balance' }}
          >
            Nous trouver à Herblay et voir notre fiche Google Maps
          </h2>
        </div>

        {apiKey && !providerLoadError ? (
          <APIProvider
            key={retrySeed}
            apiKey={apiKey}
            libraries={MAPS_LIBRARIES}
            language="fr"
            region="FR"
            onError={handleApiError}
          >
            <HerblayMapAndPlacesContent />
          </APIProvider>
        ) : (
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-[#0A1F44]">
                EBS FRET MARITIME — 201 Route de Pierrelaye, 95220 Herblay
              </h3>
              <p className="text-sm text-slate-600 max-w-2xl">
                {providerLoadError
                  ? "La carte interactive n'a pas pu se charger dans ce navigateur. Vous pouvez réessayer ou ouvrir directement notre fiche officielle sur Google Maps."
                  : 'Consultez notre localisation exacte, nos horaires, les avis clients et les photos directement sur notre page Google Maps.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {providerLoadError && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 bg-white hover:bg-slate-100 text-[#0A1F44] border border-slate-300 font-bold text-sm rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Réessayer</span>
                </button>
              )}
              <a
                href={SHARE_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 bg-[#0E5AA8] hover:bg-[#0A1F44] text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap"
              >
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Ouvrir la page Google Maps</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
