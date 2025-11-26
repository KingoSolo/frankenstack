'use client';

import { ProtocolSelector } from '@/components/protocol/ProtocolSelector';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a2f1f] py-12 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-7xl font-bold text-[#39ff14] mb-4 drop-shadow-[0_0_30px_rgba(57,255,20,0.7)]">
          FrankenStack ⚡
        </h1>
        <p className="text-2xl text-gray-300">
          Stitch incompatible APIs together with AI
        </p>
        <p className="text-gray-400 mt-2">
          Built with Kiro for Kiroween Hackathon 🎃
        </p>
      </div>

      {/* Protocol Selector */}
      <ProtocolSelector />

      {/* Footer */}
      <div className="text-center mt-20 text-gray-500 text-sm">
        <p>⚡ Powered by Frankenstein's lightning ⚡</p>
      </div>
    </div>
  );
}