import { useEffect, useState, useCallback, useRef, MouseEvent } from "react";
import Button from "./Button";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  targetClass: string;
  notTargetClass: string
  list: { name: string; fn: (e?: MouseEvent) => void }[];
}


export default function ContextMenu({ open, setOpen, targetClass, notTargetClass, list }: Props) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleContextMenu = useCallback((e: any) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains(targetClass) && !target.classList.contains(notTargetClass)) {
      e.preventDefault();
      setOpen(true);
      setX(e.clientX);
      setY(e.clientY);
    } else {
      setOpen(false);
    }
  }, [setOpen, targetClass]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    if (open) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleContextMenu, open]);

  
  return (
    <>
      {open && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{ position: "absolute", left: `${x}px`, top: `${y}px` }}
        >
          {list.map((row, i) => (
            <Button
              key={i}
              variant={["no-style"]}
              onClick={(e: MouseEvent) => {
                row.fn(e);
                setOpen(false);
              }}
            >
              {row.name}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
