"use client";

import { algorithmAtom } from "@/lib/atoms";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Separator } from "../ui/separator";
import ModeSelector from "./button/ModeSelector";
import IVInput from "./input/IVInput";
import KeyInput from "./input/KeyInput";
import InputArea from "./textarea/InputArea";
import ResultAreaWithCopy from "./textarea/ResultArea";

const LegacyForm = () => {
  const setAlgorithm = useSetAtom(algorithmAtom);

  useEffect(() => {
    setAlgorithm("aes-cbc");
  }, [setAlgorithm]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-dashed bg-amber-50/50 px-3 py-2 text-xs text-amber-700">
        <span className="font-semibold">AES-CBC (Legacy)</span>
        <span>&mdash; Static IV, PKCS7 padding, no authentication</span>
      </div>
      <ModeSelector />
      <Separator />
      <div className="flex gap-4 py-1">
        <KeyInput />
        <IVInput />
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <InputArea placeholder="some input here" />
        <Separator />
        <ResultAreaWithCopy />
      </div>
    </div>
  );
};

export default LegacyForm;
