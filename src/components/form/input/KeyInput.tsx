import { algorithmAtom, keyAtom, keyIsBase64Atom, keyWithAutoDetectAtom } from "@/lib/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import InputWithLabel from ".";

const KeyInput = () => {
  const key = useAtomValue(keyAtom);
  const setKey = useSetAtom(keyWithAutoDetectAtom);
  const [keyIsBase64, setKeyIsBase64] = useAtom(keyIsBase64Atom);
  const algorithm = useAtomValue(algorithmAtom);

  const isFullWidth = algorithm === "aes-gcm";

  return (
    <div className={isFullWidth ? "w-full" : "w-2/3"}>
      <InputWithLabel
        label="Key:"
        value={key}
        placeholder="Enter your own secret key"
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => setKey(e.target.value)}
        isBase64={keyIsBase64}
        onBase64Change={setKeyIsBase64}
      />
    </div>
  );
};

export default KeyInput;
