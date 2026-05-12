'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface Props {
  message: string;
  onDismiss: () => void;
}

export default function PhaseMessage({ message, onDismiss }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6"
      >
        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80 flex-1">{message}</p>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground text-xs shrink-0"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
