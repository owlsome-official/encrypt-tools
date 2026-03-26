import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputWithLabelProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isBase64?: boolean;
  onBase64Change?: (checked: boolean) => void;
}

const InputWithLabel = ({
  label,
  isBase64,
  onBase64Change,
  ...rest
}: InputWithLabelProps) => {
  const hasBase64Toggle = isBase64 !== undefined && onBase64Change;

  return (
    <div className="w-full space-y-0.5">
      <div className="flex items-center gap-2 justify-between">
        <Label htmlFor={rest.id} className="text-lg font-bold">
          {label}
        </Label>
        {hasBase64Toggle && <Base64Toggle active={isBase64} onChange={onBase64Change} />}
      </div>
      <Input
        {...rest}
        className={cn(
          "ring-background/20 focus-visible:ring-accent inline-block w-full overflow-x-auto rounded-md border bg-white px-4 py-2 break-words whitespace-pre-wrap ring-1 focus-visible:ring-2 focus-visible:outline-hidden",
          rest.className,
        )}
      />
    </div>
  );
};

interface Base64ToggleProps {
  active: boolean;
  onChange: (checked: boolean) => void;
}

const Base64Toggle = ({ active, onChange }: Base64ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={active}
    aria-label="Toggle Base64 decoding"
    onClick={() => onChange(!active)}
    className={cn(
      "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors select-none",
      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-hidden",
      active
        ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
        : "border-border bg-muted/50 text-muted-foreground hover:border-primary/20 hover:bg-muted",
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full transition-colors",
        active ? "bg-primary" : "bg-muted-foreground/40",
      )}
    />
    Base64
  </button>
);

export default InputWithLabel;
