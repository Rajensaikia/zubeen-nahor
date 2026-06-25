'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Home,
  Rss,
  Map,
  Trophy,
  Users,
  Calendar,
  Music,
  User,
  ShieldCheck,
  X,
  Leaf,
  Heart
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card p-4 transition-transform md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4 md:hidden">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/logo.jpg"
              alt="Zubeen Nahor Logo"
              className="h-6 w-6 rounded-lg object-cover border border-primary/20"
            />
            <span className="font-bold text-foreground">Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Box */}
        <div className="mt-auto rounded-2xl bg-muted p-4 border border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Motto</p>
          <p className="text-sm font-bold text-foreground italic leading-snug">
            "{t('motto')}"
          </p>
        </div>
      </aside>
    </>
  );
};
