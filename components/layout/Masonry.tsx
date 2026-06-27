import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Masonry({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:_balance]", className)}>{children}</div>;
}

export function MasonryItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-5 break-inside-avoid", className)}>{children}</div>;
}
