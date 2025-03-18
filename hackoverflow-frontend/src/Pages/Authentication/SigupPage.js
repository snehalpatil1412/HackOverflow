import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  Input,
  Stack,
  Image,
  Text,
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
  Divider,
} from "@chakra-ui/react";
import backgroundImage from "../../assets/loginsignup.png";
import CalmifyLogo from "../../assets/logocalmify.png";
import styled from "styled-components";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useAuth } from "./AuthContext"; // Make sure the path is correct
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import showeye from "../../assets/12.png";
import hideeye from "../../assets/13.png";

function SignupPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lname, setLname] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const handleClick = () => setShow(!show);
  const [show, setShow] = useState(false);
  const { signInWithGoogle } = useAuth(); // Use the context

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user details to Firebase
      const database = getDatabase();
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        firstName: name,
        lastName: lname,
        email: user.email,
        sessions: {},
      });

      // Update user context
      setUser({
        ...user,
        firstName: name,
        lastName: lname,
      });

      // Save to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          firstName: name,
          lastName: lname,
          email: user.email,
        })
      );

      navigate("/input"); // Redirect after signup
    } catch (error) {
      toast({
        title: "Signup failed.",
        description: "Please check all the information.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      navigate("/input"); // Redirect to the input page after Google signup
    } catch (error) {
      toast({
        title: "Google Sign-Up failed.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Section>
      <Container maxW="md" centerContent>
        <Box
          size="xl"
          align="center"
          padding={10}
          display="flex"
          borderRadius={40}
          position="fixed"
          top="40px"
          right="60px"
          left="150px"
          height={600}
          width={500}
          bgColor="white"
        >
          <Stack>
            <Heading
              size="2xl"
              pl="50px"
              mb={5}
              mt={10}
              color="#1e147e"
              align="center"
            >
              Sign Up
            </Heading>
            <Text pl="30px" fontSize="xl" mb={5}>
              Signup for creating new account
            </Text>
            <FormControl pl="30px" id="name">
              <Input
                mb={5}
                h="50px"
                w="350px"
                type="text"
                placeholder="Enter your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
              />
            </FormControl>
            <FormControl pl="30px" id="lname">
              <Input
                mb={5}
                h="50px"
                w="350px"
                type="text"
                placeholder="Enter your Last Name"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                isRequired
              />
            </FormControl>
            <FormControl pl="30px" id="email">
              <Input
                mb={5}
                h="50px"
                w="350px"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
              />
            </FormControl>
            <FormControl pl="30px" id="password">
              <InputGroup size="md">
                <Input
                  mb={7}
                  h="50px"
                  w="350px"
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isRequired
                />
                <InputRightElement pt="10px" width="4.5rem">
                  <Image
                    src={show ? showeye : hideeye}
                    h="23px"
                    cursor="pointer"
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              <Button
                mb={5}
                h="50px"
                w="350px"
                bg="blue.600"
                color="white"
                _hover={{ bg: "blue.700" }}
                onClick={handleSignup}
              >
                Signup
              </Button>
              
              <Divider mb={5} />
              
              <Button
                mb={5}
                h="50px"
                w="350px"
                bg="white"
                border="1px solid #ccc"
                _hover={{ bg: "gray.100" }}
                onClick={handleGoogleSignUp}
                leftIcon={
                  <GoogleIcon />
                }
              >
                Sign up with Google
              </Button>
            </FormControl>
            <Text pl="30px" mt={4}>
              Already have an account?{" "}
              <Button variant="link" onClick={() => navigate("/login")}>
                Login
              </Button>
            </Text>
            <Logo>
              <LogoImg src={CalmifyLogo} alt="Calmify" />
            </Logo>
          </Stack>
        </Box>
      </Container>
    </Section>
  );
}

export default SignupPage;

const Section = styled.div`
  display: flex;
  height: 100vh;
  padding: 20px;
  margin-left: 650px;
  box-sizing: border-box;
  background-image: url(${backgroundImage});
  background-repeat: no-repeat;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-left: 150px;
  margin-top: 20px;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const LogoImg = styled.img`
  height: 40px;
  cursor: pointer;
`;

// Google icon component
const GoogleIcon = () => (
  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);