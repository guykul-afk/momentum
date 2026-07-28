'use client';

import React from 'react';

interface StarveBadgeProps {
  lastPointsAssignedAt?: number;
  className?: string;
}

export function isGoalStarved(_lastPointsAssignedAt?: number): boolean {
  return false;
}

export function getStarvedDays(_lastPointsAssignedAt?: number): number {
  return 0;
}

export function StarveBadge(_props: StarveBadgeProps) {
  return null;
}
