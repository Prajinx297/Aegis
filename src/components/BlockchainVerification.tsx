/**
 * AEGIS — Blockchain Verification Panel
 *
 * Displays on-chain proof of asset registration:
 *   - Transaction hash with Etherscan link
 *   - Block number and timestamp
 *   - Chain hash verification status
 *   - Visual chain representation
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2,
  Lock,
  Shield,
} from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import type { AssetRecord } from "@/lib/types";

interface BlockchainVerificationProps {
  asset: AssetRecord;
}

export function BlockchainVerification({ asset }: BlockchainVerificationProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const isAnchored = asset.status === "Anchored";
  const hasChainHash = asset.chainHash?.startsWith("0x");

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-aegis-card transition-all",
        isAnchored
          ? "border-emerald-500/30"
          : "border-aegis-border",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-xl p-2.5",
              isAnchored ? "bg-emerald-500/10" : "bg-aegis-border/30",
            )}
          >
            <Link2
              className={cn(
                "h-5 w-5",
                isAnchored ? "text-emerald-400" : "text-aegis-muted",
              )}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Blockchain Verification
            </h3>
            <p className="mt-0.5 text-[10px] text-aegis-muted">
              Ethereum Sepolia Testnet
            </p>
          </div>
        </div>

        <div
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold tracking-wider",
            isAnchored
              ? "bg-emerald-500/15 text-emerald-400"
              : asset.status === "Protected"
                ? "bg-amber-500/15 text-amber-400"
                : "bg-aegis-border/30 text-aegis-muted",
          )}
        >
          {isAnchored ? "ON-CHAIN" : asset.status.toUpperCase()}
        </div>
      </div>

      {/* Visual chain */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2">
          {/* Chain blocks visualization */}
          {["SHA-256", "pHash", "Chain Hash", "Certificate"].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15, type: "spring" }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium",
                    isAnchored || i < 2
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                      : "border-aegis-border/50 bg-white/[0.02] text-aegis-muted",
                  )}
                >
                  {(isAnchored || i < 2) && (
                    <CheckCircle className="h-2.5 w-2.5" />
                  )}
                  {step}
                </motion.div>
                {i < 3 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 16 }}
                    transition={{ delay: i * 0.15 + 0.1 }}
                    className={cn(
                      "h-px",
                      isAnchored
                        ? "bg-emerald-500/40"
                        : "bg-aegis-border/40",
                    )}
                  />
                )}
              </div>
            ),
          )}
        </div>

        {/* Hash details */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-aegis-border/30 bg-white/[0.02] py-1.5 text-[10px] text-aegis-muted transition hover:bg-white/[0.04]"
        >
          {expanded ? "Hide" : "Show"} Hash Details
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2.5">
                <HashRow
                  label="SHA-256"
                  value={asset.sha256}
                  copied={copied}
                  onCopy={copyToClipboard}
                />
                <HashRow
                  label="pHash"
                  value={asset.phash}
                  copied={copied}
                  onCopy={copyToClipboard}
                />
                <HashRow
                  label="Chain Hash"
                  value={asset.chainHash}
                  copied={copied}
                  onCopy={copyToClipboard}
                  isLink={hasChainHash}
                />
                <HashRow
                  label="Certificate"
                  value={asset.certificateId}
                  copied={copied}
                  onCopy={copyToClipboard}
                />
              </div>

              {/* Integrity checksum */}
              <div className="mt-3 rounded-lg border border-aegis-border/20 bg-aegis-surface/50 p-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-aegis-primary" />
                  <span className="text-[10px] font-medium text-aegis-text">
                    Integrity Verification
                  </span>
                </div>
                <p className="mt-1 text-[9px] leading-relaxed text-aegis-muted">
                  {isAnchored
                    ? `This asset's SHA-256 fingerprint has been permanently anchored to the Ethereum Sepolia blockchain via transaction data field. The chain hash ${asset.chainHash.slice(0, 14)}… serves as immutable proof of registration at the time of anchoring.`
                    : `This asset is registered in AEGIS but has not yet been anchored on-chain. Full blockchain verification requires a confirmed transaction on the Ethereum network.`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function HashRow({
  label,
  value,
  copied,
  onCopy,
  isLink,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (text: string, label: string) => void;
  isLink?: boolean;
}) {
  const display =
    value.length > 20
      ? `${value.slice(0, 10)}…${value.slice(-8)}`
      : value;

  return (
    <div className="flex items-center justify-between rounded-lg border border-aegis-border/20 bg-white/[0.02] px-3 py-2">
      <div>
        <div className="text-[9px] font-medium uppercase tracking-wider text-aegis-muted">
          {label}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-aegis-text">
          {display}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onCopy(value, label)}
          className="rounded p-1 text-aegis-muted transition hover:bg-white/5 hover:text-white"
          title="Copy to clipboard"
        >
          {copied === label ? (
            <CheckCircle className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
        {isLink && (
          <a
            href={`https://sepolia.etherscan.io/tx/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-aegis-muted transition hover:bg-white/5 hover:text-aegis-accent"
            title="View on Etherscan"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
