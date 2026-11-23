"use client";

import { Separator } from "../ui/separator";
import AlgorithmSelector from "./button/AlgorithmSelector";
import ModeSelector from "./button/ModeSelector";
import AadPanel from "./input/AadPanel";
import IVInput from "./input/IVInput";
import KeyInput from "./input/KeyInput";
import InputArea from "./textarea/InputArea";
import ResultAreaWithCopy from "./textarea/ResultArea";

import { algorithmAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";

const GCMNonceNote = () => (
  <div className="text-muted-foreground flex items-center gap-1.5 rounded-md border border-dashed px-3 py-2 text-xs">
    <span className="font-medium">Nonce:</span>
    <span>Auto-generated (12-byte random) per message</span>
  </div>
);

const EncryptionForm = () => {
  const algorithm = useAtomValue(algorithmAtom);
  const isGCM = algorithm === "aes-gcm";

  return (
    <div className="space-y-3">
      <AlgorithmSelector />
      <Separator />
      <ModeSelector />
      <Separator />

      <div className="flex gap-4 py-1">
        <KeyInput />
        {!isGCM && <IVInput />}
      </div>

      {isGCM && <GCMNonceNote />}
      {isGCM && <AadPanel />}

      <Separator />

      <div className="flex flex-col gap-4">
        <InputArea placeholder="some input here" />
        <Separator />
        <ResultAreaWithCopy />
      </div>
    </div>
  );
};

export default EncryptionForm;
