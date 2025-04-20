import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Textarea,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightAddon,
  Text,
  useColorModeValue,
  Divider,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { createCampaign } from '../services/api';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Form state
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    goalAmount: '',
    durationDays: '30',
  });
  
  // Form errors state
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    goalAmount: '',
    durationDays: '',
  });
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!formValues.name.trim()) {
      newErrors.name = 'Campaign name is required';
      isValid = false;
    }
    
    if (!formValues.description.trim()) {
      newErrors.description = 'Campaign description is required';
      isValid = false;
    } else if (formValues.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
      isValid = false;
    }
    
    if (!formValues.goalAmount) {
      newErrors.goalAmount = 'Funding goal is required';
      isValid = false;
    } else if (parseFloat(formValues.goalAmount) <= 0) {
      newErrors.goalAmount = 'Funding goal must be greater than 0';
      isValid = false;
    }
    
    if (!formValues.durationDays) {
      newErrors.durationDays = 'Campaign duration is required';
      isValid = false;
    } else if (parseInt(formValues.durationDays) < 1 || parseInt(formValues.durationDays) > 90) {
      newErrors.durationDays = 'Duration must be between 1 and 90 days';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Calculate deadline in nanoseconds from now + durationDays
      const nowMs = Date.now();
      const durationMs = parseInt(formValues.durationDays) * 24 * 60 * 60 * 1000;
      const deadlineMs = nowMs + durationMs;
      const deadlineNs = BigInt(deadlineMs) * BigInt(1000000); // Convert to nanoseconds
      
      // Create campaign
      const campaignId = await createCampaign(
        formValues.name,
        formValues.description,
        parseFloat(formValues.goalAmount) * 100000000, // Convert to e8s (standard ICP denomination)
        deadlineNs
      );
      
      // Show success toast
      toast({
        title: 'Campaign created',
        description: 'Your crowdfunding campaign was created successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate to the new campaign
      navigate(`/campaign/${campaignId}`);
    } catch (err) {
      console.error('Failed to create campaign:', err);
      setError('Failed to create campaign. Please try again later.');
      
      toast({
        title: 'Error',
        description: 'There was an error creating your campaign.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxW="800px" py={8}>
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        boxShadow="md"
        borderColor={borderColor}
        borderWidth="1px"
      >
        <Heading size="lg" mb={6}>Create New Campaign</Heading>
        
        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.name}>
              <FormLabel>Campaign Name</FormLabel>
              <Input
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="Enter a catchy name for your campaign"
              />
              <FormErrorMessage>{formErrors.name}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!formErrors.description}>
              <FormLabel>Campaign Description</FormLabel>
              <Textarea
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                placeholder="Describe your campaign in detail. What are you raising funds for?"
                minH="150px"
              />
              <FormErrorMessage>{formErrors.description}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!formErrors.goalAmount}>
              <FormLabel>Funding Goal</FormLabel>
              <InputGroup>
                <NumberInput width="100%">
                  <NumberInputField
                    name="goalAmount"
                    value={formValues.goalAmount}
                    onChange={handleInputChange}
                    placeholder="How much do you need to raise?"
                  />
                </NumberInput>
                <InputRightAddon>ICP</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>{formErrors.goalAmount}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!formErrors.durationDays}>
              <FormLabel>Campaign Duration</FormLabel>
              <InputGroup>
                <NumberInput width="100%">
                  <NumberInputField
                    name="durationDays"
                    value={formValues.durationDays}
                    onChange={handleInputChange}
                    placeholder="How many days will your campaign run?"
                  />
                </NumberInput>
                <InputRightAddon>Days</InputRightAddon>
              </InputGroup>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Campaign will end {formValues.durationDays} days after creation
              </Text>
              <FormErrorMessage>{formErrors.durationDays}</FormErrorMessage>
            </FormControl>
            
            <Divider my={2} />
            
            <Box>
              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                width="full"
                isLoading={isSubmitting}
                loadingText="Creating Campaign"
              >
                Create Campaign
              </Button>
            </Box>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default CreateCampaign;

