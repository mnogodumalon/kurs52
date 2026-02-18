interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: boolean;
}

export function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 flex items-start gap-4"
      style={{
        background: accent
          ? 'var(--gradient-primary)'
          : 'var(--surface-elevated)',
        boxShadow: accent ? 'var(--shadow-elegant)' : 'var(--shadow-sm)',
        border: accent ? 'none' : '1px solid hsl(237 15% 88%)',
        color: accent ? 'hsl(0 0% 100%)' : 'inherit',
      }}
    >
      <div
        className="rounded-lg p-2.5 flex-shrink-0"
        style={{
          background: accent ? 'hsl(0 0% 100% / 0.15)' : 'hsl(237 20% 94%)',
          color: accent ? 'hsl(0 0% 100%)' : 'hsl(237 55% 36%)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div
          className="text-xs font-medium uppercase tracking-widest mb-1"
          style={{ opacity: accent ? 0.75 : undefined, color: accent ? undefined : 'hsl(237 10% 48%)' }}
        >
          {label}
        </div>
        <div className="text-2xl font-bold leading-none" style={{ letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {sub && (
          <div className="text-xs mt-1" style={{ opacity: accent ? 0.7 : undefined, color: accent ? undefined : 'hsl(237 10% 55%)' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
