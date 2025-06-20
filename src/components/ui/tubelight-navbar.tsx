'use client';

import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

import { ConnectButton } from 'thirdweb/react';
import { client } from '@/app/client';

export function NavBar({ items, className }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <nav className={cn("fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full border backdrop-blur-lg bg-background/30 shadow-sm transition-all mx-auto max-w-5xl w-[90%]", className)}>
      <div className="container mx-auto flex justify-between items-center px-6 py-2">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <p className="mt-1 text-blue-500 text-3xl">YieldHop</p>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.name}
                href={item.url}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium rounded-full px-4 py-2 text-foreground/80 hover:bg-muted/50 transition-colors",
                  isActive && "text-purple-600 bg-muted/80"
                )}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Dark Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
            <Moon className="h-4 w-4" />
            <Label htmlFor="dark-mode" className="sr-only">Toggle dark mode</Label>
          </div>

          {/* Wallet Button */}
          <ConnectButton
            client={client}
            appMetadata={{
              name: "ArbiX",
              url: "https://arbix.app", // Replace with your actual app URL
            }}
          />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 mt-[20px] left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/50 shadow-lg md:hidden rounded-xl">
          <div className="container mx-auto px-4 py-3">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.name}
                  href={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50",
                    isActive && "text-purple-600 bg-muted/80"
                  )}
                >
                  <Icon size={20} strokeWidth={2} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* Wallet + Theme in Mobile */}
            <div className="mt-3 flex flex-col gap-2 px-4">
              <ConnectButton
                client={client}
                appMetadata={{
                  name: "Yieldhop",
              
                }}
              />
              <div className="flex items-center mt-2 space-x-2">
                <Sun className="h-4 w-4" />
                <Switch id="dark-mode-mobile" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                <Moon className="h-4 w-4" />
                <Label htmlFor="dark-mode-mobile" className="sr-only">Toggle dark mode</Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
