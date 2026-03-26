import { keyAtom, keyIsBase64Atom, keyWithAutoDetectAtom } from "@/lib/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import InputWithLabel from ".";

const KeyInput = () => {
  const key = useAtomValue(keyAtom);
  const setKey = useSetAtom(keyWithAutoDetectAtom);
  const [keyIsBase64, setKeyIsBase64] = useAtom(keyIsBase64Atom);

  return (
    <div className="w-2/3">
      <InputWithLabel
        label="Key:"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        isBase64={keyIsBase64}
        onBase64Change={setKeyIsBase64}
      />
    </div>
  );
};

export default KeyInput;
