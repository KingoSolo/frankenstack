'use client';

import { useEffect, useState } from 'react';
import { fetchBackendHealth } from '@/lib/api';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Call backend when page loads
    fetchBackendHealth()
      .then((data) => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Backend not connected ❌'));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a2f1f] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#39ff14] mb-4">
          FrankenStack ⚡
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Stitch APIs together with AI
        </p>
        <div className="bg-[#1a5c3a] px-6 py-4 rounded-lg">
          <p className="text-[#39ff14]">Backend Status:</p>
          <p className="text-white text-lg mt-2">{backendStatus}</p>
        </div>
      </div>
    </div>
  );
}