import React from 'react'
import { Box, Flex, Heading, Button, useColorModeValue, IconButton, useDisclosure } from "@chakra-ui/react"
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from "react-router-dom"
import { useAuth } from '../contexts/AuthContext'

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth()
  const { isOpen, onToggle } = useDisclosure()
  const bgColor = useColorModeValue('white', 'gray.800')

  return (
    <Box as="header" width="100%" py={4} bg={bgColor} boxShadow="sm">
      <Flex alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto" px={[4, 6]}>
        <Heading as="h1" size="lg">
          <RouterLink to="/">RideBuddy</RouterLink>
        </Heading>
        <IconButton
          display={{ base: 'block', md: 'none' }}
          onClick={onToggle}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          variant="ghost"
          aria-label="Toggle Navigation"
        />
        <Flex
          display={{ base: isOpen ? 'flex' : 'none', md: 'flex' }}
          width={{ base: 'full', md: 'auto' }}
          alignItems="center"
          flexGrow={1}
          flexDirection={{ base: 'column', md: 'row' }}
        >
          {isAuthenticated ? (
            <>
              <Button as={RouterLink} to="/swipe" variant="ghost" my={[2, 0]} mx={[0, 2]}>Swipe</Button>
              <Button as={RouterLink} to="/matches" variant="ghost" my={[2, 0]} mx={[0, 2]}>Matches</Button>
              <Button as={RouterLink} to="/profile" variant="ghost" my={[2, 0]} mx={[0, 2]}>Profile</Button>
              <Button onClick={logout} variant="outline" my={[2, 0]} mx={[0, 2]}>Logout</Button>
            </>
          ) : (
            <>
              <Button as={RouterLink} to="/login" variant="ghost" my={[2, 0]} mx={[0, 2]}>Login</Button>
              <Button as={RouterLink} to="/register" variant="outline" my={[2, 0]} mx={[0, 2]}>Register</Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}

export default Header