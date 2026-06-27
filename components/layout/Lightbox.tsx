"use client";

import { useState } from "react";
import LB from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export function useLightbox() {
  const [index, setIndex] = useState(-1);
  return { open: (i: number) => setIndex(i), close: () => setIndex(-1), index, isOpen: index >= 0 };
}

export function LuxLightbox({ slides, index, onClose }: { slides: { src: string; alt?: string }[]; index: number; onClose: () => void }) {
  return (
    <LB open={index >= 0} index={Math.max(0, index)} close={onClose} slides={slides}
      plugins={[Zoom]} zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      controller={{ closeOnBackdropClick: true }}
      styles={{ container: { backgroundColor: "rgba(20,18,14,0.96)" } }}
    />
  );
}
