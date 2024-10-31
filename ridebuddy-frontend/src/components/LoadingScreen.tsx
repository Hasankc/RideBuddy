import React from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const LoadingScreen: React.FC = () => {
  const { isLoading } = useAuth();

  if (!isLoading) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      backgroundColor="rgba(0, 0, 0, 0.5)"
      zIndex={9999}
    >
      <Spinner size="xl" color="white" />
    </Box>
  );
};

export default LoadingScreen;