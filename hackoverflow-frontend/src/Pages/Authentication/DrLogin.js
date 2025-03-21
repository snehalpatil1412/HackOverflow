// DrLoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  Heading, 
  Text, 
  useToast, 
  Container,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../../firebaseConfig'; // Assuming this is your firebase config file
// import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const DrLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get a reference to the 'doctor' node in your Firebase database
      const doctorRef = ref(db, 'doctor');
      
      // Get all doctors
      const snapshot = await get(doctorRef);
      
      if (snapshot.exists()) {
        const doctors = snapshot.val();
        let userFound = false;
        let userData = null;
        
        // Check if the provided email and password match any doctor
        Object.keys(doctors).forEach(doctorKey => {
          const doctor = doctors[doctorKey];
          if (doctor.email === email && doctor.password.toString() === password) {
            userFound = true;
            userData = {
              ...doctor,
              id: doctorKey,
              name: doctor.name
            };
          }
        });
        
        if (userFound && userData) {
          // Store user data in session storage
          sessionStorage.setItem('currentUser', JSON.stringify(userData));
          
          toast({
            title: 'Login successful',
            description: `Welcome back, ${userData.name}!`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          // Redirect to dashboard
          navigate('/drdashboard');
        } else {
          toast({
            title: 'Login failed',
            description: 'Invalid email or password',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'No doctor records found in the database',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Login failed: ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading>Doctor Login</Heading>
          <Text mt={2} color="gray.500">Enter your credentials to access your account</Text>
        </Box>
        
        <Box as="form" onSubmit={handleLogin} bg="white" p={8} borderRadius="md" boxShadow="md">
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
            
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    // icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={4}
              isLoading={isLoading}
              loadingText="Logging in"
            >
              Login
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default DrLogin;