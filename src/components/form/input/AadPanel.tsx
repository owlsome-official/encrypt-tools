import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  aadEnabledAtom,
  aadTimestampAtom,
  aadVersionAtom,
  algorithmAtom,
  gcmDecryptResultAtom,
  modeAtom,
} from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import { Clock, Info } from "lucide-react";
import { Suspense, useEffect, useMemo } from "react";

const formatTimestamp = (ts: number): string => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(new Date(ts * 1000));
  } catch {
    return "Invalid date";
  }
};

const AadToggle = () => {
  const [enabled, setEnabled] = useAtom(aadEnabledAtom);
  const algorithm = useAtomValue(algorithmAtom);

  if (algorithm !== "aes-gcm") return null;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors select-none",
        enabled
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/30",
      )}
    >
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
        className="accent-primary h-4 w-4"
      />
      <Info className="h-4 w-4 opacity-60" />
      <span className="text-sm font-medium">
        Include AAD (Additional Authenticated Data)
      </span>
    </label>
  );
};

const AadFields = () => {
  const mode = useAtomValue(modeAtom);
  const aadEnabled = useAtomValue(aadEnabledAtom);
  const algorithm = useAtomValue(algorithmAtom);

  if (algorithm !== "aes-gcm" || !aadEnabled) return null;

  if (mode === "decrypt") {
    return (
      <Suspense fallback={<AadFieldsSkeleton />}>
        <AadDecryptDisplay />
      </Suspense>
    );
  }

  return <AadEncryptInputs />;
};

const AadFieldsSkeleton = () => (
  <div className="animate-pulse space-y-2 rounded-lg border border-dashed p-3">
    <div className="bg-muted h-4 w-24 rounded" />
    <div className="bg-muted h-4 w-40 rounded" />
  </div>
);

const AadEncryptInputs = () => {
  const [version, setVersion] = useAtom(aadVersionAtom);
  const [timestamp, setTimestamp] = useAtom(aadTimestampAtom);

  useEffect(() => {
    if (timestamp === 0) {
      setTimestamp(Math.floor(Date.now() / 1000));
    }
  }, [timestamp, setTimestamp]);

  const humanDate = useMemo(() => formatTimestamp(timestamp), [timestamp]);

  const handleSetNow = () => {
    setTimestamp(Math.floor(Date.now() / 1000));
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed p-3">
      <div className="flex items-start gap-4">
        <div className="w-28">
          <Label className="text-xs font-semibold">Version (0-255)</Label>
          <Input
            type="number"
            min={0}
            max={255}
            value={version}
            onChange={(e) => {
              const v = Math.max(0, Math.min(255, Number(e.target.value) || 0));
              setVersion(v);
            }}
            className="mt-1 h-8 bg-white text-sm"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs font-semibold">
            Timestamp (Unix seconds)
          </Label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={timestamp}
              onChange={(e) =>
                setTimestamp(Math.max(0, Number(e.target.value) || 0))
              }
              className="h-8 bg-white text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-primary text-primary h-8 gap-1 rounded-xl border bg-white/80 px-3 text-xs hover:text-white"
              onClick={handleSetNow}
            >
              <Clock className="h-3 w-3" />
              Now
            </Button>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{humanDate}</p>
        </div>
      </div>
    </div>
  );
};

const AadDecryptDisplay = () => {
  const result = useAtomValue(gcmDecryptResultAtom);

  if (!result?.aad) {
    return (
      <div className="rounded-lg border border-dashed p-3">
        <p className="text-muted-foreground text-sm italic">
          No AAD found in ciphertext, or decryption failed.
        </p>
      </div>
    );
  }

  const { version, timestamp } = result.aad;

  return (
    <div className="space-y-2 rounded-lg border border-dashed p-3">
      <p className="text-xs font-semibold opacity-70">
        Decoded AAD from ciphertext:
      </p>
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="font-semibold">Version:</span>{" "}
          <code className="bg-muted rounded px-1.5 py-0.5">{version}</code>
        </div>
        <div>
          <span className="font-semibold">Timestamp:</span>{" "}
          <code className="bg-muted rounded px-1.5 py-0.5">{timestamp}</code>
          <span className="text-muted-foreground ml-2 text-xs">
            ({formatTimestamp(timestamp)})
          </span>
        </div>
      </div>
    </div>
  );
};

const AadPanel = () => (
  <div className="space-y-2">
    <AadToggle />
    <AadFields />
  </div>
);

export default AadPanel;
