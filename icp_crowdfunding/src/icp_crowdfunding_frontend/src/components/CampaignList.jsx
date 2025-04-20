import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Badge,
  Progress,
  Button,
  Flex,
  Link,
  Skeleton,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Container,
  VStack,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { getAllCampaigns } from '../services/api';

// Campaign card component
const CampaignCard = ({ campaign }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Convert nanoseconds to readable date
  const formatDate = (nanoseconds) => {
    const milliseconds = Number(nanoseconds) / 1000000;
    return new Date(milliseconds).toLocaleDateString();
  };
  
  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const now = Date.now();
    const deadlineMs = Number(deadline) / 1000000;
    const diff = deadlineMs - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  
  // Calculate progress percentage
  const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
  
  // Determine status badges
  const daysRemaining = getDaysRemaining(campaign.deadline);
  const isExpired = daysRemaining <= 0;
  const isActive = campaign.isActive && !isExpired;
  const isSuccessful = campaign.currentAmount >= campaign.goalAmount;
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={5}
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <VStack align="start" spacing={3}>
        <Flex w="100%" justify="space-between" align="center">
          <Heading size="md" noOfLines={1}>{campaign.name}</Heading>
          <Badge 
            colorScheme={isActive ? 'green' : isSuccessful ? 'blue' : 'red'}
            variant="solid"
            px={2}
            py={1}
            borderRadius="full"
          >
            {isActive ? 'Active' : isSuccessful ? 'Funded' : 'Ended'}
          </Badge>
        </Flex>
        
        <Text noOfLines={2} color="gray.600" fontSize="sm">
          {campaign.description}
        </Text>
        
        <Box w="100%">
          <Flex justify="space-between" mb={1}>
            <Text fontSize="sm" fontWeight="bold">
              {campaign.currentAmount} / {campaign.goalAmount} ICP
            </Text>
            <Text fontSize="sm" color="gray.600">
              {progress.toFixed(1)}%
            </Text>
          </Flex>
          <Progress 
            value={progress} 
            colorScheme={isSuccessful ? 'blue' : 'brand'} 
            size="sm" 
            borderRadius="full"
          />
        </Box>
        
        <Flex justify="space-between" w="100%" fontSize="sm">
          <Text color="gray.600">
            {isExpired ? 'Ended' : `${daysRemaining} days left`}
          </Text>
          <Text color="gray.600">
            {Object.keys(campaign.contributors).length} backers
          </Text>
        </Flex>
        
        <Button
          as={RouterLink}
          to={`/campaign/${campaign.id}`}
          colorScheme="brand"
          size="sm"
          width="full"
          mt={2}
        >
          View Details
        </Button>
      </VStack>
    </Box>
  );
};

// Loading skeleton for campaign cards
const CampaignCardSkeleton = () => (
  <Box 
    borderWidth="1px" 
    borderRadius="lg" 
    overflow="hidden" 
    p={5}
    boxShadow="sm"
  >
    <Stack spacing={4}>
      <Flex justify="space-between">
        <Skeleton height="24px" width="70%" />
        <Skeleton height="24px" width="20%" />
      </Flex>
      <Skeleton height="36px" />
      <Skeleton height="8px" />
      <Flex justify="space-between">
        <Skeleton height="16px" width="40%" />
        <Skeleton height="16px" width="30%" />
      </Flex>
      <Skeleton height="36px" />
    </Stack>
  </Box>
);

// Main CampaignList component
const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and sort options
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Fetch all campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCampaigns();
        setCampaigns(data);
        setFilteredCampaigns(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);
  
  // Apply filters and sorting whenever any filter/sort option changes
  useEffect(() => {
    let result = [...campaigns];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        campaign => 
          campaign.name.toLowerCase().includes(query) || 
          campaign.description.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const now = Date.now();
      
      switch (statusFilter) {
        case 'active':
          result = result.filter(campaign => {
            const deadlineMs = Number(campaign.deadline) / 1000000;
            return campaign.isActive && now < deadlineMs;
          });
          break;
        case 'funded':
          result = result.filter(campaign => 
            campaign.currentAmount >= campaign.goalAmount
          );
          break;
        case 'ended':
          result = result.filter(campaign => {
            const deadlineMs = Number(campaign.deadline) / 1000000;
            return !campaign.isActive || now >= deadlineMs;
          });
          break;
        default:
          break;
      }
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'endingSoon':
        result.sort((a, b) => {
          const aDeadline = Number(a.deadline);
          const bDeadline = Number(b.deadline);
          return aDeadline - bDeadline;
        });
        break;
      case 'mostFunded':
        result.sort((a, b) => b.currentAmount - a.currentAmount);
        break;
      case 'goalAmount':
        result.sort((a, b) => b.goalAmount - a.goalAmount);
        break;
      default:
        break;
    }
    
    setFilteredCampaigns(result);
  }, [campaigns, searchQuery, statusFilter, sortBy]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  // Render loading skeletons
  if (isLoading) {
    return (
      <Container maxW="1

import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Badge,
  Progress,
  Button,
  Flex,
  Link,
  Skeleton,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Container,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { getAllCampaigns } from '../services/api';

// Campaign card component
const CampaignCard = ({ campaign }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Convert nanoseconds to readable date
  const formatDate = (nanoseconds) => {
    const milliseconds = Number(nanoseconds) / 1000000;
    return new Date(milliseconds).toLocaleDateString();
  };
  
  // Calculate progress percentage
  const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
  
  // Determine status badges
  const isExpired = new Date() > new Date(campaign.deadline / 1000000);
  const isActive = campaign.isActive && !isExpired;
  const isSuccessful = campaign.currentAmount >= campaign.goalAmount;
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={5}
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <VStack align="start" spacing={3}>
        <Flex w="100%" justify="space-between" align="center">
          <Heading size="md" noOfLines={1}>{campaign.name}</Heading>
          <Badge 
            colorScheme={isActive ? 'green' : isSuccessful ? 'blue' : 'red'}
            variant="solid"
            px={2}
            py={1}
            borderRadius="full"
          >
            {isActive ? 'Active' : isSuccessful ? 'Funded' : 'Ended'}
          </Badge>
        </Flex>
        
        <Text noOfLines={2} color="gray.600" fontSize="sm">
          {campaign.description}
        </Text>
        
        <Box w="100%">
          <Flex justify="space-between" mb={1}>
            <Text fontSize="sm" fontWeight="bold">
              {campaign.currentAmount} / {campaign.goalAmount} ICP
            </Text>
            <Text fontSize="sm" color="gray.600">
              {progress.toFixed(1)}%
            </Text>
          </Flex>
          <Progress 
            value={progress} 
            colorScheme={isSuccessful ? 'blue' : 'brand'} 
            size="sm" 
            borderRadius="full"
          />
        </Box>
        
        <Flex justify="space-between" w="100%" fontSize="sm">
          <Text color="gray.600">Ends: {formatDate(campaign.deadline)}</Text>
          <Text color="gray.600">
            {Object.keys(campaign.contributors).length} backers
          </Text>
        </Flex>
        
        <Button
          as={RouterLink}
          to={`/campaign/${campaign.id}`}
          colorScheme="brand"
          size="sm"
          width="full"
          mt={2}
        >
          View Details
        </Button>
      </VStack>
    </Box>
  );
};

// Main CampaignList component
const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCampaigns();
        setCampaigns(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);
  
  // Render loading skeletons
  if (isLoading) {
    return (
      <Container maxW="1200px" py={8}>
        <Heading mb={6}>Crowdfunding Campaigns</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[...Array(6)].map((_, index) => (
            <Box key={index} borderWidth="1px" borderRadius="lg" overflow="hidden" p={5}>
              <Stack spacing={4}>
                <Skeleton height="24px" width="80%" />
                <Skeleton height="16px" width="60%" />
                <Skeleton height="16px" width="100%" />
                <Skeleton height="8px" width="100%" />
                <Skeleton height="16px" width="40%" />
                <Skeleton height="32px" width="100%" />
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxW="1200px" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }
  
  // Render empty state
  if (campaigns.length === 0) {
    return (
      <Container maxW="1200px" py={8}>
        <Heading mb={6}>Crowdfunding Campaigns</Heading>
        <Box textAlign="center" py={10} px={6}>
          <Text fontSize="xl" mt={3} mb={6}>
            No campaigns found.
          </Text>
          <Button
            as={RouterLink}
            to="/create-campaign"
            colorScheme="brand"
            variant="solid"
          >
            Create Your First Campaign
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Render campaigns
  return (
    <Container maxW="1200px" py={8}>
      <Heading mb={6}>Crowdfunding Campaigns</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default CampaignList;

