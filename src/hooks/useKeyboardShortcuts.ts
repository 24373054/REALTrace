import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // ? key → help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate(ROUTES.HELP);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            // Focus the header search input
            document.querySelector<HTMLInputElement>('header input[type="text"]')?.focus();
            break;
          case '1': e.preventDefault(); navigate(ROUTES.HOME); break;
          case '2': e.preventDefault(); navigate(ROUTES.ADDRESS); break;
          case '3': e.preventDefault(); navigate(ROUTES.TRANSACTION); break;
          case '4': e.preventDefault(); navigate(ROUTES.ANALYSIS); break;
          case '5': e.preventDefault(); navigate(ROUTES.MONITOR); break;
          case '6': e.preventDefault(); navigate(ROUTES.TRACE); break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
