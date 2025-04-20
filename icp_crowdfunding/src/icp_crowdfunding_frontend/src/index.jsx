import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';

// Define the Chakra UI theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6F7FF',
      100: '#B3E0FF',
      200: '#80CAFF',
      300: '#4DB3FF',
      400: '#1A9DFF',
      500: '#0088FF', // primary color
      600: '#006ECC',
      700: '#005499',
      800: '#003B66',
      900: '#002133',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
});

// Initialize the React application
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
