import React, { Component, ErrorInfo, ReactNode } from "react"
import { Box, Heading, Text, Button } from "@chakra-ui/react"

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" py={10}>
          <Heading as="h2" size="xl" mb={4}>
            Oops, there was an error!
          </Heading>
          <Text fontSize="lg" mb={4}>
            Something went wrong. Please try refreshing the page or contact support if the problem persists.
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;