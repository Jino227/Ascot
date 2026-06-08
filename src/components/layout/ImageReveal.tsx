import { useState } from "react";
import { cn } from "@/lib/utils";

/** Image with skeleton shimmer + hover zoom. */
export function ImageReveal({
  src,
  alt,
  className,
  imgClassName,
  ratio,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  onClick?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden bg-muted",
        onClick && "cursor-zoom-in",
        className,
      )}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-secondary to-muted" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] will-change-transform group-hover:scale-[1.06]",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-xl",
          imgClassName,
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
