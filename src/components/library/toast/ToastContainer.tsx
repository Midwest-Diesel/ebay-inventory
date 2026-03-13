import Toast from "@/components/library/toast/Toast";
import { toastAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";


export default function ToastContainer() {
  const [toasts] = useAtom<Toast[]>(toastAtom);


  return (
    <div>
      {toasts.map((toast) => {
        return (
          <Toast key={toast.id} msg={toast.msg} type={toast.type} />
        );
      })}
    </div>
  );
}
