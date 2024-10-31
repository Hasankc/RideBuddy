'use client'

import React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  VStack,
  Text,
  useToast,
  IconButton
} from '@chakra-ui/react';
import { Flag, AlertTriangle, UserX, MessageSquareX, Camera } from 'lucide-react';

const reportReasons = [
  {
    icon: UserX,
    label: 'Fake Profile',
    description: 'This profile appears to be fake or impersonating someone'
  },
  {
    icon: MessageSquareX,
    label: 'Inappropriate Messages',
    description: 'Sending harmful or inappropriate content'
  },
  {
    icon: Camera,
    label: 'Inappropriate Photos',
    description: 'Profile contains inappropriate or explicit content'
  },
  {
    icon: AlertTriangle,
    label: 'Other',
    description: 'Other concerning behavior'
  }
];

interface QuickReportProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickReport({ userId, isOpen, onClose }: QuickReportProps) {
  const toast = useToast();

  const handleReport = async (reason: string) => {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          reason,
          timestamp: new Date().toISOString()
        })
      });

      toast({
        title: 'Report Submitted',
        description: 'Thank you for helping keep our community safe',
        status: 'success'
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        status: 'error'
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Report User</ModalHeader>
        <ModalBody pb={6}>
          <VStack spacing={4}>
            {reportReasons.map((reason) => (
              <Button
                key={reason.label}
                w="full"
                h="auto"
                p={4}
                variant="outline"
                justifyContent="flex-start"
                leftIcon={<reason.icon />}
                onClick={() => handleReport(reason.label)}
              >
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{reason.label}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {reason.description}
                  </Text>
                </VStack>
              </Button>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}