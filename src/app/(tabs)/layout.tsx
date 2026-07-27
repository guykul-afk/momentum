'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, Inbox, Moon, Target, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { rawCaptures } = useAppStore();

  const pendingInboxCount = rawCaptures.filter((c) => c.status === 'inbox').length;

  const navItems = [
    {
      href: '/today',
      label: 'היום',
      icon: CalendarCheck,
    },
    {
      href: '/inbox',
      label: 'אינבוקס',
      icon: Inbox,
      badge: pendingInboxCount > 0 ? pendingInboxCount : undefined,
    },
    {
      href: '/goals',
      label: 'יעדים',
      icon: Target,
    },
    {
      href: '/stats',
      label: 'דוחות',
      icon: TrendingUp,
    },
    {
      href: '/rituals/end-of-day',
      label: 'סיכום יום',
      icon: Moon,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex justify-center">
      {/* Mobile-width container with top safe-area padding and bottom navigation padding */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative border-x border-slate-200/60 app-page-wrapper">
        
        {/* Top Navigation Bar / Tabs Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-3 py-2 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 w-full justify-between">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && (
                    <span className="mr-1 bg-white text-cyan-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Main Content (Standard Document Scroll) */}
        <main className="flex-1 px-4 pt-2 pb-4">
          {children}
        </main>

        {/* Fixed Thumb-Accessible Bottom Navigation Bar */}
        <nav className="app-bottom-nav px-2 flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-cyan-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-1 bg-cyan-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
