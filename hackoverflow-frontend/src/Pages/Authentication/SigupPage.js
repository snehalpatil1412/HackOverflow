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
  // Checkbox,
} from "@chakra-ui/react";
import backgroundImage from "../../assets/loginsignup.png";
import CalmifyLogo from "../../assets/logocalmify.png";
import styled from "styled-components";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

import { getDatabase, ref, set } from "firebase/database";
// import { auth } from "../../firebaseConfig";
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

  return (
    <Section>
      {/* <LeftSection>
        <Img src={img} alt="login img" />
      </LeftSection>
      <RightSection> */}
      <Container maxW="md" centerContent>
        <Box
          size="xl"
          align="center"
          padding={10}
          display="flex"
          // boxShadow="2xl"
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
              {/* <Checkbox  mb={7} isRequired>
                  Agrees all terms and conditions
                </Checkbox> */}
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
            </FormControl>
            <Text pl="30px" mt={4}>
              Don't have an account?{" "}
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
