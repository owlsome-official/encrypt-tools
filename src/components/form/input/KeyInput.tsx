import { keyAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import InputWithLabel from ".";

const KeyInput = () => {
  const [key, setKey] = useAtom(keyAtom);
  return (
    <div className="w-2/3">
      <InputWithLabel
        label="Key:"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
    </div>
  );
};

export default KeyInput;
