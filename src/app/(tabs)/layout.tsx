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
      {/* Container simulating a mobile device target (390px max-w on mobile, expanding gracefully) */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] border-x border-slate-200/60">
        
        {/* Dynamic Content */}
        <main className="flex-1 px-4 pt-5 pb-6">
          {children}
        </main>

        {/* Thumb-Accessible Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex justify-around items-center z-50 shadow-2xl">
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
