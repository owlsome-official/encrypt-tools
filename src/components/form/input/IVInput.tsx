import { ivAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import InputWithLabel from ".";

const IVInput = () => {
  const [iv, setIv] = useAtom(ivAtom);
  return (
    <div className="w-1/3">
      <InputWithLabel
        label="IV:"
        value={iv}
        onChange={(e) => setIv(e.target.value)}
      />
    </div>
  );
};

export default IVInput;
