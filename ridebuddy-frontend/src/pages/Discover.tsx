import React, { useState } from 'react'
import { Box, VStack, Heading, Text, Image, Button, Flex } from "@chakra-ui/react"
import { motion, useAnimation } from "framer-motion"

interface Rider {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
}

const mockRiders: Rider[] = [
  { id: '1', name: 'Alice', age: 28, bio: 'Love long rides on the coast', image: '/placeholder.svg?height=300&width=300' },
  { id: '2', name: 'Bob', age: 32, bio: 'Mountain trails enthusiast', image: '/placeholder.svg?height=300&width=300' },
  { id: '3', name: 'Charlie', age: 25, bio: 'City cruiser and coffee lover', image: '/placeholder.svg?height=300&width=300' },
]

const Discover: React.FC = () => {
  const [currentRiderIndex, setCurrentRiderIndex] = useState(0)
  const controls = useAnimation()

  const handleSwipe = async (direction: 'left' | 'right') => {
    await controls.start({ x: direction === 'left' ? -300 : 300, opacity: 0 })
    setCurrentRiderIndex((prevIndex) => (prevIndex + 1) % mockRiders.length)
    controls.set({ x: 0, opacity: 1 })
  }

  const currentRider = mockRiders[currentRiderIndex]

  return (
    <Box>
      <Heading as="h2" size="xl" mb={6}>Discover Riders</Heading>
      <VStack spacing={4} align="stretch">
        <motion.div animate={controls}>
          <Box borderWidth={1} borderRadius="lg" overflow="hidden">
            <Image src={currentRider.image} alt={currentRider.name} />
            <Box p={6}>
              <Heading as="h3" size="lg">{currentRider.name}, {currentRider.age}</Heading>
              <Text mt={2}>{currentRider.bio}</Text>
            </Box>
          </Box>
        </motion.div>
        <Flex justifyContent="space-between">
          <Button onClick={() => handleSwipe('left')} colorScheme="red">Pass</Button>
          <Button onClick={() => handleSwipe('right')} colorScheme="green">Like</Button>
        </Flex>
      </VStack>
    </Box>
  )
}

export default Discover