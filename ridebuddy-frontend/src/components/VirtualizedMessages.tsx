'use client'

import React from 'react';
import { VStack, Box } from '@chakra-ui/react';
import { useVirtual } from 'react-virtual';
import { Message } from '../types';

interface VirtualizedMessagesProps {
  messages: Message[];
  parentRef: React.RefObject<HTMLDivElement>;
}

export default function VirtualizedMessages({ messages, parentRef }: VirtualizedMessagesProps) {
  const rowVirtualizer = useVirtual({
    size: messages.length,
    parentRef,
    estimateSize: React.useCallback(() => 50, []),
    overscan: 5
  });

  React.useEffect(() => {
    rowVirtualizer.scrollToIndex(messages.length - 1);
  }, [messages.length]);

  return (
    <VStack
      spacing={0}
      align="stretch"
      height={parentRef.current?.getBoundingClientRect().height}
      width="100%"
      position="relative"
    >
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              ref={virtualRow.measureRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <MessageItem message={message} />
            </div>
          );
        })}
      </div>
    </VStack>
  );
}

const MessageItem = React.memo(({ message }: { message: Message }) => {
  return (
    <Box
      p={2}
      bg={message.isMine ? 'blue.500' : 'gray.100'}
      color={message.isMine ? 'white' : 'black'}
      borderRadius="lg"
      maxW="70%"
      ml={message.isMine ? 'auto' : 0}
    >
      {message.content}
    </Box>
  );
});