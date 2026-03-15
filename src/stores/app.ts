import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  sidebarCollapsed: boolean;
  searchHistory: string[];
  favorites: { address: string; chain: string; label?: string; addedAt: string }[];
  toggleSidebar: () => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  addFavorite: (address: string, chain: string, label?: string) => void;
  removeFavorite: (address: string) => void;
  isFavorite: (address: string) => boolean;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      searchHistory: [],
      favorites: [],
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
    }),
    { name: 'ct-app' }
  )
);
