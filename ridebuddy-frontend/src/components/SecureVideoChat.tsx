'use client'

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Camera, CameraOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoChatProps {
  matchId: string;
  onEnd: () => void;
}

export default function SecureVideoChat({ matchId, onEnd }: VideoChatProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const toast = useToast();

  useEffect(() => {
    initializeCall();
    return () => {
      cleanupCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
            urls: process.env.NEXT_PUBLIC_TURN_SERVER,
            username: process.env.NEXT_PUBLIC_TURN_USERNAME,
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL
          }
        ]
      });

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

      // Handle incoming tracks
      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      setIsConnecting(false);

      // Start timer
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);

    } catch (error) {
      console.error('Error initializing call:', error);
      toast({
        title: 'Error starting video call',
        status: 'error',
        duration: 5000,
      });
      onEnd();
    }
  };

  const cleanupCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box position="relative" h="100vh" bg="black">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Local Video (Picture-in-Picture) */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: '200px',
            height: '150px',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <VStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={4}
        bg="rgba(0, 0, 0, 0.5)"
        spacing={4}
      >
        <Text color="white" fontSize="sm">
          {formatTime(timeElapsed)}
        </Text>
        
        <HStack spacing={4}>
          <IconButton
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            icon={isMuted ? <MicOff /> : <Mic />}
            onClick={toggleMute}
            colorScheme={isMuted ? 'red' : 'gray'}
            rounded="full"
            size="lg"
          />
          
          <IconButton
            aria-label="End Call"
            icon={<PhoneOff />}
            onClick={onEnd}
            colorScheme="red"
            rounded="full"
            size="lg"
          />
          
          <IconButton
            aria-label={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            icon={isVideoOff ? <CameraOff /> : <Camera />}
            onClick={toggleVideo}
            colorScheme={isVideoOff ? 'red' : 'gray'}
            rounded="full"
            size="lg"
          />
        </HStack>
      </VStack>

      {/* Connecting Overlay */}
      {isConnecting && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack spacing={4}>
            <Text color="white" fontSize="xl">
              Connecting...
            </Text>
            <Button
              colorScheme="red"
              onClick={onEnd}
            >
              Cancel
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
}