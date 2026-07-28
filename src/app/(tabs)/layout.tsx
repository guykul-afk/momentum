'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, Inbox, Moon, Target, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/lib/store';

import { Plus } from 'lucide-react';
import { SyncStatusBadge } from '@/components/SyncStatusBadge';
import { QuickAddModal } from '@/components/QuickAddModal';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { rawCaptures } = useAppStore();
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);
  const [quickAddDefaultTab, setQuickAddDefaultTab] = React.useState<'goal' | 'task'>('goal');

  const pendingInboxCount = rawCaptures.filter((c) => c.status === 'inbox').length;

  const openQuickAdd = (tab: 'goal' | 'task') => {
    setQuickAddDefaultTab(tab);
    setIsQuickAddOpen(true);
  };

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

  const isItemActive = (href: string) => {
    if (pathname === href) return true;
    if (href === '/today' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex justify-center">
      {/* Mobile-width container with top safe-area padding and bottom navigation padding */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative border-x border-slate-200/60 app-page-wrapper">
        
        {/* Top Header Bar with Sync Status Indicator & Quick Add Button */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 py-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Momentum
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openQuickAdd('goal')}
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white text-xs font-bold rounded-full shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>יעד חדש</span>
              </button>

              <SyncStatusBadge />
            </div>
          </div>
          <div className="flex items-center gap-1.5 w-full justify-between overflow-x-auto no-scrollbar pb-0.5">
            {navItems.map((item) => {
              const isActive = isItemActive(item.href);
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
            const isActive = isItemActive(item.href);
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

        {/* Floating Action Button (FAB) for Quick Goal/Task Addition */}
        <button
          type="button"
          onClick={() => openQuickAdd('goal')}
          title="הוסף יעד או משימה"
          className="fixed bottom-20 left-6 sm:left-auto z-40 p-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl active:scale-90 transition-all flex items-center justify-center group"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold mr-0 group-hover:mr-1.5">
            הוסף יעד / משימה
          </span>
        </button>

        {/* Global Quick Add Modal */}
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          defaultTab={quickAddDefaultTab}
        />
      </div>
    </div>
  );
}
