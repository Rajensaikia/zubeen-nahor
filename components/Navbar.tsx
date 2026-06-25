'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Globe,
  Leaf,
  LogOut,
  Menu,
  User,
  Bell,
  ChevronDown,
  LogIn,
  Home,
  Rss,
  Heart,
  Map,
  Trophy,
  Users,
  Calendar,
  Music,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'as' : 'en');
  };

  const menuItems = [
    { name: t('nav_home'), href: '/home', icon: Home },
    { name: t('nav_feed'), href: '/feed', icon: Rss },
    { name: t('nav_music'), href: '/music', icon: Heart },
    { name: t('nav_map'), href: '/map', icon: Map },
    { name: t('nav_leaderboard'), href: '/leaderboard', icon: Trophy },
    { name: t('nav_groups'), href: '/groups', icon: Users },
    { name: t('nav_events'), href: '/events', icon: Calendar },
    { name: t('nav_tribute'), href: '/tribute', icon: Music },
  ];

  if (user) {
    menuItems.push({ name: t('nav_profile'), href: '/profile', icon: User });
    if (user.role === 'ADMIN') {
      menuItems.push({ name: t('nav_admin'), href: '/admin', icon: ShieldCheck });
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border glass bg-opacity-80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand logo & Mobile menu button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 overflow-hidden rounded-xl border border-primary/20 bg-muted shadow-md transition-transform group-hover:scale-105">
              <img
                src="/images/logo.jpg"
                alt="Zubeen Nahor Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-primary">জুবিন নাহৰ</span>
              <span className="hidden sm:inline-block ml-1 text-xs font-semibold text-muted-foreground tracking-widest uppercase">Zubeen Nahor</span>
            </div>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium bg-card text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>{language === 'en' ? 'অসমীয়া' : 'English'}</span>
          </button>

          {/* User Specific actions */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notification icon */}
              <Link
                href="/profile"
                className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-accent"></span>
              </Link>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full p-1 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full border-2 border-primary object-cover shadow-sm"
                  />
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                      <div className="px-3 py-2 border-b border-border mb-1.5">
                        <p className="text-sm font-semibold truncate text-foreground">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <User className="h-4 w-4 text-primary" />
                        <span>{t('nav_profile')}</span>
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <Leaf className="h-4 w-4 text-accent" />
                          <span>{t('nav_admin')}</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-accent hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('nav_logout')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-secondary shadow-md transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>{t('nav_login')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Row: Horizontal Navigation for Tablet & Desktop */}
      <div className="hidden md:block border-t border-border/45 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10 scale-[1.01]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
