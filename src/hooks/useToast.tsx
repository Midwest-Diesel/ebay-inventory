import { toastAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";

let idCounter = 0;

export function useToast() {
  const [, setToasts] = useAtom<Toast[]>(toastAtom);

  const sendToast = (msg: string, type: 'error' | 'success' | 'warning' | 'none', duration = 6000) => {
    const id = idCounter++;
    const newToast = { msg, type, duration, id };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return { sendToast };
}
