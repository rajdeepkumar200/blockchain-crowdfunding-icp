import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Progress,
  Badge,
  Button,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { getCampaign, contributeToCampaign, getUserContributions } from '../services/api';
import { useAuth } from '../services/authContext';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  
  const [campaign, setCampaign] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [userContribution, setUserContribution] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState(null);
  const [contributionError, setContributionError] = useState('');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const data = await getCampaign(parseInt(id));
        setCampaign(data);
        
        // If authenticated, get user's contribution
        if (isAuthenticated) {
          try {
            const userContribAmount = await getUserContributions(parseInt(id));
            setUserContribution(userContribAmount);
          } catch (err) {
            console.error('Failed to fetch user contribution:', err);
          }
        }
      } catch (err) {
        console.error('Failed to fetch campaign:', err);
        setError('Campaign not found or there was an error loading the campaign details.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCampaign();
  }, [id, isAuthenticated]);
  
  // Convert nanoseconds to readable date
  const formatDate = (nanoseconds) => {
    if (!nanoseconds) return '';
    const milliseconds = Number(nanoseconds) / 1000000;
    return new Date(milliseconds).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    if (!deadline) return 0;
    const now = Date.now();
    const deadlineMs = Number(deadline) / 1000000;
    const diff = deadlineMs - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  
  // Handle contribution submission
  const handleContribute = async (e) => {
    e.preventDefault();
    
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      setContributionError('Please enter a valid contribution amount');
      return;
    }
    
    setIsContributing(true);
    setContributionError('');
    
    try {
      // Convert to IC tokens (e8s)
      const amountInTokens = parseFloat(contributionAmount) * 100000000;
      
      await contributeToCampaign(parseInt(id), amountInTokens);
      
      // Update campaign data
      const updatedCampaign = await getCampaign(parseInt(id));
      setCampaign(updatedCampaign);
      
      // Get updated user contribution
      const updatedUserContribution = await getUserContributions(parseInt(id));
      setUserContribution(updatedUserContribution);
      
      // Clear form and show success message
      setContributionAmount('');
      toast({
        title: 'Contribution successful',
        description: `You have successfully contributed ${contributionAmount} ICP to this campaign.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to contribute:', err);
      setContributionError(err.message || 'Failed to process your contribution. Please try again.');
      
      toast({
        title: 'Contribution failed',
        description: err.message || 'There was an error processing your contribution.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsContributing(false);
    }
  };
  
  // Calculate campaign progress
  const calculateProgress = () => {
    if (!campaign) return 0;
    return (campaign.currentAmount / campaign.goalAmount) * 100;
  };
  
  // Check if campaign is active
  const isActive = () => {
    if (!campaign) return false;
    return campaign.isActive && getDaysRemaining(campaign.deadline) > 0;
  };
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <Container maxW="1200px" py={8}>
        <Box>
          <Skeleton height="40px" width="60%" mb={4} />
          <Skeleton height="20px" width="40%" mb={6} />
          <Skeleton height="300px" mb={6} />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
          </SimpleGrid>
          <Skeleton height="200px" />
        </Box>
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
        <Button onClick={() => navigate('/')} mt={4} colorSch

