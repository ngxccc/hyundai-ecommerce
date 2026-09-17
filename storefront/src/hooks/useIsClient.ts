"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => {
  return () => {
    // No-op
  };
};

export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Client snapshot
    () => false, // Server snapshot
  );
}
