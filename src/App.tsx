/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DepartureAndTracking } from './components/DepartureAndTracking';
import { StepsAndServices } from './components/StepsAndServices';
import { LocationAndGooglePhotos } from './components/LocationAndGooglePhotos';
import { TrustGalleryAndFaq } from './components/TrustGalleryAndFaq';
import { FooterAndFloatingWhatsApp } from './components/FooterAndFloatingWhatsApp';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { trackPageView } from './lib/analytics';

function isAnalyticsHash(): boolean {
  const hash = window.location.hash.toLowerCase();
  return hash === '#analytics' || hash === '#admin';
}

export default function App() {
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(() => isAnalyticsHash());

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    const onHashChange = () => setShowAnalytics(isAnalyticsHash());
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    if (!showAnalytics) {
      void trackPageView('/');
    }
  }, [showAnalytics]);

  const openAnalytics = () => {
    window.location.hash = 'analytics';
    setShowAnalytics(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToSite = () => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setShowAnalytics(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showAnalytics) {
    return (
      <ErrorBoundary>
        <AnalyticsDashboard onBackToSite={backToSite} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0A1F44]">
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <DepartureAndTracking />
          <StepsAndServices />
          <LocationAndGooglePhotos />
          <TrustGalleryAndFaq />
        </main>
        <FooterAndFloatingWhatsApp onOpenAnalytics={openAnalytics} />
      </div>
    </ErrorBoundary>
  );
}
