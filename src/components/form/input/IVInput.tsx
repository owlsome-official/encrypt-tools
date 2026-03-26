import { ivAtom, ivIsBase64Atom, ivWithAutoDetectAtom } from "@/lib/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import InputWithLabel from ".";

const IVInput = () => {
  const iv = useAtomValue(ivAtom);
  const setIv = useSetAtom(ivWithAutoDetectAtom);
  const [ivIsBase64, setIvIsBase64] = useAtom(ivIsBase64Atom);

  return (
    <div className="w-1/3">
      <InputWithLabel
        label="IV:"
        value={iv}
        onChange={(e) => setIv(e.target.value)}
        isBase64={ivIsBase64}
        onBase64Change={setIvIsBase64}
      />
    </div>
  );
};

export default IVInput;
