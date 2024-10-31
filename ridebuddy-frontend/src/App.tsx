import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AppRoutes from './Routes';
import LoadingScreen from './components/LoadingScreen';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <AppRoutes />
          <LoadingScreen />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;