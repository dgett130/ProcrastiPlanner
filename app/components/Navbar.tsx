'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2, LogOut, Menu, UserCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useAuthContext } from './AuthProvider';

type NavLink = {
  href: string;
  label: string;
};

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Progetti' },
];

export function Navbar() {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (typeof logout !== 'function') {
      return;
    }

    try {
      setIsLoggingOut(true);
      await Promise.resolve(logout());
    } catch (error) {
      console.error('Errore durante il logout', error);
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
    }
  };

  const renderLink = (link: NavLink, mobile = false) => {
    const isActive =
      pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

    const baseClasses =
      'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          baseClasses,
          mobile ? 'text-left hover:bg-accent' : 'hover:text-foreground',
          isActive ? 'bg-accent text-foreground' : 'text-muted-foreground'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Salta al contenuto principale
      </a>
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Navigazione principale"
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-foreground">
            ProcrastiPlanner
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => renderLink(link))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-stretch gap-2">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="justify-center px-3 py-2"
            >
              <Link
                href="/profile"
                aria-label="Vai alla pagina profilo"
                className="inline-flex items-center justify-center gap-2"
              >
                <UserCircle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">Il mio profilo</span>
              </Link>
            </Button>
            {user ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hidden md:inline-flex"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Logout...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </>
                )}
              </Button>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-md border border-input px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-block"
              >
                Accedi
              </Link>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={cn(
          'grid gap-2 border-t bg-background px-4 pb-4 transition-[max-height,opacity] duration-200 md:hidden',
          isMenuOpen ? 'max-h-96 py-3 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
        )}
      >
        {NAV_LINKS.map((link) => renderLink(link, true))}

        {user ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="justify-start"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Logout...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </>
            )}
          </Button>
        ) : (
          <Link
            href="/login"
            className="rounded-md border border-input px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Accedi
          </Link>
        )}
      </div>
    </header>
  );
}
