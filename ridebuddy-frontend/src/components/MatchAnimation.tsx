import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Image, Text, Button, VStack, HStack } from '@chakra-ui/react';
import confetti from 'canvas-confetti';

interface MatchAnimationProps {
  matchedUser: {
    name: string;
    image: string;
  };
  currentUser: {
    image: string;
  };
  onClose: () => void;
  onStartChat: () => void;
}

export const MatchAnimation: React.FC<MatchAnimationProps> = ({
  matchedUser,
  currentUser,
  onClose,
  onStartChat
}) => {
  React.useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <VStack
            bg="white"
            p={8}
            borderRadius="2xl"
            spacing={6}
            maxW="400px"
            w="90%"
            position="relative"
            overflow="hidden"
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Text
                fontSize="3xl"
                fontWeight="bold"
                bgGradient="linear(to-r, pink.500, purple.500)"
                bgClip="text"
              >
                It's a Match!
              </Text>
            </motion.div>

            <HStack spacing={4} position="relative">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Image
                  src={currentUser.image}
                  alt="You"
                  boxSize="120px"
                  borderRadius="full"
                  border="4px solid"
                  borderColor="pink.500"
                />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Box
                  position="relative"
                  w="40px"
                  h="40px"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    <Text fontSize="3xl">💖</Text>
                  </motion.div>
                </Box>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Image
                  src={matchedUser.image}
                  alt={matchedUser.name}
                  boxSize="120px"
                  borderRadius="full"
                  border="4px solid"
                  borderColor="purple.500"
                />
              </motion.div>
            </HStack>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Text fontSize="lg" textAlign="center" color="gray.600">
                You and {matchedUser.name} liked each other!
              </Text>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <VStack spacing={3}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={onStartChat}
                >
                  Send a Message
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                >
                  Keep Swiping
                </Button>
              </VStack>
            </motion.div>
          </VStack>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};