'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { QuickCaptureModal } from './QuickCaptureModal';

export function FAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-20 left-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-full shadow-xl hover:shadow-cyan-500/25 active:scale-95 transition-all duration-200"
          aria-label="לכידת משימה מהירה"
        >
          <Plus className="w-7 h-7 transition-transform duration-200 group-hover:rotate-90 stroke-[2.5]" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-300 rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>

      <QuickCaptureModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
