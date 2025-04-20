import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Center, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription, Box, Button } from '@chakra-ui/react';
import { useAuth } from '../services/authContext';

/**
 * A wrapper component for protected routes that require authentication
 * Redirects to home page if not authenticated
 */
const AuthRequired = ({ children }) => {
  const { isAuthenticated, isInitializing, login } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication status is being initialized
  if (isInitializing) {
    return (
      <Center h="calc(100vh - 150px)">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  // If authenticated, render the child components
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated, show login prompt or redirect
  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Alert
        status="warning"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        borderRadius="md"
        py={6}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="xl">
          Authentication Required
        </AlertTitle>
        <AlertDescription maxWidth="sm" mb={4}>
          You need to be logged in to access this page.
        </AlertDescription>
        <Button
          colorScheme="brand"
          size="md"
          mt={2}
          onClick={() => login()}
        >
          Login with Internet Identity
        </Button>
      </Alert>
      
      {/* This Navigate component will redirect if the user refreshes the page */}
      <Navigate to="/" state={{ from: location }} replace />
    </Box>
  );
};

export default AuthRequired;

