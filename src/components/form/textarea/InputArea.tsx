import { inputAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import type { TextareaHTMLAttributes } from "react";

const InputArea = ({
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const [value, setValue] = useAtom(inputAtom);

  return (
    <div>
      <div className="flex pb-2 text-lg font-bold">
        <span>Input:</span>
      </div>
      <textarea
        rows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="inline-block w-full overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-white px-4 py-2 ring-1 ring-background/20 focus:outline-hidden focus:ring-2 focus:ring-accent"
        {...rest}
      />
    </div>
  );
};

export default InputArea;
