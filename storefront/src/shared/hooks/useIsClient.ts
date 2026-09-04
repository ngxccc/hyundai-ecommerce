import { useSyncExternalStore } from "react";

const emptySubscribe = () => {
  return () => {
    // No-op
  };
};

export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Trả về true trên trình duyệt (Client snapshot)
    () => false, // Trả về false trên máy chủ (Server snapshot)
  );
}
