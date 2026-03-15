import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '../i18n';

export type Theme = 'dark' | 'light' | 'high-contrast';

interface AppStore {
  sidebarCollapsed: boolean;
  searchHistory: string[];
  favorites: { address: string; chain: string; label?: string; addedAt: string }[];
  locale: Locale;
  theme: Theme;
  toggleSidebar: () => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  addFavorite: (address: string, chain: string, label?: string) => void;
  removeFavorite: (address: string) => void;
  isFavorite: (address: string) => boolean;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      searchHistory: [],
      favorites: [],
      locale: 'zh',
      theme: 'dark',
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      addSearchHistory: (query) => {
        const history = get().searchHistory.filter(h => h !== query);
        set({ searchHistory: [query, ...history].slice(0, 20) });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
      addFavorite: (address, chain, label) => {
        const favs = get().favorites.filter(f => f.address !== address);
        set({ favorites: [{ address, chain, label, addedAt: new Date().toISOString() }, ...favs] });
      },
      removeFavorite: (address) => set({ favorites: get().favorites.filter(f => f.address !== address) }),
      isFavorite: (address) => get().favorites.some(f => f.address === address),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'ct-app',
      onRehydrateStorage: () => (state) => {
        // Apply persisted theme on load
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
