import { tooltipAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";


export function useTooltip() {
  const [, setTooltip] = useAtom<string>(tooltipAtom);

  const set = (msg: string) => {
    setTooltip(msg);
  };

  return { set };
}
