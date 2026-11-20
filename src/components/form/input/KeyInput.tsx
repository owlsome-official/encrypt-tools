import {
  keyAtom,
  keyIsBase64Atom,
  keyIsGuessableAtom,
  keyWithAutoDetectAtom,
} from "@/lib/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import InputWithLabel from ".";

const KEY_WARNING_ID = "key-guessable-warning";

const KeyInput = () => {
  const key = useAtomValue(keyAtom);
  const setKey = useSetAtom(keyWithAutoDetectAtom);
  const [keyIsBase64, setKeyIsBase64] = useAtom(keyIsBase64Atom);
  const keyIsGuessable = useAtomValue(keyIsGuessableAtom);

  return (
    <div className="w-2/3">
      <InputWithLabel
        label="Key:"
        value={key}
        placeholder="Enter your own secret key"
        autoComplete="off"
        spellCheck={false}
        aria-describedby={keyIsGuessable ? KEY_WARNING_ID : undefined}
        onChange={(e) => setKey(e.target.value)}
        isBase64={keyIsBase64}
        onBase64Change={setKeyIsBase64}
      />
      {keyIsGuessable && (
        <p
          id={KEY_WARNING_ID}
          role="alert"
          className="text-destructive pt-1 text-xs font-medium"
        >
          This key is easy to guess. Anyone who tries it can decrypt your
          result, so use a random key instead.
        </p>
      )}
    </div>
  );
};

export default KeyInput;
