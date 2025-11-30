'use client';

import { ProtocolSelector } from '@/components/protocol/ProtocolSelector';
import { RecentAdaptersList } from '@/components/adapters/RecentAdaptersList';
import { initAudio } from '@/lib/utils/sounds';
import { useEffect } from 'react';
import { KiroBadge } from '@/components/ui/KiroBadge';

export default function Home() {
  useEffect(() => {
    // Initialize audio on first user click
    const handleClick = () => {
      initAudio();
      document.removeEventListener('click', handleClick);
    };
    document.addEventListener('click', handleClick);
    
    return () => document.removeEventListener('click', handleClick);
  }, []);
  return (
    <div className="min-h-screen bg-[#0a2f1f] py-12 px-4">
      {/* Header */}
    <div className="text-center mb-16">
        <h1 className="text-7xl font-bold text-[#39ff14] mb-4 drop-shadow-[0_0_30px_rgba(57,255,20,0.7)]">
          FrankenStack ⚡
        </h1>
        <p className="text-2xl text-gray-300 mb-2">
          Stitch incompatible APIs together with AI
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <p className="text-gray-400">
            Built with Kiro for Kiroween Hackathon 🎃
          </p>
          <KiroBadge />
        </div>
      </div>

      {/* Protocol Selector */}
      <ProtocolSelector />
      <div className="mt-20 max-w-4xl mx-auto">
        <RecentAdaptersList />
      </div>
      {/* Footer */}
      <div className="text-center mt-20 text-gray-500 text-sm">
        <p>⚡ Powered by Frankenstein's lightning ⚡</p>
      </div>
    </div>
  );
}