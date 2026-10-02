export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const row = [...items, ...items];
  return (
    <div aria-hidden className="relative -mx-2 overflow-hidden py-3">
      <div className="-rotate-1 border-y border-wa/30 bg-gradient-to-r from-wa via-[#4be089] to-lime py-3 text-ink shadow-[0_0_60px_-10px_rgb(37_211_102_/_0.6)]">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-sm font-bold uppercase tracking-wide sm:text-base">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-8">
              {t}
              <span className="text-ink/50">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
