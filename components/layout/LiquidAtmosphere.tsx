"use client";

import { useEffect, useRef } from "react";

/** Decorative silk and glass layers; pause when the hero leaves the viewport. */
export function LiquidAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="liquid-atmosphere" aria-hidden="true" data-visible="false">
      <div className="liquid-halo liquid-halo-one" />
      <div className="liquid-halo liquid-halo-two" />
      <div className="liquid-silk liquid-silk-one" />
      <div className="liquid-silk liquid-silk-two" />
      <div className="liquid-orbit"><div className="liquid-pearl" /></div>
      <div className="liquid-horizon" />
    </div>
  );
}
