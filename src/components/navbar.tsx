import { useMemo } from 'react';
import { User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from './logout-button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';

// TanStack Router
import { useLocation } from '@tanstack/react-router';

// Zustand store
import { useStore } from '@/stores/store';

import { UserAvatar } from './user-avatar';
import type { StoreAdmin } from '@/types/storeAdmin';
import type { ColdStorage } from '@/types/coldStorage';

interface UserMenuProps {
  admin: Omit<StoreAdmin, 'password'>;
  coldStorage: ColdStorage | null;
}

function UserMenu({ admin, coldStorage }: UserMenuProps) {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex items-center gap-3 py-2">
          <UserAvatar name={admin.name} imageUrl={coldStorage?.imageUrl ?? null} />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold">{admin.name}</p>
            <p className="text-xs text-muted-foreground">{admin.role}</p>
            <p className="text-xs text-muted-foreground">🇮🇳 +91 {admin.mobileNumber}</p>
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem>
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <LogoutButton variant="dropdown" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export default function Navbar() {
  // TanStack Router pathname
  const pathname = useLocation().pathname;

  // Zustand store
  const admin = useStore((state) => state.admin);
  const coldStorage = useStore((state) => state.coldStorage);
  const hasHydrated = useStore((state) => state._hasHydrated);

  // Generate page title
  const formatted = useMemo(() => {
    if (pathname.match(/^\/store-admin\/people\/[^/]+$/)) {
      return 'Farmer Profile';
    }

    const segments = pathname.split('/').filter(Boolean);
    const last = segments.at(-1) ?? '';

    return last
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [pathname]);

  // Skeleton while hydration is incomplete
  if (!hasHydrated || !admin) {
    return (
      <nav className="sticky top-0 z-40 bg-background shadow-sm border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <SidebarTrigger />
            <div className="ml-2 md:ml-6 md:pl-6 border-l border-border">
              <Skeleton className="h-6 w-48 rounded-md" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 bg-background shadow-sm border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Left: Sidebar + page title */}
        <div className="flex items-center">
          <SidebarTrigger />
          <div className="ml-2 md:ml-6 md:pl-6 border-l border-border">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{formatted}</h1>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Welcome, {admin.name}</span>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <UserAvatar name={admin.name} imageUrl={coldStorage?.imageUrl ?? null} />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>

            <UserMenu admin={admin} coldStorage={coldStorage} />
          </DropdownMenu>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <UserAvatar name={admin.name} imageUrl={coldStorage?.imageUrl ?? null} />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>

            <UserMenu admin={admin} coldStorage={coldStorage} />
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
