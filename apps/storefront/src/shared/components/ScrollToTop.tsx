"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Clean up event listener khi component unmount để tránh rò rỉ bộ nhớ (Memory Leak)
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed right-8 bottom-8 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      aria-label="Lên đầu trang"
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
}
