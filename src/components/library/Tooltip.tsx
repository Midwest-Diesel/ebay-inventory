import { useEffect, useState } from "react";

interface Props {
  msg: string;
}

export default function Tooltip({ msg }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const OFFSET = 25;
  const DELAY = 800;

  useEffect(() => {
    let showTimer: NodeJS.Timeout | null = null;

    const updatePosition = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    if (msg) {
      window.addEventListener("mousemove", updatePosition);

      showTimer = setTimeout(() => {
        setVisible(true);
      }, DELAY);
    } else {
      setVisible(false);
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      window.removeEventListener("mousemove", updatePosition);
      setVisible(false);
    };
  }, [msg]);

  if (!msg || !visible) return null;

  return (
    <div
      className="tooltip pointer-events-none fixed z-50 bg-black text-white p-2 rounded shadow transition-opacity duration-200"
      style={{ top: pos.y - OFFSET, left: pos.x, opacity: 1 }}
    >
      {msg}
    </div>
  );
}
