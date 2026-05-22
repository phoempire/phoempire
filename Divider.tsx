export const Divider = ({
  tone,
  bgColor,
  bgStart,
  bgEnd,
  solidBg,
}: {
  tone?: "cream";
  bgColor?: string;
  bgStart?: string;
  bgEnd?: string;
  solidBg?: string;
} = {}) => (
  <div
    aria-hidden
    data-bg={solidBg ? undefined : (bgColor ?? (tone === "cream" ? "hsl(var(--background))" : undefined))}
    data-bg-start={bgStart}
    data-bg-end={bgEnd}
    className="relative z-[1] w-full"
    style={solidBg ? { backgroundColor: solidBg } : undefined}
  >
    <div className="container flex items-center justify-center gap-4 py-6">
      <span className="h-px flex-1 max-w-[180px] bg-gold/40" />
      <svg viewBox="0 0 16 16" className="h-3 w-3 rotate-45 text-gold" fill="currentColor" aria-hidden>
        <rect width="16" height="16" />
      </svg>
      <span className="h-px flex-1 max-w-[180px] bg-gold/40" />
    </div>
  </div>
);
