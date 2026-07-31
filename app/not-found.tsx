import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent/[0.06] blur-3xl" />
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-accent/70">Error</p>
        <h1 className="mt-4 font-display text-8xl md:text-9xl">404</h1>
        <p className="mt-6 text-muted-foreground">This page doesn&apos;t exist.</p>
        <Link href="/" className="mt-10 inline-block border border-accent px-8 py-4 text-xs uppercase tracking-[0.2em] text-accent transition-all duration-300 hover:bg-accent hover:text-accent-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}
