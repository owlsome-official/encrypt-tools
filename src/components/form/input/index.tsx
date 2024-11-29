import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type InputWithLabelProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};
const InputWithLabel = ({ label, ...rest }: InputWithLabelProps) => {
  return (
    <div className="w-full">
      <Label htmlFor={rest.id} className="flex pb-2 text-lg font-bold">
        {label}
      </Label>
      <Input
        {...rest}
        className={cn(
          "inline-block w-full overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-white px-4 py-2 ring-1 ring-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          rest.className,
        )}
      />
    </div>
  );
};

export default InputWithLabel;
