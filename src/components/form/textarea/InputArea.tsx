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
        className="ring-background/20 focus:ring-accent inline-block w-full overflow-x-auto rounded-md border bg-white px-4 py-2 break-words whitespace-pre-wrap ring-1 focus:ring-2 focus:outline-hidden"
        {...rest}
      />
    </div>
  );
};

export default InputArea;
