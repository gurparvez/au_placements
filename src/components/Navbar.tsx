import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from './theme-toggle';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo / Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600">
                {/* simple logo placeholder */}
                <span className="text-sm font-semibold">AU</span>
              </div>
              <div className="hidden md:block">
                <a href="#" className="text-lg leading-none font-semibold">
                  AU Placements
                </a>
                <div className="text-muted-foreground text-xs">Akal University</div>
              </div>
            </div>
          </div>

          {/* Middle: Search (visible on md+) */}
          {/* <div className="flex-1 px-4">
            <div className="mx-auto max-w-2xl">
              <div className="hidden md:flex items-center gap-2">
                <div className="relative w-full">
                  <Input
                    placeholder="Search students by name, skill, or course..."
                    className="pl-10"
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button variant="secondary">Search</Button>
              </div>
            </div>
          </div> */}

          {/* Right: Links / Actions */}
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              <a href="#" className="text-sm font-medium hover:underline">
                Home
              </a>
              <a href="#about" className="text-sm font-medium hover:underline">
                About
              </a>
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <ModeToggle />

              <Link to="/students">
                <Button>View Students</Button>
              </Link>

              <Link to="/profiles">
                <button className="focus:ring-ring flex items-center gap-2 rounded-full hover:cursor-pointer focus:ring-2 focus:outline-none">
                  <Avatar>
                    <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
                    <AvatarFallback>PS</AvatarFallback>
                  </Avatar>
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="mt-3 pb-4 md:hidden">
            <div className="flex flex-col gap-2">
              <a href="#" className="block rounded px-3 py-2 hover:bg-gray-600">
                Home
              </a>
              <a href="#about" className="block rounded px-3 py-2 hover:bg-gray-600">
                About
              </a>
              <div className="mt-2 flex items-center gap-2">
                <Button className="flex-1">View Students</Button>
                <Avatar>
                  <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
                  <AvatarFallback>PS</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
