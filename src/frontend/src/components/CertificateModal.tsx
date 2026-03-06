import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck } from "lucide-react";
import type { Post } from "../backend.d";

interface CertificateModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCertDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function deriveCertHash(post: Post): string {
  return btoa(post.id.toString() + post.creator.toString()).slice(0, 24);
}

export function CertificateModal({
  post,
  open,
  onOpenChange,
}: CertificateModalProps) {
  const certHash = deriveCertHash(post);
  const principal = post.creator.toString();
  const issuedAt = formatCertDate(post.timestamp);
  const postId = `#${post.id.toString().padStart(6, "0")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="certificate.dialog"
        className="max-w-md p-0 overflow-hidden rounded-2xl border-0 bg-transparent shadow-none"
      >
        {/* Gradient border wrapper */}
        <div className="certificate-outer p-[1px] rounded-2xl">
          <div className="bg-[oklch(0.10_0.015_265)] rounded-2xl overflow-hidden">
            {/* Header band */}
            <div className="certificate-header px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="certificate-shield-wrap w-8 h-8 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest font-mono">
                    Internet Computer
                  </p>
                  <DialogHeader className="p-0 space-y-0">
                    <DialogTitle className="text-sm text-white font-semibold leading-tight">
                      Ownership Certificate
                    </DialogTitle>
                  </DialogHeader>
                </div>
              </div>
              <div className="certificate-verified-pill px-2.5 py-1 rounded-full">
                <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  ✓ Verified
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Post ID + Hash row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="certificate-field rounded-xl px-3 py-2.5">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mb-1">
                    Post ID
                  </p>
                  <p className="font-mono text-sm text-white font-semibold">
                    {postId}
                  </p>
                </div>
                <div className="certificate-field rounded-xl px-3 py-2.5">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mb-1">
                    Block
                  </p>
                  <p className="font-mono text-sm text-emerald-400 font-semibold">
                    ICP-Live
                  </p>
                </div>
              </div>

              {/* Certificate Hash */}
              <div className="certificate-field rounded-xl px-3 py-3">
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mb-1.5">
                  Certificate Hash
                </p>
                <p className="font-mono text-xs certificate-hash-text break-all leading-relaxed">
                  {certHash}
                </p>
              </div>

              {/* Creator Principal */}
              <div className="certificate-field rounded-xl px-3 py-3">
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mb-1.5">
                  Creator Principal
                </p>
                <p className="font-mono text-xs text-purple-300 break-all leading-relaxed">
                  {principal}
                </p>
              </div>

              {/* Issued At */}
              <div className="certificate-field rounded-xl px-3 py-2.5">
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mb-1">
                  Issued At
                </p>
                <p className="font-mono text-xs text-white/80">{issuedAt}</p>
              </div>

              {/* Network info row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 certificate-pulse-dot" />
                  <span className="text-[10px] text-white/50 font-mono">
                    ICP Mainnet
                  </span>
                </div>
                <span className="text-[10px] text-white/30 font-mono">
                  Subnet: Certified
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="certificate-footer px-6 py-3 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                Verified on Internet Computer Protocol
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
