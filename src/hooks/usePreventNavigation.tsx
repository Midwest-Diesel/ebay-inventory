import { useEffect } from 'react';
import { ask } from '@/scripts/config/tauri';


export const usePreventNavigation = (shouldPrevent: boolean, text: string) => {
  useEffect(() => {
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link: HTMLAnchorElement | null = target.closest('a');
      const tab: HTMLButtonElement | null = target.closest('.navbar-tab__content');
      const newTabElmt: HTMLButtonElement | null = target.closest('.navbar-tab--new-tab');
      const foward: HTMLButtonElement | null = target.closest('#nav-buttons__foward');
      const back: HTMLButtonElement | null = target.closest('#nav-buttons__back');
      if (shouldPrevent) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!await ask(text ?? 'Are you sure you want to leave the page?')) return;
        
        if (link) {
          // push(link.textContent || 'Home', link.getAttribute('data-href') || '/');
        } else if (newTabElmt) {
          // newTab();
        } else if (tab) {
          // const tabId = Number(tab.getAttribute('data-tabid'));
          // changeTab(tabId);
        } else if (foward) {
          // forward();
        } else if (back) {
          // backward();
        } else {
          // push('Home', '/');
        }
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // if (!shouldPrevent) backward();
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldPrevent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', handleClick);
    });
    document.querySelectorAll('.navbar-tab').forEach((tab) => {
      (tab as HTMLDivElement).addEventListener('click', handleClick);
    });
    document.getElementById('nav-buttons__foward')?.addEventListener('click', handleClick);
    document.getElementById('nav-buttons__back')?.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.querySelectorAll('a').forEach((link) => {
        link.removeEventListener('click', handleClick);
      });
      document.querySelectorAll('.navbar-tab').forEach((tab) => {
        (tab as HTMLDivElement).removeEventListener('click', handleClick);
      });
      document.getElementById('nav-buttons__foward')?.removeEventListener('click', handleClick);
      document.getElementById('nav-buttons__back')?.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldPrevent]);
};
