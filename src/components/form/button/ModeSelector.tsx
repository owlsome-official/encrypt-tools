import { Button } from "@/components/ui/button";
import { modeAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { Lock, LockOpen } from "lucide-react";

const ModeSelector = () => {
  const [mode, setMode] = useAtom(modeAtom);

  return (
    <div className="flex items-center gap-2 py-3">
      <span className="pr-4 text-lg font-bold">Mode:</span>
      <Button
        className={cn(
          mode !== "encrypt" &&
            "border-primary text-primary border border-solid bg-white/80",
          "w-full gap-1 rounded-2xl hover:text-white",
        )}
        variant={mode === "encrypt" ? "default" : "outline"}
        onClick={() => {
          setMode("encrypt");
        }}
      >
        <Lock className="h-4 w-4" />
        Encrypt
      </Button>
      <Button
        className={cn(
          mode !== "decrypt" &&
            "border-primary text-primary border border-solid bg-white/80",
          "w-full gap-1 rounded-2xl hover:text-white",
        )}
        variant={mode === "decrypt" ? "default" : "outline"}
        onClick={() => {
          setMode("decrypt");
        }}
      >
        <LockOpen className="h-4 w-4" />
        Decrypt
      </Button>
    </div>
  );
};

export default ModeSelector;
