import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Spinner, Center } from '@chakra-ui/react';

// Import components
import Header from './components/Header';
import CampaignList from './components/CampaignList';
import CampaignDetail from './components/CampaignDetail';
import CreateCampaign from './components/CreateCampaign';
import AuthRequired from './components/AuthRequired';

// Import authentication and API services
import { useAuth } from './services/authContext';
import { initializeApi } from './services/api';

const App = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const [isApiInitialized, setIsApiInitialized] = useState(false);

  // Initialize the canister API
  useEffect(() => {
    const init = async () => {
      await initializeApi();
      setIsApiInitialized(true);
    };
    init();
  }, []);

  // Show loading spinner while initializing authentication and API
  if (isInitializing || !isApiInitialized) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <Router>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box as="main" p={4} maxW="1200px" mx="auto">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<CampaignList />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            
            {/* Protected routes */}
            <Route 
              path="/create-campaign" 
              element={
                <AuthRequired>
                  <CreateCampaign />
                </AuthRequired>
              } 
            />
            
            {/* Redirect to home for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;

