"use client";

import { Separator } from "../ui/separator";
import ModeSelector from "./button/ModeSelector";
import IVInput from "./input/IVInput";
import KeyInput from "./input/KeyInput";
import InputArea from "./textarea/InputArea";
import ResultAreaWithCopy from "./textarea/ResultArea";

const EncryptionForm = () => {
  return (
    <div>
      <ModeSelector />
      <Separator />
      <div className="flex gap-4 py-4">
        <KeyInput />
        <IVInput />
      </div>
      <div className="flex flex-col gap-4">
        <InputArea placeholder="some input here" />
        <Separator />
        <ResultAreaWithCopy />
      </div>
    </div>
  );
};

export default EncryptionForm;
