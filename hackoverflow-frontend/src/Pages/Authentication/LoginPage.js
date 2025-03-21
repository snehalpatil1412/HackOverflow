//Loginpage
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Text,
  useToast,
  VStack,
  HStack,
  Spacer,
  Link,
} from "@chakra-ui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import styled from "styled-components";

// You'll need to replace these with your actual image paths
import logoImage from "../../assets/logocalmify.png";
import meditationImage from "../../assets/login.gif";

function StressReductionLogin({ setUser }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();

      // Show a calming welcome message
      toast({
        title: "Welcome to your calm space",
        description: "Taking a moment for yourself is a gift.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      navigate("/input");
    } catch (error) {
      toast({
        title: "Connection interrupted",
        description: "Let's try again when you're ready.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <WhiteBackground>
      <Container maxW="100%" p={0} h="100vh">
        <Flex h="100%" direction={{ base: "column", md: "row" }}>
          {/* Left side - Meditation Image */}
          <Flex
            flex={{ base: "1", md: "1.2" }}
            bg="white"
            position="relative"
            display={{ base: "none", md: "flex" }}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={8}
          >
            <Box
              maxW="80%"
              maxH="60%"
              overflow="hidden"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Image
                src={meditationImage}
                alt="Meditation"
                objectFit="cover"
                height="auto"
                width="100%"
              />
            </Box>

            <VStack
              align="flex-start"
              bg="white"
              p={6}
              borderRadius="lg"
              spacing={4}
              maxW="80%"
              mt={6}
              boxShadow="md"
            >
              <Heading size="lg" color="teal.700">
                For Healthcare Professionals
              </Heading>
              <Text fontSize="md" color="gray.700">
                Join our network of certified professionals providing mental wellness support
              </Text>
              <Button
                colorScheme="teal"
                variant="outline"
                size="md"
                onClick={() => navigate("/drlogin")}
              >
                Register as a Professional
              </Button>
            </VStack>
          </Flex>

          {/* Right side - Login Form */}
          <Flex
            flex="1"
            direction="column"
            p={{ base: 6, md: 10 }}
            justify="center"
            align="center"
            bg="white"
          >
            <VStack spacing={8} w="full" maxW="400px">
              <Image src={logoImage} alt="Calmify" height="60px" />

              <VStack spacing={4} align="stretch" w="full">
                <Heading
                  textAlign="center"
                  color="teal.600"
                  size="xl"
                  fontWeight="normal"
                >
                  Breathe. Center. Thrive.
                </Heading>

                <Text textAlign="center" color="gray.600" fontSize="lg" mb={4}>
                  Your sanctuary for mindfulness awaits
                </Text>

                <Button
                  size="lg"
                  height="60px"
                  bg="white"
                  color="gray.700"
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow="sm"
                  _hover={{ bg: "gray.50", boxShadow: "md" }}
                  leftIcon={<GoogleIcon />}
                  onClick={handleGoogleSignIn}
                  borderRadius="full"
                >
                  Continue with Google
                </Button>

                <HStack justify="center" pt={6}>
                  <Text color="gray.500">New to mindful moments?</Text>
                  <Button
                    variant="link"
                    color="teal.500"
                    onClick={() => navigate("/signup")}
                  >
                    Create Space
                  </Button>
                </HStack>
              </VStack>

              <Spacer />

              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  "Mindfulness is the key to unlocking your inner peace"
                </Text>
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  Your journey to wellness begins with a single breath
                </Text>
              </VStack>
            </VStack>
          </Flex>
        </Flex>
      </Container>
    </WhiteBackground>
  );
}

// Styled components
const WhiteBackground = styled.div`
  background: white;
  min-height: 100vh;
`;

// Google icon component - same as your original
const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

export default StressReductionLogin;