// @ts-nocheck: `document.execCommand` is deprecated

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { resultAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import { Copy } from "lucide-react";
import { Suspense, useState, useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

// The result atom is async; suspending during SSR makes React stream inline
// completion scripts, which the page's Content-Security-Policy blocks.
const useIsHydrated = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

const ResultAreaWithCopy = () => {
  const isHydrated = useIsHydrated();
  const copyFallback = <Skeleton className="h-[32px] w-[100px] rounded-full" />;
  const resultFallback = "loading...";

  return (
    <div>
      <div className="flex items-center justify-between pb-2 text-lg font-bold">
        <span>Result:</span>
        <Suspense fallback={copyFallback}>
          {isHydrated ? <RenderCopyResultButton /> : copyFallback}
        </Suspense>
      </div>
      <pre className="inline-block h-40 max-h-40 w-full overflow-x-auto rounded-md border bg-white/80 px-4 py-2 break-words whitespace-pre-wrap">
        <Suspense fallback={resultFallback}>
          {isHydrated ? <RenderResult /> : resultFallback}
        </Suspense>
      </pre>
    </div>
  );
};

const RenderCopyResultButton = () => {
  const [copyText, setCopyText] = useState("Copy");
  const result = useAtomValue(resultAtom);

  const copyToClipboard = (_e: React.MouseEvent<HTMLButtonElement>) => {
    var textField = document.createElement("textarea");
    textField.innerText = result;
    document.body.appendChild(textField);
    textField.select();
    try {
      document.execCommand("copy");
      navigator.clipboard.writeText(result);
    } catch {}
    textField.remove();

    setCopyText("Copied");
    setTimeout(() => {
      setCopyText("Copy");
    }, 3000);
  };

  return (
    <Button
      variant={"outline"}
      className="border-primary text-primary gap-1 rounded-2xl border border-solid bg-white/80 px-6 hover:text-white"
      onClick={copyToClipboard}
      size={"sm"}
    >
      <Copy className="h-4 w-4" />
      {copyText}
    </Button>
  );
};
const RenderResult = () => {
  return useAtomValue(resultAtom) || "\n";
};

export default ResultAreaWithCopy;
