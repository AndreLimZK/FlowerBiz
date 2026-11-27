"use client";

import { useCartStore } from "@/stores/cartStore";
import { useCommerceStore } from "@/stores/commerceStore";
import { useEffect, useState } from "react";

const stores = [useCartStore, useCommerceStore] as const;

/**
 * Reads localStorage only after the first client render.
 * The server and that first render both use the in-memory initial state,
 * so the markup matches. `skipHydration` on the stores stops Zustand from
 * reading storage while the module loads.
 */
export function useCommerceHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const names = stores.map((store, index) => store.persist.getOptions().name ?? `store-${index}`);
    const pending = new Set(names);
    const finish = (name: string) => {
      pending.delete(name);
      if (active && pending.size === 0) setHydrated(true);
    };

    const unsubs = stores.map((store, index) =>
      store.persist.onFinishHydration(() => finish(names[index])),
    );

    stores.forEach((store, index) => {
      if (store.persist.hasHydrated()) finish(names[index]);
      else void store.persist.rehydrate();
    });

    return () => {
      active = false;
      for (const unsub of unsubs) unsub();
    };
  }, []);

  return hydrated;
}

export function CommerceHydration() {
  useCommerceHydrated();
  return null;
}
