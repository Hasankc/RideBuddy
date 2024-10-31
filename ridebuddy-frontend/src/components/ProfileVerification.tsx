'use client'

import React from 'react';
import { Box, VStack, Button, Text, Icon, useToast } from '@chakra-ui/react';
import { Camera, Check, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import * as faceapi from 'face-api.js';

export default function ProfileVerification() {
  const [isVerifying, setIsVerifying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const toast = useToast();

  const startVerification = async () => {
    setIsVerifying(true);
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not access camera',
        status: 'error'
      });
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const detections = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detections) {
        const context = canvasRef.current.getContext('2d');
        context?.drawImage(videoRef.current, 0, 0, 640, 480);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        await submitVerification(imageData);
      } else {
        toast({
          title: 'No face detected',
          description: 'Please ensure your face is clearly visible',
          status: 'warning'
        });
      }
    }
  };

  const submitVerification = async (imageData: string) => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: 'Verification successful',
          status: 'success'
        });
      }
    } catch (error) {
      toast({
        title: 'Verification failed',
        status: 'error'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Box p={6} borderRadius="xl" bg="white" shadow="xl">
      <VStack spacing={6}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <Icon as={Shield} w={12} h={12} color="blue.500" />
        </motion.div>

        <Text fontSize="xl" fontWeight="bold">Profile Verification</Text>

        {isVerifying ? (
          <Box position="relative">
            <video
              ref={videoRef}
              autoPlay
              style={{ borderRadius: '1rem' }}
              width="640"
              height="480"
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
              width="640"
              height="480"
            />
            <Button
              position="absolute"
              bottom={4}
              left="50%"
              transform="translateX(-50%)"
              colorScheme="blue"
              leftIcon={<Camera />}
              onClick={captureImage}
            >
              Take Photo
            </Button>
          </Box>
        ) : (
          <Button
            colorScheme="blue"
            leftIcon={<Camera />}
            onClick={startVerification}
          >
            Start Verification
          </Button>
        )}

        <VStack spacing={2} textAlign="center">
          <Text color="gray.600">
            Get a verified badge on your profile
          </Text>
          <Text fontSize="sm" color="gray.500">
            Take a photo matching your profile picture
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}