// src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { StoreAdmin } from '../types/storeAdmin';
import type { ColdStorage } from '../types/coldStorage';
import type { DaybookOrder } from '../types/daybook';

interface StoreState {
  admin: Omit<StoreAdmin, 'password'> | null;
  coldStorage: ColdStorage | null;
  token: string | null;
  isLoading: boolean;
  _hasHydrated: boolean;

  receiptVisibleColumns: string[];
  setReceiptColumns: (cols: string[]) => void;
  toggleReceiptColumn: (col: string) => void;
  resetReceiptColumns: () => void;

  orderToEdit: DaybookOrder | null;
  setOrderToEdit: (order: DaybookOrder | null) => void;

  setAdminData: (
    admin: Omit<StoreAdmin, 'password'>,
    coldStorage: ColdStorage,
    token: string
  ) => void;
  clearAdminData: () => void;

  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

type PersistedState = Pick<StoreState, 'admin' | 'coldStorage' | 'token' | 'receiptVisibleColumns'>;

// ⏳ 1 week expiry in milliseconds
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

// ⭐ Custom storage wrapper
const expiringStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const { timestamp, value } = parsed;

      // If expired → delete + return null
      if (Date.now() - timestamp > ONE_WEEK) {
        localStorage.removeItem(name);
        return null;
      }

      return value;
    } catch {
      return null;
    }
  },

  setItem: (name: string, value: unknown) => {
    const wrapped = JSON.stringify({
      timestamp: Date.now(),
      value,
    });
    localStorage.setItem(name, wrapped);
  },

  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useStore = create(
  persist<StoreState, [], [], PersistedState>(
    (set, get) => ({
      admin: null,
      coldStorage: null,
      token: null,
      isLoading: false,
      _hasHydrated: false,

      receiptVisibleColumns: ['variety', 'size', 'quantity', 'weight', 'chamber', 'floor', 'row'],

      setReceiptColumns: (cols) => set({ receiptVisibleColumns: cols }),

      toggleReceiptColumn: (col) => {
        const current = get().receiptVisibleColumns;
        set({
          receiptVisibleColumns: current.includes(col)
            ? current.filter((c) => c !== col)
            : [...current, col],
        });
      },

      resetReceiptColumns: () =>
        set({
          receiptVisibleColumns: [
            'variety',
            'size',
            'quantity',
            'weight',
            'chamber',
            'floor',
            'row',
          ],
        }),

      orderToEdit: null,
      setOrderToEdit: (order) => set({ orderToEdit: order }),

      setAdminData: (admin, coldStorage, token) => {
        set({
          admin,
          coldStorage,
          token,
          isLoading: false,
        });
      },

      clearAdminData: () =>
        set({
          admin: null,
          coldStorage: null,
          token: null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),

    {
      name: 'store-storage',
      storage: expiringStorage, // ⭐ apply expiry logic here (7 days)

      partialize: (state): PersistedState => ({
        admin: state.admin,
        coldStorage: state.coldStorage,
        token: state.token,
        receiptVisibleColumns: state.receiptVisibleColumns,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.setHasHydrated(true);
      },
    }
  )
);
