import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { resultAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import { Copy } from "lucide-react";
import { Suspense, useState } from "react";

const ResultAreaWithCopy = () => {
  return (
    <div>
      <div className="flex items-center justify-between pb-2 text-lg font-bold">
        <span>Result:</span>
        <Suspense
          fallback={<Skeleton className="h-[32px] w-[100px] rounded-full" />}
        >
          <RenderCopyResultButton />
        </Suspense>
      </div>
      <pre className="inline-block h-40 max-h-40 w-full overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-white/80 px-4 py-2">
        <Suspense fallback={"loading..."}>
          <RenderResult />
        </Suspense>
      </pre>
    </div>
  );
};

const RenderCopyResultButton = () => {
  const [copyText, setCopyText] = useState("Copy");
  const result = useAtomValue(resultAtom);

  const copyToClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    var textField = document.createElement("textarea");
    textField.innerText = result;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();

    try {
      navigator.clipboard.writeText(result);
    } catch {}

    setCopyText("Copied");
    setTimeout(() => {
      setCopyText("Copy");
    }, 3000);
  };

  return (
    <Button
      variant={"outline"}
      className="gap-1 rounded-2xl border border-solid border-primary bg-white/80 px-6 text-primary hover:text-white"
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
