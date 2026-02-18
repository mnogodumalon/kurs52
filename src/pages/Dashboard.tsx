import { useState, useEffect } from 'react';
import { LivingAppsService } from '@/services/livingAppsService';
import { StatCard } from '@/components/StatCard';
import { DozentenTab } from '@/components/tabs/DozentenTab';
import { RaeumeTab } from '@/components/tabs/RaeumeTab';
import { TeilnehmerTab } from '@/components/tabs/TeilnehmerTab';
import { KurseTab } from '@/components/tabs/KurseTab';
import { AnmeldungenTab } from '@/components/tabs/AnmeldungenTab';
import { BookOpen, Users, GraduationCap, DoorOpen, ClipboardList, LayoutDashboard } from 'lucide-react';

type Tab = 'uebersicht' | 'kurse' | 'dozenten' | 'teilnehmer' | 'raeume' | 'anmeldungen';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'uebersicht', label: 'Übersicht', icon: <LayoutDashboard size={18} /> },
  { id: 'kurse', label: 'Kurse', icon: <BookOpen size={18} /> },
  { id: 'dozenten', label: 'Dozenten', icon: <GraduationCap size={18} /> },
  { id: 'teilnehmer', label: 'Teilnehmer', icon: <Users size={18} /> },
  { id: 'raeume', label: 'Räume', icon: <DoorOpen size={18} /> },
  { id: 'anmeldungen', label: 'Anmeldungen', icon: <ClipboardList size={18} /> },
];

function OverviewTab() {
  const [stats, setStats] = useState({ kurse: 0, dozenten: 0, teilnehmer: 0, raeume: 0, anmeldungen: 0, bezahlt: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      LivingAppsService.getKurse(),
      LivingAppsService.getDozenten(),
      LivingAppsService.getTeilnehmer(),
      LivingAppsService.getRaeume(),
      LivingAppsService.getAnmeldungen(),
    ]).then(([kurse, doz, teil, raeum, anm]) => {
      setStats({
        kurse: kurse.length,
        dozenten: doz.length,
        teilnehmer: teil.length,
        raeume: raeum.length,
        anmeldungen: anm.length,
        bezahlt: anm.filter(a => a.fields.bezahlt).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const aktiveKurse = stats.kurse;
  const offeneZahlungen = stats.anmeldungen - stats.bezahlt;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1" style={{ letterSpacing: '-0.03em' }}>Willkommen zurück</h2>
        <p style={{ color: 'hsl(237 10% 48%)' }}>Hier ist Ihre aktuelle Übersicht des Kursverwaltungssystems.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: 'hsl(237 10% 55%)' }}>Statistiken werden geladen...</div>
      ) : (
        <>
          {/* Hero stat + 4 supporting stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="lg:col-span-2">
              <StatCard
                label="Anmeldungen gesamt"
                value={stats.anmeldungen}
                sub={`${stats.bezahlt} bezahlt · ${offeneZahlungen} offen`}
                icon={<ClipboardList size={22} />}
                accent
              />
            </div>
            <StatCard
              label="Kurse"
              value={aktiveKurse}
              sub="Insgesamt angelegt"
              icon={<BookOpen size={20} />}
            />
            <StatCard
              label="Teilnehmer"
              value={stats.teilnehmer}
              sub="Registriert"
              icon={<Users size={20} />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Dozenten"
              value={stats.dozenten}
              sub="Lehrpersonal"
              icon={<GraduationCap size={20} />}
            />
            <StatCard
              label="Räume"
              value={stats.raeume}
              sub="Verfügbar"
              icon={<DoorOpen size={20} />}
            />
            <StatCard
              label="Zahlungsquote"
              value={stats.anmeldungen > 0 ? `${Math.round((stats.bezahlt / stats.anmeldungen) * 100)} %` : '—'}
              sub={`${stats.bezahlt} von ${stats.anmeldungen}`}
              icon={<ClipboardList size={20} />}
            />
          </div>

          <div className="rounded-xl p-6" style={{ background: 'var(--gradient-hero)', color: 'hsl(237 20% 92%)' }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-70">Schnellstart</div>
            <h3 className="text-lg font-bold mb-1" style={{ letterSpacing: '-0.02em', color: 'hsl(0 0% 100%)' }}>Verwalten Sie Ihr Kursprogramm</h3>
            <p className="text-sm opacity-75 max-w-lg">
              Legen Sie zunächst Ihre Dozenten und Räume an, erstellen Sie dann Kurse und nehmen Sie Anmeldungen entgegen.
              Alle Daten werden automatisch gespeichert.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('uebersicht');

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(36 20% 97%)' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ background: 'hsl(237 40% 14%)', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}
      >
        {/* Logo */}
        <div className="px-6 py-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'hsl(237 55% 50%)' }}>
              <BookOpen size={18} style={{ color: 'hsl(0 0% 100%)' }} />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ color: 'hsl(0 0% 100%)', letterSpacing: '-0.01em' }}>Kursmanager</div>
              <div className="text-xs" style={{ color: 'hsl(237 20% 65%)' }}>Verwaltungssystem</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          <div className="text-xs font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: 'hsl(237 20% 50%)' }}>Navigation</div>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: isActive ? 'hsl(237 55% 50% / 0.2)' : 'transparent',
                      color: isActive ? 'hsl(0 0% 100%)' : 'hsl(237 20% 70%)',
                      borderLeft: isActive ? '2px solid hsl(237 55% 60%)' : '2px solid transparent',
                    }}
                  >
                    <span style={{ color: isActive ? 'hsl(237 55% 70%)' : 'hsl(237 20% 55%)' }}>{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4">
          <div className="text-xs" style={{ color: 'hsl(237 20% 45%)' }}>© 2026 Kursmanager</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-8">
        {activeTab === 'uebersicht' && <OverviewTab />}
        {activeTab === 'kurse' && <KurseTab />}
        {activeTab === 'dozenten' && <DozentenTab />}
        {activeTab === 'teilnehmer' && <TeilnehmerTab />}
        {activeTab === 'raeume' && <RaeumeTab />}
        {activeTab === 'anmeldungen' && <AnmeldungenTab />}
      </main>
    </div>
  );
}
