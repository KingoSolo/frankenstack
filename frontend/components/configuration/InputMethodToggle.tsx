'use client';

import { motion } from 'framer-motion';
import type { InputMethod } from '@/lib/types/adapter';
import { useProtocolStore } from '@/lib/store/protocolStore';

export function InputMethodToggle() {
  const { inputMethod, setInputMethod } = useProtocolStore();

  const options: { value: InputMethod; label: string; icon: string }[] = [
    { value: 'natural-language', label: 'Describe It', icon: '💬' },
    { value: 'documentation', label: 'Paste Docs', icon: '📄' },
  ];

  return (
    <div className="flex gap-4 justify-center mb-8">
      {options.map((option) => {
        const isActive = inputMethod === option.value;
        
        return (
          <motion.button
            key={option.value}
            onClick={() => setInputMethod(option.value)}
            className={`
              relative px-6 py-3 rounded-lg border-2 font-semibold
              transition-all duration-300
              ${isActive 
                ? 'border-[#39ff14] bg-[#1a5c3a] text-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.5)]' 
                : 'border-gray-600 bg-gray-900/50 text-gray-300 hover:border-gray-500'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
            
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 border-2 border-[#39ff14] rounded-lg"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}