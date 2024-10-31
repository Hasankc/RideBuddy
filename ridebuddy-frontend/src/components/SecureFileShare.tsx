'use client'

import React, { useState } from 'react';
import {
  Box,
  Button,
  Progress,
  Text,
  VStack,
  useToast,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { File, Upload, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { encrypt } from '../utils/encryption';

interface SecureFileShareProps {
  onFileShare: (url: string) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export default function SecureFileShare({
  onFileShare,
  maxSize = 10,
  allowedTypes = ['image/*', 'application/pdf']
}: SecureFileShareProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return selectedFile.type.startsWith(type.replace('/*', ''));
      }
      return selectedFile.type === type;
    });

    if (!isValidType) {
      setError('Invalid file type');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const uploadFile = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setProgress(0);

      // Encrypt file before upload
      const encryptedFile = await encrypt(file);
      
      const formData = new FormData();
      formData.append('file', encryptedFile);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          setProgress(percentage);
        }
      });

      xhr.upload.addEventListener('load', () => {
        setProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setFile(null);
          toast({
            title: 'File uploaded successfully',
            status: 'success',
            duration: 3000,
          });
        }, 500);
      });

      xhr.upload.addEventListener('error', () => {
        setError('Upload failed');
        setIsUploading(false);
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);

    } catch (error) {
      setError('Error uploading file');
      setIsUploading(false);
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <VStack spacing={4} w="full" p={4}>
      <Box
        w="full"
        h="200px"
        border="2px dashed"
        borderColor={error ? 'red.300' : 'gray.200'}
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        _hover={{ borderColor: 'blue.300' }}
        transition="all 0.2s"
      >
        <input
          type="file"
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />

        <AnimatePresence>
          {file ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VStack spacing={2}>
                <Icon as={File} w={8} h={8} color="blue.500" />
                <Text>{file.name}</Text>
                <Text color="gray.500" fontSize="sm">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </VStack>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <VStack spacing={2}>
                <Icon as={Upload} w={8} h={8} color="gray.400" />
                <Text color="gray.500">
                  Drag and drop or click to select a file
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Max size: {maxSize}MB
                </Text>
              </VStack>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {error && (
        <HStack color="red.500" fontSize="sm">
          <Icon as={AlertTriangle} w={4} h={4} />
          <Text>{error}</Text>
        </HStack>
      )}

      {isUploading && (
        <Box w="full">
          <Progress
            value={progress}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
          />
          <Text fontSize="sm" color="gray.500" mt={1}>
            Uploading... {progress}%
          </Text>
        </Box>
      )}

      <Button
        colorScheme="blue"
        isDisabled={!file || isUploading}
        onClick={uploadFile}
        w="full"
        leftIcon={isUploading ? <Check /> : <Upload />}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </Button>
    </VStack>
  );
}