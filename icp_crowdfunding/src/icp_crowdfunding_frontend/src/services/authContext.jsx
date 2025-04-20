import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Create the Authentication Context
const AuthContext = createContext(null);

// Default authentication options
const defaultAuthOptions = {
  identityProvider: process.env.DFX_NETWORK === 'ic' 
    ? 'https://identity.ic0.app'
    : `http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
  maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
};

// Provider component that wraps the application
export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize the auth client
  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        const isLoggedIn = await client.isAuthenticated();
        setIsAuthenticated(isLoggedIn);
        
        if (isLoggedIn) {
          const currentIdentity = client.getIdentity();
          setIdentity(currentIdentity);
          setPrincipal(currentIdentity.getPrincipal());
        }
      } catch (error) {
        console.error('Failed to initialize auth client:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async () => {
    if (!authClient) return;
    
    await authClient.login({
      ...defaultAuthOptions,
      onSuccess: async () => {
        setIsAuthenticated(true);
        const currentIdentity = authClient.getIdentity();
        setIdentity(currentIdentity);
        setPrincipal(currentIdentity.getPrincipal());
      },
    });
  };

  // Logout function
  const logout = async () => {
    if (!authClient) return;
    
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setPrincipal(null);
  };

  // Context value
  const value = {
    authClient,
    isAuthenticated,
    identity,
    principal,
    login,
    logout,
    isInitializing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

