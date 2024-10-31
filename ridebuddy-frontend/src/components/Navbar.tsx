import React from 'react';
import { Box, Flex, Link, Button, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Box bg="gray.100" px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Box>
          <Link as={RouterLink} to="/" fontWeight="bold">
            RideBuddy
          </Link>
        </Box>

        <Flex alignItems={'center'}>
          <Stack direction={'row'} spacing={7}>
            {isAuthenticated ? (
              <>
                <Link as={RouterLink} to="/profile">
                  Profile
                </Link>
                <Link as={RouterLink} to="/swipe">
                  Swipe
                </Link>
                <Link as={RouterLink} to="/events">
                  Events
                </Link>
                <Button onClick={logout}>Log out</Button>
              </>
            ) : (
              <>
                <Link as={RouterLink} to="/login">
                  Login
                </Link>
                <Link as={RouterLink} to="/register">
                  Register
                </Link>
              </>
            )}
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;