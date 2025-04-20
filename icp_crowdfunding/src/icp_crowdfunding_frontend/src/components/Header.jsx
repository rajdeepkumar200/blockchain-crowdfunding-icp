import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  Heading,
  HStack,
  Link,
  useColorModeValue,
  Text,
  Container,
  useDisclosure,
  IconButton,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../services/authContext';

// Navigation link component
const NavLink = ({ children, to, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      as={RouterLink}
      to={to}
      px={2}
      py={1}
      rounded={'md'}
      fontWeight={isActive ? 'bold' : 'medium'}
      color={isActive ? 'brand.600' : 'gray.600'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.100', 'gray.700'),
      }}
      {...rest}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  const { isAuthenticated, login, logout, principal } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Format principal ID for display
  const formatPrincipal = (principal) => {
    if (!principal) return '';
    const principalStr = principal.toString();
    return `${principalStr.substring(0, 5)}...${principalStr.substring(principalStr.length - 3)}`;
  };
  
  return (
    <Box 
      bg={bg} 
      px={4} 
      position="sticky" 
      top={0} 
      zIndex={10} 
      boxShadow="sm"
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW={'1200px'}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          {/* Mobile hamburger menu */}
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          
          {/* Logo and desktop navigation */}
          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <Heading 
                as={RouterLink} 
                to="/" 
                size="md" 
                color="brand.500"
                _hover={{ textDecoration: 'none' }}
              >
                ICP Crowdfunding
              </Heading>
            </Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/campaigns">Explore</NavLink>
              <NavLink to="/how-it-works">How It Works</NavLink>
              {isAuthenticated && (
                <NavLink to="/create-campaign">Create Campaign</NavLink>
              )}
            </HStack>
          </HStack>
          
          {/* Authentication area */}
          <Flex alignItems={'center'}>
            {isAuthenticated ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <HStack>
                    <Avatar
                      size={'sm'}
                      bg="brand.500"
                      color="white"
                      name={formatPrincipal(principal)}
                    />
                    <Text display={{ base: 'none', md: 'block' }}>
                      {formatPrincipal(principal)}
                    </Text>
                    <ChevronDownIcon />
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/my-campaigns">My Campaigns</MenuItem>
                  <MenuItem as={RouterLink} to="/my-contributions">My Contributions</MenuItem>
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                variant={'solid'}
                colorScheme={'brand'}
                size={'sm'}
                onClick={login}
                rightIcon={<Box as="span" w={4} h={4} bg="white" borderRadius="full" ml={1} />}
              >
                Login with Internet Identity
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Mobile navigation menu */}
        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              <NavLink to="/" onClick={onClose}>Home</NavLink>
              <NavLink to="/campaigns" onClick={onClose}>Explore</NavLink>
              <NavLink to="/how-it-works" onClick={onClose}>How It Works</NavLink>
              {isAuthenticated && (
                <NavLink to="/create-campaign" onClick={onClose}>
                  Create Campaign
                </NavLink>
              )}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default Header;

import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  Heading,
  HStack,
  Link,
  useColorModeValue,
  Text,
  Container,
  useDisclosure,
  IconButton,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../services/authContext';

const NavLink = ({ children, to, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      as={RouterLink}
      to={to}
      px={2}
      py={1}
      rounded={'md'}
      fontWeight={isActive ? 'bold' : 'medium'}
      color={isActive ? 'brand.600' : 'gray.600'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.100', 'gray.700'),
      }}
      {...rest}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  const { isAuthenticated, login, logout, principal } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box bg={useColorModeValue('white', 'gray.800')} px={4} boxShadow="sm">
      <Container maxW={'1200px'}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          
          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <Heading 
                as={RouterLink} 
                to="/" 
                size="md" 
                color="brand.500"
                _hover={{ textDecoration: 'none' }}
              >
                ICP Crowdfunding
              </Heading>
            </Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink to="/">Home</NavLink>
              {isAuthenticated && (
                <NavLink to="/create-campaign">Create Campaign</NavLink>
              )}
            </HStack>
          </HStack>
          
          <Flex alignItems={'center'}>
            {isAuthenticated ? (
              <HStack spacing={4}>
                <Text fontSize="sm" color="gray.600" display={{ base: 'none', md: 'block' }}>
                  {principal?.toString().substring(0, 6)}...
                </Text>
                <Button
                  variant={'outline'}
                  colorScheme={'red'}
                  size={'sm'}
                  onClick={logout}
                >
                  Logout
                </Button>
              </HStack>
            ) : (
              <Button
                variant={'solid'}
                colorScheme={'brand'}
                size={'sm'}
                onClick={login}
              >
                Login with Internet Identity
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Mobile menu */}
        {isOpen && (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              <NavLink to="/" onClick={onClose}>Home</NavLink>
              {isAuthenticated && (
                <NavLink to="/create-campaign" onClick={onClose}>Create Campaign</NavLink>
              )}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Header;

