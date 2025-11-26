'use client';

import { motion } from 'framer-motion';
import type { Protocol } from '@/lib/types/protocol';
import { PROTOCOLS } from '@/lib/types/protocol';
import { useProtocolStore } from '@/lib/store/protocolStore';

interface ProtocolNodeProps {
  protocol: Protocol;
}

export function ProtocolNode({ protocol }: ProtocolNodeProps) {
  const info = PROTOCOLS[protocol];
  const { selectedProtocols, selectProtocol, deselectProtocol, canSelectMore } = useProtocolStore();
  
  const isSelected = selectedProtocols.includes(protocol);
  const isDisabled = !isSelected && !canSelectMore();

  const handleClick = () => {
    if (isSelected) {
      deselectProtocol(protocol);
    } else if (canSelectMore()) {
      selectProtocol(protocol);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        relative p-6 rounded-2xl border-2 
        transition-all duration-300
        ${isSelected 
          ? 'border-[#39ff14] bg-[#1a5c3a] shadow-[0_0_30px_rgba(57,255,20,0.5)]' 
          : isDisabled
          ? 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
          : 'border-gray-600 bg-[#0d1f16] hover:border-[#39ff14]/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]'
        }
      `}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      animate={isSelected ? {
        boxShadow: [
          '0 0 30px rgba(57,255,20,0.5)',
          '0 0 50px rgba(57,255,20,0.8)',
          '0 0 30px rgba(57,255,20,0.5)',
        ]
      } : {}}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {/* Selection indicator (lightning bolt) */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -top-3 -right-3 bg-[#39ff14] text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg"
        >
          ⚡
        </motion.div>
      )}

      {/* Protocol icon */}
      <div className="text-6xl mb-4">
        {info.icon}
      </div>

      {/* Protocol name */}
      <h3 className={`text-2xl font-bold mb-2 ${isSelected ? 'text-[#39ff14]' : 'text-white'}`}>
        {info.name}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-3">
        {info.description}
      </p>

      {/* Difficulty badge */}
      <div className={`
        inline-block px-3 py-1 rounded-full text-xs font-semibold
        ${info.difficulty === 'Easy' ? 'bg-green-900/50 text-green-300' : ''}
        ${info.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' : ''}
        ${info.difficulty === 'Hard' ? 'bg-red-900/50 text-red-300' : ''}
      `}>
        {info.difficulty}
      </div>
    </motion.button>
  );
}