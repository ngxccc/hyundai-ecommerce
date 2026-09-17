"use client";

/**
 * Client Component rendering current year to avoid static build-time date lock.
 */
export function CopyrightYear() {
  return <span>{new Date().getFullYear()}</span>;
}
