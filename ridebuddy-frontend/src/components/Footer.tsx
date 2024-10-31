import React from 'react'
import { Box, Text, useColorModeValue } from "@chakra-ui/react"

const Footer: React.FC = () => {
  const bgColor = useColorModeValue('gray.100', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box as="footer" width="100%" py={4} bg={bgColor} mt="auto">
      <Text textAlign="center" color={textColor}>
        © {new Date().getFullYear()} RideBuddy. All rights reserved.
      </Text>
    </Box>
  )
}

export default Footer