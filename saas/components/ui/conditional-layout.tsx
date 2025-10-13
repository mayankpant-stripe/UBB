'use client';

import { usePathname } from 'next/navigation';
import { BPPHeader } from './bpp-header';
import { BPPFooter } from './bpp-footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Route prefixes that should NOT have BPP header and footer
  const cleanPrefixes = ['/hackathonpage', '/newhack', '/UBB', '/Perlego', '/ona', '/Stability'];
  
  const isCleanRoute = cleanPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));

  if (isCleanRoute) {
    // Return children without BPP header/footer
    return <>{children}</>;
  }

  // Return children with BPP header/footer
  return (
    <div className="flex flex-col min-h-screen">
      <BPPHeader />
      <main className="flex-1">
        {children}
      </main>
      <BPPFooter />
    </div>
  );
} 