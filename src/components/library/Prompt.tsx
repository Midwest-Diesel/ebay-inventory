import { useState, useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { createPortal } from "react-dom";
import { createRoot, Root } from "react-dom/client";
import Button from "./Button";
import Input from "./Input";

interface Props {
  message?: string
  defaultValue?: string
  onClose: (value: string | null) => void
}


export default function Prompt({ message = '', defaultValue = '', onClose }: Props) {
  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(null);
      if (e.key === 'Enter') onClose(value);
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [value, onClose]);


  return createPortal(
    <div className="prompt__background">
      <div className="prompt">
        <h4>{ message }</h4>

        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="prompt__buttons">
          <Button onClick={() => onClose(value)}>OK</Button>
          <Button onClick={() => onClose(null)}>Cancel</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* eslint-disable */
export function prompt(message: string, defaultValue = ''): Promise<string | null> {
  if (!isTauri()) return prompt(message, defaultValue);
  
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    function handleClose(value: string | null) {
      root.unmount();
      container.remove();
      resolve(value);
    }

    root.render(
      <Prompt message={message} defaultValue={defaultValue} onClose={handleClose} />
    );
  });
}
