'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Clock } from 'lucide-react';

interface WelcomeMessageProps {
  userName: string;
  lastVisit: Date | null;
}

export function WelcomeMessage({ userName, lastVisit }: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const now = new Date();
    const storedVisibility = localStorage.getItem('welcomeMessageSeen');

    if (storedVisibility === 'true') {
      setIsVisible(false);
      return;
    }

    if (!lastVisit) {
      setMessage(`Welcome, ${userName}!`);
      setSubMessage("We're thrilled to have you here. Let's get started.");
    } else {
      const daysSinceLastVisit = Math.floor(
        (now.getTime() - lastVisit.getTime()) / (1000 * 3600 * 24)
      );
      if (daysSinceLastVisit > 30) {
        setMessage(`Good to see you again, ${userName}!`);
        setSubMessage(`You've been away for ${daysSinceLastVisit} days — a lot has happened.`);
      } else {
        setMessage(`Welcome back, ${userName}!`);
        setSubMessage("Ready to pick up where you left off?");
      }
    }

    // Animate progress bar countdown
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 2));
    }, 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('welcomeMessageSeen', 'true');
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [userName, lastVisit]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('welcomeMessageSeen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
        >
          {/* Subtle ambient glow */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative flex items-start gap-4 px-5 py-5">
            {/* Icon badge */}
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/30">
              {lastVisit ? (
                <Clock className="h-5 w-5 text-indigo-400" />
              ) : (
                <Sparkles className="h-5 w-5 text-indigo-400" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold tracking-tight text-white">
                {message}
              </p>
              <p className="mt-0.5 text-sm text-zinc-400">
                {subMessage}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Explore your dashboard for the latest school activities and announcements.
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
              aria-label="Close welcome message"
            >
              <X size={15} />
            </button>
          </div>

          {/* Auto-dismiss progress bar */}
          <div className="h-0.5 w-full bg-white/5">
            <motion.div
              className="h-full bg-indigo-500"
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}