import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CgramBalanceProps {
  balance: number;
  compact?: boolean;
}

export function CgramBalance({ balance, compact = false }: CgramBalanceProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <CgramIcon size={compact ? 16 : 20} />
            <div className={compact ? "text-right" : ""}>
              {!compact && (
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-0.5">
                  CGRAM
                </div>
              )}
              <div
                className={`font-mono font-bold cgram-text ${compact ? "text-sm" : "text-xl"}`}
              >
                {balance.toLocaleString()}
                {compact && (
                  <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                    CGRAM
                  </span>
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="glass border-border/50 text-xs max-w-[200px] text-center"
        >
          <p className="font-semibold mb-1">CGRAM Token</p>
          <p className="text-muted-foreground text-[11px]">
            Earn tokens by creating posts (+10), gaining followers (+5), and
            engaging with the community. Stored on ICP blockchain.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CgramIconProps {
  size?: number;
}

export function CgramIcon({ size = 20 }: CgramIconProps) {
  const s = size;
  // Hexagonal token shape
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.44;
  const points = Array.from({ length: 6 })
    .map((_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(" ");

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cgram-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.82 0.18 85)" />
          <stop offset="50%" stopColor="oklch(0.72 0.22 60)" />
          <stop offset="100%" stopColor="oklch(0.62 0.22 45)" />
        </linearGradient>
        <linearGradient id="cgram-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.90 0.15 90)" />
          <stop offset="100%" stopColor="oklch(0.75 0.20 55)" />
        </linearGradient>
      </defs>
      <polygon points={points} fill="url(#cgram-gold)" />
      <polygon
        points={points}
        fill="none"
        stroke="oklch(0.88 0.16 80)"
        strokeWidth="0.5"
        opacity="0.6"
      />
      {/* C letter */}
      <text
        x={cx}
        y={cy + s * 0.13}
        textAnchor="middle"
        fill="url(#cgram-inner)"
        fontSize={s * 0.38}
        fontWeight="bold"
        fontFamily="JetBrains Mono, monospace"
        style={{ letterSpacing: "-0.05em" }}
      >
        C
      </text>
    </svg>
  );
}

interface CgramRewardFloatProps {
  amount?: number;
}

export function CgramRewardFloat({ amount = 2 }: CgramRewardFloatProps) {
  return (
    <div className="cgram-float-reward pointer-events-none select-none">
      <div className="flex items-center gap-1">
        <CgramIcon size={12} />
        <span className="text-xs font-mono font-bold cgram-text">
          +{amount}
        </span>
      </div>
    </div>
  );
}
