'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { listAdapters } from '@/lib/api';
import type { Adapter } from '@/lib/types/adapter';
import { PROTOCOLS } from '@/lib/types/protocol';

export function RecentAdaptersList() {
  const [adapters, setAdapters] = useState<Adapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdapters() {
      try {
        const data = await listAdapters();
        setAdapters(data.slice(0, 5)); // Show last 5
      } catch (error) {
        console.error('Failed to fetch adapters:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAdapters();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400">
        <div className="animate-spin text-4xl">⚡</div>
        <p className="mt-2">Loading adapters...</p>
      </div>
    );
  }

  if (adapters.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg">No adapters generated yet</p>
        <p className="text-sm mt-2">Create your first adapter above! ⚡</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-[#39ff14] mb-4">
        Recently Generated ⚡
      </h3>
      
      {adapters.map((adapter, index) => {
        const sourceInfo = PROTOCOLS[adapter.sourceProtocol];
        const targetInfo = PROTOCOLS[adapter.targetProtocol];
        
        return (
          <motion.div
            key={adapter.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-[#0d1f16] border border-gray-700 rounded-lg hover:border-[#39ff14] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{sourceInfo.icon}</span>
                <span className="text-[#39ff14] text-xl">⚡→</span>
                <span className="text-3xl">{targetInfo.icon}</span>
                
                <div className="ml-4">
                  <div className="font-semibold text-white">
                    {adapter.sourceProtocol} → {adapter.targetProtocol}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(adapter.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {adapter.code?.split('\n').length ?? 'No code yet'}
              </div>

            </div>
          </motion.div>
        );
      })}
    </div>
  );
}