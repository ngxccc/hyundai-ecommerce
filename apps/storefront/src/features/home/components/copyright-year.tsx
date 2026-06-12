"use client";

import { useEffect, useState } from "react";

export function CopyrightYear() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    const timer = setTimeout(() => {
      setYear(new Date().getFullYear());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return <>{year}</>;
}
