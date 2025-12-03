'use client';

import { ProtocolNode } from "../ProtocolNode";
import type { Protocol } from '@/lib/types/protocol';
import { PROTOCOLS } from '@/lib/types/protocol';
import { useProtocolStore } from '@/lib/store/protocolStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigurationForm } from '../configuration/ConfigurationForm';

const ALL_PROTOCOLS: Protocol[] = ['REST', 'GraphQL', 'gRPC', 'SOAP', 'WebSocket'];

export function ProtocolSelector() {
  const { selectedProtocols, clearSelection } = useProtocolStore();

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[#39ff14] mb-4">
          Choose Your Protocols ⚡
        </h2>
        <p className="text-gray-300 text-lg">
          Select 2 protocols to stitch together
        </p>
        
        {/* Selection counter */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className={`
            px-6 py-3 rounded-lg border-2 
            ${selectedProtocols.length === 2 
              ? 'border-[#39ff14] bg-[#1a5c3a] text-[#39ff14]' 
              : 'border-gray-600 bg-gray-900/50 text-gray-400'
            }
          `}>
            <span className="font-bold text-2xl">{selectedProtocols.length}</span>
            <span className="text-sm ml-2">/ 2 selected</span>
          </div>

          {/* Clear button */}
          {selectedProtocols.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearSelection}
              className="px-4 py-2 bg-red-900/50 border border-red-500 text-red-300 rounded-lg hover:bg-red-900 transition-colors"
            >
              Clear Selection
            </motion.button>
          )}
        </div>
      </div>

      {/* Protocol grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {ALL_PROTOCOLS.map((protocol) => (
          <ProtocolNode key={protocol} protocol={protocol} />
        ))}
      </div>

      {/* Connection visualization */}
      <AnimatePresence>
        {selectedProtocols.length === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12 p-8 bg-[#0d1f16] border-2 border-[#39ff14] rounded-2xl"
          >
            <div className="flex items-center justify-center gap-8">
              {/* First protocol */}
              <div className="text-center">
                <div className="text-6xl mb-2">
                  {selectedProtocols[0] && PROTOCOLS[selectedProtocols[0]].icon}
                </div>
                <div className="text-[#39ff14] font-bold text-xl">
                  {selectedProtocols[0]}
                </div>
              </div>

              {/* Lightning bolt connection */}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-[#39ff14] text-4xl"
                >
                  ⚡⚡⚡
                </motion.div>
              </div>

              {/* Second protocol */}
              <div className="text-center">
                <div className="text-6xl mb-2">
                  {selectedProtocols[1] && PROTOCOLS[selectedProtocols[1]].icon}
                </div>
                <div className="text-[#39ff14] font-bold text-xl">
                  {selectedProtocols[1]}
                </div>
              </div>
            </div>
       
          </motion.div>
        )}
      </AnimatePresence>
      {/* Configuration form (appears after selecting 2) */}
      {selectedProtocols.length === 2 && (
        <ConfigurationForm />
      )}
    </div>
  );
}
