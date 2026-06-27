import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-32 text-center">
      <h1 className="font-display text-6xl">404</h1>
      <p className="mt-4 text-muted-foreground">This page doesn&apos;t exist.</p>
      <Link href="/" className="mt-8 inline-block text-accent underline underline-offset-4">
        Go home
      </Link>
    </div>
  );
}
