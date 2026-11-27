import type { StateStorage } from "zustand/middleware";

/**
 * Browser persistence for the cart and commerce stores.
 * `createJSONStorage` calls this once, when the store module loads.
 * On the server there is no `localStorage`, so this returns a no-op store.
 * That no-op is not shared between requests. The browser module loads again
 * with `window` set and gets `localStorage`.
 */
const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export function commerceStateStorage(): StateStorage {
  if (typeof window === "undefined") return serverStorage;
  try {
    const key = "__flowerbiz_storage_probe__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return window.localStorage;
  } catch {
    return serverStorage;
  }
}
