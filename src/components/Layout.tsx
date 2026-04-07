import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import Navbar from "./Navbar";

interface Props {
  children: React.ReactNode
  title?: string
}


export function Layout({ children, title }: Props) {
  const [user] = useAtom<User>(userAtom);
  const isStaging = import.meta.env.TAURI_DEBUG === 'true';
  const baseTitle = isStaging ? 'Inventory (staging)' : 'Inventory';

  useEffect(() => {
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    document.addEventListener('wheel', (e: any) => {
      if (e.target.type === 'number') {
        e.preventDefault();
      }
    }, { passive: false });
  }, []);


  return (
    <div style={{ height: '100%' }}>
      { (user && location.pathname !== '/') && <Navbar /> }
      <div className="layout__container">
        <div className="layout__main-content">
          { children }
        </div>
      </div>
    </div>
  );
}
