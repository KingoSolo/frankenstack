'use client';

import { motion } from 'framer-motion';

interface KiroBadgeProps {
  variant?: 'default' | 'large' | 'inline';
  animated?: boolean;
}

export function KiroBadge({ variant = 'default', animated = true }: KiroBadgeProps) {
  const sizes = {
    default: 'px-3 py-1 text-xs',
    large: 'px-4 py-2 text-sm',
    inline: 'px-2 py-0.5 text-xs',
  };

  const badge = (
    <div className={`
      inline-flex items-center gap-2 
      bg-gradient-to-r from-purple-900/50 to-blue-900/50
      border border-purple-500
      rounded-full
      ${sizes[variant]}
      font-semibold text-purple-200
    `}>
      <span className="text-lg">🤖</span>
      <span>Powered by Kiro</span>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}