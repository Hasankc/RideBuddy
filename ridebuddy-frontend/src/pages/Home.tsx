import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const Home: React.FC = () => {
  return (
    <Box maxWidth="800px" margin="auto" mt={10} p={4}>
      <Heading as="h1" mb={4}>Welcome to RideBuddy</Heading>
      <Text>Find your perfect ride companion!</Text>
    </Box>
  );
};

export default Home;