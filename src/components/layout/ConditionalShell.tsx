'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ConditionalShellProps {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

const FULLSCREEN_ROUTES = ['/admin'];

export default function ConditionalShell({ navbar, footer, children }: ConditionalShellProps) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some(r => pathname.startsWith(r));

  if (isFullscreen) {
    // Admin pages: render children directly with no nav/footer
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <main id="main-content">{children}</main>
      {footer}
    </>
  );
}
