import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ShieldCheck } from "lucide-react";

export function IcpBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${className}`}
      title="ICP Verified Identity"
    >
      <ShieldCheck
        className="w-3.5 h-3.5"
        style={{
          stroke: "url(#shield-grad)",
        }}
        aria-label="ICP Verified"
      />
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
        focusable="false"
      >
        <title>Gradient definitions</title>
        <defs>
          <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.58 0.24 298)" />
            <stop offset="100%" stopColor="oklch(0.74 0.18 200)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="verified-badge">ICP</span>
    </span>
  );
}

// Seed set of demo verified principals
export const VERIFIED_PRINCIPALS = new Set([
  "2vxsx-fae",
  "aaaaa-aa",
  "rrkah-fqaaa",
  "rdmx6-jaaaa",
]);

interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className = "" }: VerifiedBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`verified-creator-badge cursor-default ${className}`}
            aria-label="Verified Creator on ICP"
          >
            <Check
              className="w-2.5 h-2.5 text-white"
              strokeWidth={3}
              aria-hidden="true"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="glass border-border/50 text-xs px-2.5 py-1.5"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-primary" />
            <span>Verified Creator on ICP</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
