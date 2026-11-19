import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import {
  ArrowLeft,
  BarChart3,
  Download,
  Eye,
  Globe,
  LogIn,
  LogOut,
  Monitor,
  MousePointerClick,
  ShieldAlert,
  Smartphone,
  Users,
} from 'lucide-react';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

type PeriodFilter = 'today' | '7d' | '30d' | 'all';

interface PageViewRecord {
  id: string;
  visitorId: string;
  sessionId: string;
  path: string;
  country: string;
  countryCode: string;
  city: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  referrerDomain: string;
  utmSource: string;
  language: string;
  timezone: string;
  screenWidth: number;
  createdAtMs: number;
}

interface AnalyticsEventRecord {
  id: string;
  visitorId: string;
  sessionId: string;
  eventType: string;
  mode: string;
  destination: string;
  parcelCount: number;
  estimatedAmountEur: number;
  country: string;
  countryCode: string;
  deviceType: string;
  label: string;
  createdAtMs: number;
}

interface AnalyticsDashboardProps {
  onBackToSite: () => void;
}

const EVENT_LABELS: Record<string, string> = {
  quote_whatsapp_click: 'Devis WhatsApp (Simulateur)',
  whatsapp_direct_click: 'Clic WhatsApp direct',
  facebook_click: 'Clic Page Facebook',
  simulator_interact: 'Utilisation Simulateur',
  tracking_lookup: 'Vérification suivi colis',
  maps_click: 'Itinéraire Google Maps',
};

function toMillis(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'seconds' in val) {
    const secs = Number((val as { seconds: number }).seconds);
    return Number.isFinite(secs) ? secs * 1000 : Date.now();
  }
  return Date.now();
}

function getPeriodCutoff(period: PeriodFilter): number {
  const now = new Date();
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  if (period === '7d') {
    return Date.now() - 7 * 24 * 60 * 60 * 1000;
  }
  if (period === '30d') {
    return Date.now() - 30 * 24 * 60 * 60 * 1000;
  }
  return 0;
}

function countBy<T>(items: T[], getKey: (item: T) => string): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = getKey(item) || 'Inconnu';
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function formatDateTimeFr(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}

export function AnalyticsDashboard({ onBackToSite }: AnalyticsDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [views, setViews] = useState<PageViewRecord[]>([]);
  const [events, setEvents] = useState<AnalyticsEventRecord[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      setPermissionDenied(false);
      setAuthError('');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) {
      setViews([]);
      setEvents([]);
      return;
    }

    setLoadingData(true);
    setPermissionDenied(false);

    const viewsQuery = query(
      collection(db, 'page_views'),
      orderBy('createdAt', 'desc'),
      limit(1000)
    );
    const eventsQuery = query(
      collection(db, 'analytics_events'),
      orderBy('createdAt', 'desc'),
      limit(1000)
    );

    const unsubViews = onSnapshot(
      viewsQuery,
      (snapshot) => {
        const next: PageViewRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            visitorId: String(data.visitorId || ''),
            sessionId: String(data.sessionId || ''),
            path: String(data.path || '/'),
            country: String(data.country || 'International'),
            countryCode: String(data.countryCode || 'XX'),
            city: String(data.city || 'Inconnue'),
            deviceType: (data.deviceType as 'mobile' | 'tablet' | 'desktop') || 'desktop',
            browser: String(data.browser || 'Autre'),
            os: String(data.os || 'Autre'),
            referrerDomain: String(data.referrerDomain || 'direct'),
            utmSource: String(data.utmSource || 'none'),
            language: String(data.language || 'fr-FR'),
            timezone: String(data.timezone || 'UTC'),
            screenWidth: Number(data.screenWidth || 0),
            createdAtMs: toMillis(data.createdAt),
          };
        });
        setViews(next);
        setLoadingData(false);
      },
      (error) => {
        setLoadingData(false);
        if (error.code === 'permission-denied') {
          setPermissionDenied(true);
        }
        try {
          handleFirestoreError(error, OperationType.LIST, 'page_views');
        } catch {
          // Logged via handleFirestoreError
        }
      }
    );

    const unsubEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const next: AnalyticsEventRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            visitorId: String(data.visitorId || ''),
            sessionId: String(data.sessionId || ''),
            eventType: String(data.eventType || ''),
            mode: String(data.mode || 'none'),
            destination: String(data.destination || 'none'),
            parcelCount: Number(data.parcelCount || 0),
            estimatedAmountEur: Number(data.estimatedAmountEur || 0),
            country: String(data.country || 'International'),
            countryCode: String(data.countryCode || 'XX'),
            deviceType: String(data.deviceType || 'desktop'),
            label: String(data.label || ''),
            createdAtMs: toMillis(data.createdAt),
          };
        });
        setEvents(next);
      },
      (error) => {
        if (error.code === 'permission-denied') {
          setPermissionDenied(true);
        }
        try {
          handleFirestoreError(error, OperationType.LIST, 'analytics_events');
        } catch {
          // Logged via handleFirestoreError
        }
      }
    );

    return () => {
      unsubViews();
      unsubEvents();
    };
  }, [authReady, user]);

  const handleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch {
      setAuthError('Connexion interrompue ou bloquée par le navigateur.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const cutoff = useMemo(() => getPeriodCutoff(period), [period]);

  const filteredViews = useMemo(
    () => views.filter((v) => v.createdAtMs >= cutoff),
    [views, cutoff]
  );

  const filteredEvents = useMemo(
    () => events.filter((e) => e.createdAtMs >= cutoff),
    [events, cutoff]
  );

  const metrics = useMemo(() => {
    const todayStart = getPeriodCutoff('today');
    const viewsToday = views.filter((v) => v.createdAtMs >= todayStart).length;
    const uniqueVisitors = new Set(filteredViews.map((v) => v.visitorId)).size;
    const uniqueSessions = new Set(filteredViews.map((v) => v.sessionId)).size;

    const conversionEvents = filteredEvents.filter(
      (e) => e.eventType !== 'simulator_interact'
    );
    const quoteClicks = filteredEvents.filter(
      (e) => e.eventType === 'quote_whatsapp_click'
    ).length;
    const conversionRate =
      filteredViews.length > 0
        ? Math.round((conversionEvents.length / filteredViews.length) * 1000) / 10
        : 0;

    // Country aggregation with ISO code lookup
    const countryMap = new Map<string, { country: string; code: string; count: number }>();
    for (const v of filteredViews) {
      const existing = countryMap.get(v.country);
      if (existing) {
        existing.count += 1;
      } else {
        countryMap.set(v.country, {
          country: v.country,
          code: v.countryCode || 'XX',
          count: 1,
        });
      }
    }
    const countries = Array.from(countryMap.values()).sort((a, b) => b.count - a.count);

    const cities = countBy(
      filteredViews.filter((v) => v.city && v.city !== 'Inconnue'),
      (v) => `${v.city} (${v.countryCode})`
    ).slice(0, 6);

    const devices = countBy(filteredViews, (v) => v.deviceType);
    const browsers = countBy(filteredViews, (v) => v.browser).slice(0, 5);
    const osList = countBy(filteredViews, (v) => v.os).slice(0, 5);
    const sources = countBy(filteredViews, (v) =>
      v.utmSource !== 'none' ? `utm:${v.utmSource}` : v.referrerDomain
    ).slice(0, 6);

    const eventCounts = countBy(filteredEvents, (e) => e.eventType);

    const quoteEvents = filteredEvents.filter(
      (e) => e.eventType === 'quote_whatsapp_click' || e.eventType === 'simulator_interact'
    );
    const maritimeDemand = quoteEvents.filter((e) => e.mode === 'maritime').length;
    const airDemand = quoteEvents.filter((e) => e.mode === 'air').length;
    const pointeNoireDemand = quoteEvents.filter((e) => e.destination === 'Pointe-Noire').length;
    const brazzavilleDemand = quoteEvents.filter((e) => e.destination === 'Brazzaville').length;

    // Daily trend for the last 14 days
    const daysCount = period === 'today' ? 1 : period === '7d' ? 7 : 14;
    const dailySeries: { label: string; views: number; actions: number }[] = [];
    for (let i = daysCount - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const dayViews = filteredViews.filter(
        (v) => v.createdAtMs >= start && v.createdAtMs < end
      ).length;
      const dayActions = conversionEvents.filter(
        (e) => e.createdAtMs >= start && e.createdAtMs < end
      ).length;
      const label = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      }).format(d);
      dailySeries.push({ label, views: dayViews, actions: dayActions });
    }

    return {
      totalViews: filteredViews.length,
      viewsToday,
      uniqueVisitors,
      uniqueSessions,
      totalActions: conversionEvents.length,
      quoteClicks,
      conversionRate,
      countries,
      cities,
      devices,
      browsers,
      osList,
      sources,
      eventCounts,
      maritimeDemand,
      airDemand,
      pointeNoireDemand,
      brazzavilleDemand,
      dailySeries,
    };
  }, [views, filteredViews, filteredEvents, period]);

  const handleExportCsv = () => {
    const header = [
      'Date',
      'Pays',
      'Code',
      'Ville',
      'Appareil',
      'Navigateur',
      'OS',
      'Source',
      'UTM',
      'Langue',
      'Page',
    ];
    const rows = filteredViews.map((v) => [
      new Date(v.createdAtMs).toISOString(),
      v.country,
      v.countryCode,
      v.city,
      v.deviceType,
      v.browser,
      v.os,
      v.referrerDomain,
      v.utmSource,
      v.language,
      v.path,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebs-fret-metriques-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxDailyViews = Math.max(1, ...metrics.dailySeries.map((d) => d.views));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1F44]">
      {/* Top Bar */}
      <header className="bg-[#0A1F44] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Retour au site</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 border-l border-white/15 pl-3">
              <BarChart3 className="w-4 h-4 text-[#FFC400]" aria-hidden="true" />
              <span className="font-display font-bold text-sm">
                EBS FRET MARITIME · Analytics
              </span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-xs text-slate-300">
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {!authReady ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-600">
            Chargement de l&apos;espace statistiques...
          </div>
        ) : !user ? (
          <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#0A1F44] text-[#FFC400] flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-extrabold text-[#0A1F44]">
                Tableau de bord des métriques
              </h1>
              <p className="text-sm text-slate-600">
                Connectez-vous avec le compte Google administrateur pour consulter les vues, pays, appareils et conversions en temps réel.
              </p>
            </div>

            {authError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            <button
              type="button"
              onClick={handleSignIn}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 bg-[#0E5AA8] hover:bg-[#0A1F44] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Se connecter avec Google</span>
            </button>
          </div>
        ) : permissionDenied ? (
          <div className="max-w-lg mx-auto bg-white border border-amber-200 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="font-display text-xl font-extrabold text-[#0A1F44]">
              Accès réservé à l&apos;administrateur EBS
            </h1>
            <p className="text-sm text-slate-600">
              Le compte <strong className="text-[#0A1F44]">{user.email}</strong> n&apos;est pas autorisé à consulter les statistiques privées du site.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A1F44] text-white font-bold text-sm rounded-xl cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Changer de compte</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header + Filtres période + Export CSV */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#0E5AA8] mb-1">
                  Suivi en temps réel
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44]">
                  Audience &amp; Conversions EBS FRET MARITIME
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                  {(
                    [
                      { id: 'today', label: "Aujourd'hui" },
                      { id: '7d', label: '7 jours' },
                      { id: '30d', label: '30 jours' },
                      { id: 'all', label: 'Tout' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPeriod(item.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        period === item.id
                          ? 'bg-[#0A1F44] text-white'
                          : 'text-slate-600 hover:text-[#0A1F44]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={filteredViews.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-[#0E5AA8] disabled:opacity-50 text-xs font-bold text-[#0A1F44] rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#0E5AA8]" aria-hidden="true" />
                  <span>Exporter CSV</span>
                </button>
              </div>
            </div>

            {loadingData && views.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-600">
                Synchronisation des métriques en cours...
              </div>
            ) : (
              <>
                {/* 4 KPI Principaux */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Nombre de vues</span>
                      <Eye className="w-4 h-4 text-[#0E5AA8]" aria-hidden="true" />
                    </div>
                    <p className="font-display text-3xl font-extrabold text-[#0A1F44] tabular-nums mt-2">
                      {metrics.totalViews}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Dont <strong className="text-[#0A1F44]">{metrics.viewsToday}</strong> aujourd&apos;hui
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Visiteurs uniques</span>
                      <Users className="w-4 h-4 text-[#0E5AA8]" aria-hidden="true" />
                    </div>
                    <p className="font-display text-3xl font-extrabold text-[#0A1F44] tabular-nums mt-2">
                      {metrics.uniqueVisitors}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {metrics.uniqueSessions} session{metrics.uniqueSessions > 1 ? 's' : ''} enregistrée{metrics.uniqueSessions > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Actions &amp; Devis</span>
                      <MousePointerClick className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                    </div>
                    <p className="font-display text-3xl font-extrabold text-[#0A1F44] tabular-nums mt-2">
                      {metrics.totalActions}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {metrics.quoteClicks} devis WhatsApp · Taux {metrics.conversionRate}%
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Pays détectés</span>
                      <Globe className="w-4 h-4 text-[#FFC400]" aria-hidden="true" />
                    </div>
                    <p className="font-display text-3xl font-extrabold text-[#0A1F44] tabular-nums mt-2">
                      {metrics.countries.length}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {metrics.countries[0]
                        ? `N°1 : ${metrics.countries[0].country} (${metrics.countries[0].count})`
                        : 'En attente de visites'}
                    </p>
                  </div>
                </div>

                {/* Évolution quotidienne + Pays */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Graphique d'évolution */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-display text-lg font-bold text-[#0A1F44]">
                          Évolution des vues par jour
                        </h2>
                        <p className="text-xs text-slate-500">
                          Vues (bleu) et clics de conversion (jaune)
                        </p>
                      </div>
                    </div>

                    <div className="h-52 flex items-end gap-2 pt-4 border-b border-slate-200">
                      {metrics.dailySeries.map((day) => {
                        const viewPct = Math.max(4, Math.round((day.views / maxDailyViews) * 100));
                        const actionPct =
                          day.actions > 0
                            ? Math.max(6, Math.round((day.actions / maxDailyViews) * 100))
                            : 0;
                        return (
                          <div
                            key={day.label}
                            className="flex-1 flex flex-col items-center justify-end h-full gap-1 group"
                            title={`${day.label} : ${day.views} vues, ${day.actions} conversions`}
                          >
                            <span className="text-[10px] font-mono font-bold text-slate-600 tabular-nums">
                              {day.views > 0 ? day.views : ''}
                            </span>
                            <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36">
                              <div
                                className="flex-1 bg-[#0E5AA8] rounded-t-md transition-all"
                                style={{ height: `${day.views > 0 ? viewPct : 3}%`, opacity: day.views > 0 ? 1 : 0.2 }}
                              />
                              {actionPct > 0 && (
                                <div
                                  className="w-2 bg-[#FFC400] rounded-t-md"
                                  style={{ height: `${actionPct}%` }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 overflow-x-auto">
                      {metrics.dailySeries.map((day) => (
                        <span
                          key={day.label}
                          className="flex-1 text-center text-[10px] font-mono text-slate-500 whitespace-nowrap"
                        >
                          {day.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Répartition par Pays & Villes */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                    <div>
                      <h2 className="font-display text-lg font-bold text-[#0A1F44]">
                        Visiteurs par Pays
                      </h2>
                      <p className="text-xs text-slate-500">
                        Provenance géographique des visiteurs
                      </p>
                    </div>

                    {metrics.countries.length === 0 ? (
                      <p className="text-sm text-slate-500 py-6 text-center">
                        Aucune donnée géographique sur cette période.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {metrics.countries.slice(0, 7).map((item) => {
                          const pct =
                            metrics.totalViews > 0
                              ? Math.round((item.count / metrics.totalViews) * 100)
                              : 0;
                          return (
                            <div key={item.country} className="space-y-1">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="font-semibold text-[#0A1F44] flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-[#0E5AA8]">
                                    {item.code}
                                  </span>
                                  <span>{item.country}</span>
                                </span>
                                <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">
                                  {item.count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-[#0E5AA8] rounded-full"
                                  style={{ width: `${Math.max(4, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {metrics.cities.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 mb-2">
                          Principales villes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {metrics.cities.map((c) => (
                            <span
                              key={c.key}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-[#0A1F44]"
                            >
                              <span>{c.key}</span>
                              <strong className="font-mono text-[#0E5AA8]">{c.count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appareils, Sources & Conversions Simulateur */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Appareils / Navigateurs / OS */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#0E5AA8]" aria-hidden="true" />
                      <h2 className="font-display text-base font-bold text-[#0A1F44]">
                        Appareils &amp; Navigateurs
                      </h2>
                    </div>

                    <div className="space-y-2.5">
                      {metrics.devices.map((d) => {
                        const pct =
                          metrics.totalViews > 0
                            ? Math.round((d.count / metrics.totalViews) * 100)
                            : 0;
                        const label =
                          d.key === 'mobile'
                            ? 'Mobile'
                            : d.key === 'tablet'
                              ? 'Tablette'
                              : 'Ordinateur';
                        return (
                          <div key={d.key} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#0A1F44] flex items-center gap-1.5">
                              {d.key === 'mobile' ? (
                                <Smartphone className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                              ) : (
                                <Monitor className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                              )}
                              <span>{label}</span>
                            </span>
                            <span className="font-mono font-bold text-slate-700">
                              {d.count} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-500 mb-1.5">Navigateurs</p>
                        <ul className="space-y-1">
                          {metrics.browsers.map((b) => (
                            <li key={b.key} className="flex justify-between text-slate-700">
                              <span>{b.key}</span>
                              <strong className="font-mono">{b.count}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold text-slate-500 mb-1.5">Systèmes</p>
                        <ul className="space-y-1">
                          {metrics.osList.map((o) => (
                            <li key={o.key} className="flex justify-between text-slate-700">
                              <span>{o.key}</span>
                              <strong className="font-mono">{o.count}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Sources de trafic */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h2 className="font-display text-base font-bold text-[#0A1F44]">
                      Sources de trafic
                    </h2>
                    {metrics.sources.length === 0 ? (
                      <p className="text-xs text-slate-500">Aucune visite enregistrée.</p>
                    ) : (
                      <div className="space-y-3">
                        {metrics.sources.map((s) => {
                          const pct =
                            metrics.totalViews > 0
                              ? Math.round((s.count / metrics.totalViews) * 100)
                              : 0;
                          return (
                            <div key={s.key} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#0A1F44] truncate pr-2">
                                  {s.key === 'direct' ? 'Accès direct' : s.key}
                                </span>
                                <span className="font-mono font-bold text-slate-700 shrink-0">
                                  {s.count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-[#FFC400] rounded-full"
                                  style={{ width: `${Math.max(4, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Conversions & Demande Fret */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h2 className="font-display text-base font-bold text-[#0A1F44]">
                      Conversions &amp; Intérêts Fret
                    </h2>
                    <div className="space-y-2">
                      {metrics.eventCounts.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          Aucune action enregistrée sur cette période.
                        </p>
                      ) : (
                        metrics.eventCounts.map((ev) => (
                          <div
                            key={ev.key}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                          >
                            <span className="text-slate-700 font-medium">
                              {EVENT_LABELS[ev.key] || ev.key}
                            </span>
                            <strong className="font-mono text-[#0A1F44]">{ev.count}</strong>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#F8FAFC] rounded-xl p-3">
                        <p className="text-slate-500 font-semibold mb-1">Mode demandé</p>
                        <p className="text-[#0A1F44]">
                          Maritime : <strong className="font-mono">{metrics.maritimeDemand}</strong>
                        </p>
                        <p className="text-[#0A1F44]">
                          Aérien : <strong className="font-mono">{metrics.airDemand}</strong>
                        </p>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-xl p-3">
                        <p className="text-slate-500 font-semibold mb-1">Destination</p>
                        <p className="text-[#0A1F44]">
                          Pointe-Noire :{' '}
                          <strong className="font-mono">{metrics.pointeNoireDemand}</strong>
                        </p>
                        <p className="text-[#0A1F44]">
                          Brazzaville :{' '}
                          <strong className="font-mono">{metrics.brazzavilleDemand}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journal des visites récentes */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-[#0A1F44]">
                      Dernières visites enregistrées
                    </h2>
                    <span className="text-xs text-slate-500">
                      {Math.min(25, filteredViews.length)} dernières sur {filteredViews.length}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 font-bold">Date &amp; heure</th>
                          <th className="py-3 px-4 font-bold">Pays &amp; Ville</th>
                          <th className="py-3 px-4 font-bold">Appareil</th>
                          <th className="py-3 px-4 font-bold">Navigateur / OS</th>
                          <th className="py-3 px-4 font-bold">Source</th>
                          <th className="py-3 px-4 font-bold">Langue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredViews.slice(0, 25).map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {formatDateTimeFr(v.createdAtMs)}
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-[#0A1F44] whitespace-nowrap">
                              <span className="inline-block px-1.5 py-0.5 mr-1.5 rounded bg-slate-100 font-mono text-[10px] text-[#0E5AA8]">
                                {v.countryCode}
                              </span>
                              {v.country}
                              {v.city && v.city !== 'Inconnue' ? ` · ${v.city}` : ''}
                            </td>
                            <td className="py-2.5 px-4 text-slate-700 capitalize">
                              {v.deviceType}
                            </td>
                            <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
                              {v.browser} / {v.os}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">
                              {v.utmSource !== 'none'
                                ? `utm:${v.utmSource}`
                                : v.referrerDomain === 'direct'
                                  ? 'Accès direct'
                                  : v.referrerDomain}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-slate-600">
                              {v.language}
                            </td>
                          </tr>
                        ))}
                        {filteredViews.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
                              Aucune visite enregistrée pour cette période.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
