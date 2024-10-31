'use client'

import React from 'react';
import { Box, BoxProps, Skeleton } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps extends BoxProps {
  src: string;
  alt: string;
  blur?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  blur,
  ...props
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const imageRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (!imageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageRef.current) {
            imageRef.current.src = src;
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(imageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <Box position="relative" overflow="hidden" {...props}>
      <AnimatePresence>
        {isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <Skeleton
              startColor="gray.100"
              endColor="gray.300"
              height="100%"
              width="100%"
            />
            {blur && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundImage={`url(${blur})`}
                backgroundSize="cover"
                backgroundPosition="center"
                filter="blur(10px)"
                transform="scale(1.1)"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        ref={imageRef}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        loading="lazy"
      />

      {error && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="gray.500"
        >
          Failed to load image
        </Box>
      )}
    </Box>
  );
};