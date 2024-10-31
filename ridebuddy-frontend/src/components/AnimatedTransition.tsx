'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  slide: {
    left: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
    },
    right: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 50 },
    },
    up: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -50 },
    },
    down: {
      initial: { opacity: 0, y: -50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    },
  },
};

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  type = 'fade',
  direction = 'left',
  duration = 0.3,
  delay = 0,
}) => {
  const getVariants = () => {
    if (type === 'slide') {
      return variants.slide[direction];
    }
    return variants[type];
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getVariants()}
        transition={{
          duration,
          delay,
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};