'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TodayPage from './(tabs)/today/page';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      router.replace('/today');
    }
  }, [router]);

  return <TodayPage />;
}
