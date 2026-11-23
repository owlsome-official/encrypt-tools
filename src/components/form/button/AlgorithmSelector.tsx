import { Button } from "@/components/ui/button";
import { algorithmAtom } from "@/lib/atoms";
import type { Algorithm } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { Shield, ShieldAlert } from "lucide-react";

const ALGORITHMS = [
  {
    value: "aes-gcm" as const,
    label: "AES-GCM",
    sublabel: "Authenticated",
    icon: Shield,
  },
  {
    value: "aes-cbc" as const,
    label: "AES-CBC",
    sublabel: "Legacy",
    icon: ShieldAlert,
  },
] satisfies { value: Algorithm; label: string; sublabel: string; icon: React.ComponentType<{ className?: string }> }[];

const AlgorithmSelector = () => {
  const [algorithm, setAlgorithm] = useAtom(algorithmAtom);

  return (
    <div className="flex items-center gap-2 pb-2">
      <span className="pr-2 text-lg font-bold">Algorithm:</span>
      {ALGORITHMS.map(({ value, label, sublabel, icon: Icon }) => (
        <Button
          key={value}
          className={cn(
            algorithm !== value &&
              "border-primary text-primary border border-solid bg-white/80",
            "w-full gap-1.5 rounded-2xl hover:text-white",
          )}
          variant={algorithm === value ? "default" : "outline"}
          size="sm"
          onClick={() => setAlgorithm(value)}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
          <span className="text-xs opacity-70">({sublabel})</span>
        </Button>
      ))}
    </div>
  );
};

export default AlgorithmSelector;
