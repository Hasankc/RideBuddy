import React from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Box, BoxProps } from '@chakra-ui/react';

interface AnimatedCardProps extends BoxProps {
  onSwipe?: (direction: 'left' | 'right') => void;
  children: React.ReactNode;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  onSwipe,
  children,
  ...props
}) => {
  const controls = useAnimation();

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 800) {
      await controls.start({ x: 500, opacity: 0 });
      onSwipe?.('right');
    } else if (offset < -100 || velocity < -800) {
      await controls.start({ x: -500, opacity: 0 });
      onSwipe?.('left');
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ opacity: 1 }}
      whileDrag={{ scale: 1.05 }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      <Box
        as={motion.div}
        style={{ width: '100%', height: '100%' }}
        {...props}
      >
        {children}
      </Box>
    </motion.div>
  );
};