"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Proporsi elemen yang harus terlihat agar dianggap masuk (0–1). */
  threshold?: number;
  /** Perluasan viewport untuk deteksi (format CSS). */
  rootMargin?: string;
}

/**
 * Deteksi elemen masuk viewport (sekali trigger) + preferensi
 * prefers-reduced-motion. Dipakai untuk animasi entrance chart.
 */
export function useInView<T extends Element>({
  threshold = 0.1,
  rootMargin = "0px 0px -10% 0px",
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView, prefersReducedMotion };
}