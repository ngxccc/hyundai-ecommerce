"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@nhatnang/database/auth-client";
import { useCartStore } from "../hooks/use-cart";
import { getDbCartAction, mergeLocalCartAction } from "../actions";

export function CartSync() {
  const { data: session, isPending } = authClient.useSession();
  const setIsLoggedIn = useCartStore((s) => s.setIsLoggedIn);
  const syncWithServer = useCartStore((s) => s.syncWithServer);

  // Use a ref to track session ID to prevent redundant database fetches
  const lastSessionIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (isPending) return;

    const isLoggedIn = !!session?.user;
    const currentSessionId = session?.user?.id ?? null;

    setIsLoggedIn(isLoggedIn);

    // Only fetch and sync if the session has actually changed (e.g. login or logout)
    if (lastSessionIdRef.current !== currentSessionId) {
      const oldSessionId = lastSessionIdRef.current;
      lastSessionIdRef.current = currentSessionId;

      if (isLoggedIn) {
        const localItems = useCartStore.getState().items;
        const mergePromise =
          localItems.length > 0
            ? mergeLocalCartAction(
                localItems.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                })),
              )
            : Promise.resolve({ success: true });

        mergePromise
          .then(() => getDbCartAction())
          .then((dbCart) => {
            if (dbCart.success && dbCart.items) {
              syncWithServer(dbCart.items);
            } else {
              useCartStore.getState().setIsCartSynced(true);
            }
          })
          .catch((err) => {
            console.error("Failed to sync cart on session change:", err);
            useCartStore.getState().setIsCartSynced(true);
          });
      } else {
        // If the session changed from a logged-in user to null, it is a logout event.
        // We must clear the cart to prevent cross-account item leaks.
        if (oldSessionId) {
          useCartStore.getState().clearCart();
        }
      }
    }
  }, [session, isPending, setIsLoggedIn, syncWithServer]);

  return null;
}
