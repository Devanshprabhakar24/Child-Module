"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingCreditProps {
  amount: number;
  x: number;
  y: number;
  onComplete: () => void;
}

export default function FloatingCredit({ amount, x, y, onComplete }: FloatingCreditProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y, scale: 0.5 }}
      animate={{ opacity: 0, y: y - 150, scale: 1.2 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-50 text-3xl font-bold"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2 text-emerald-500 drop-shadow-lg">
        <span>+{amount}</span>
        <span className="text-2xl">🌱</span>
      </div>
    </motion.div>
  );
}

// Hook to show floating credits
export function useFloatingCredit() {
  const [floatingCredits, setFloatingCredits] = useState<Array<{
    id: number;
    amount: number;
    x: number;
    y: number;
  }>>([]);

  const showFloatingCredit = (amount: number, event?: React.MouseEvent) => {
    const x = event?.clientX || window.innerWidth / 2;
    const y = event?.clientY || window.innerHeight / 2;
    
    const newCredit = {
      id: Date.now(),
      amount,
      x,
      y,
    };
    
    setFloatingCredits(prev => [...prev, newCredit]);
  };

  const removeFloatingCredit = (id: number) => {
    setFloatingCredits(prev => prev.filter(credit => credit.id !== id));
  };

  return {
    floatingCredits,
    showFloatingCredit,
    removeFloatingCredit,
  };
}
