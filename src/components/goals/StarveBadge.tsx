'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface StarveBadgeProps {
  lastPointsAssignedAt?: number;
  className?: string;
}

export function isGoalStarved(lastPointsAssignedAt?: number): boolean {
  if (!lastPointsAssignedAt) return true;
  const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
  return Date.now() - lastPointsAssignedAt > TWO_WEEKS_MS;
}

export function getStarvedDays(lastPointsAssignedAt?: number): number {
  if (!lastPointsAssignedAt) return 14;
  const diffMs = Date.now() - lastPointsAssignedAt;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

export function StarveBadge({ lastPointsAssignedAt, className = '' }: StarveBadgeProps) {
  const starved = isGoalStarved(lastPointsAssignedAt);
  if (!starved) return null;

  const days = getStarvedDays(lastPointsAssignedAt);

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs animate-pulse ${className}`}
      title="יעד זה לא קיבל נקודות מאמץ מעל 14 יום"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span>רעב ({days} ימים ללא נקודות)</span>
    </div>
  );
}
