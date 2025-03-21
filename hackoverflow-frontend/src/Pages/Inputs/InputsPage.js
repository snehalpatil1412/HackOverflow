import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Button,
  Heading,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  AlertDialog,
  AlertDialogContent,
  AlertDialogCloseButton,
  AlertDialogHeader,
  useDisclosure,
  AlertDialogBody,
  AlertDialogOverlay,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CalmifyLogo from "../../assets/logocalmify.png";
import ActiveAlert from "../../assets/activealert.png";
import Alert1 from "../../assets/alert.png";
import CalendarIcon from "../../assets/calendar.png";
import Mindful from "./Activities/Mindful.js";
import VideoPage from "./VideoPage"; // Import the VideoPage component
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useAuth } from "../Authentication/AuthContext.js";
import { getDatabase, ref, onValue } from "firebase/database";

function InputsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();
  const cancelRef = React.useRef();

  const [stressOverloaded, setStressOverloaded] = useState(false);
  const [stressCount, setStressCount] = useState(0);

  useEffect(() => {
    if (stressOverloaded) {
      setIsOpen(true);
    }
  }, [stressOverloaded]);

  const handleAlertClick = () => {
    handleAlertDR();
    setIsOpen(!isOpen);
  };

  // Check stress count whenever component mounts or when user changes
  useEffect(() => {
    const db = getDatabase();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Create reference to the stress count in Firebase
    const stressCountRef = ref(db, `users/${userId}/input/stress_count`);

    // Set up a listener to monitor changes to the stress count
    const unsubscribe = onValue(stressCountRef, (snapshot) => {
      const data = snapshot.val();
      const currentStressCount = data?.count || 0;
      setStressCount(currentStressCount);

      // Update stressOverloaded state based on count
      if (currentStressCount >= 4) {
        setStressOverloaded(true);
      } else {
        setStressOverloaded(false);
        // Also close the popover if it's open and stress count is reset
        setIsOpen(false);
      }
    });

    // Clean up listener on component unmount
    return () => unsubscribe();
  });

  // Check for a logged-in user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Firebase listener to handle authentication state changes
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const db = getDatabase();
        const firstNameRef = ref(db, `users/${currentUser.uid}/firstName`);
        const lastNameRef = ref(db, `users/${currentUser.uid}/lastName`);

        onValue(firstNameRef, (snapshot) => {
          const firstName = snapshot.val() || "";
          onValue(lastNameRef, (snapshot) => {
            const lastName = snapshot.val() || "";
            const updatedUser = {
              uid: currentUser.uid,
              email: currentUser.email,
              firstName,
              lastName,
            };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          });
        });
      } else {
        setUser(null);
        localStorage.removeItem("user");
        navigate("/");
      }
    });
  }, [navigate, setUser]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Error logging out: ", error.message);
    }
  };

  const handleAlertDR = () => {
    navigate("/alertDr");
  };

  // Handle navigation to calendar page
  const handleCalendarNav = () => {
    navigate("/calendar");
  };

  return (
    <div>
      {/* Navbar with Logo and Logout */}
      <StyledNav>
        <Logo>
          <LogoImg src={CalmifyLogo} alt="Calmify" />
        </Logo>

        <AlertContainer>
          <Popover
            mt={10}
            placement="left"
            isOpen={isOpen && stressOverloaded}
            onClose={() => setIsOpen(false)}
          >
            <PopoverTrigger>
              {stressOverloaded ? (
                <MotionAlert
                  onClick={handleAlertClick}
                  src={ActiveAlert}
                  alt="Active alert"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <StaticAlert
                  src={Alert1}
                  alt="Alert"
                />
              )}
            </PopoverTrigger>
            <StyledPopoverContent mt={5}>
              <CloseButton onClick={() => setIsOpen(false)}>
                &times;
              </CloseButton>
              <PopoverHeader>Stress Alert</PopoverHeader>
              <PopoverBody>
                Stressed {stressCount} times! Time to check in with a doctor!
              </PopoverBody>
              <ContactButton onClick={handleAlertDR}>
                Contact Doctor
              </ContactButton>
            </StyledPopoverContent>
          </Popover>
        </AlertContainer>

        {/* Calendar Icon */}
        <CalendarIconContainer onClick={handleCalendarNav}>
          <CalendarImg src={CalendarIcon} alt="Calendar" />
        </CalendarIconContainer>

        <Button
          onClick={() => {
            onOpen1();
          }}
        >
          Logout
        </Button>

        <AlertDialog
          motionPreset="slideInBottom"
          leastDestructiveRef={cancelRef}
          onClose={onClose1}
          isOpen={isOpen1}
          isCentered
        >
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>Confirm Logout</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>Are you sure you want to Logout?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose1}>
                No
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleLogout}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </StyledNav>

      {/* Greeting Message */}
      <GreetingContainer>
      <Heading
        as="h2"
        size={{ base: "lg", md: "xl", lg: "xl" }}
        mt={{ base: 4, md: 2, lg: 0 }}
        ml={{ base: "20px", md: "40px", lg: "70px" }}
      >
  Hello, {user?.firstName} {user?.lastName}
</Heading>

        <Text
          fontSize="2xl"
          color="grey"
          pt="5"
          ml={{ base: "20px", md: "70px" }}
        >
          How are you feeling today? Let's Track your emotions!!
        </Text>
      </GreetingContainer>
      
      {/* Directly include VideoPage component instead of StyledStack */}
      <div style={{ width: "100%" }}>
        <VideoPage />
      </div>
      
      {/* Mindfulness Section */}
      {/* <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Mindful />
      </div> */}
    </div>
  );
}

export default InputsPage;

// Styled Components

// Custom Styled Popover Content
const StyledPopoverContent = styled(PopoverContent)`
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(32, 32, 34, 0.1);
  border: 1px solid #e9ecef;
  padding: 16px;
  width: 500px;
`;

const PopoverHeader = styled.div`
  font-size: 23px;
  font-weight: 700;
  color: rgb(47, 47, 211);
  margin-bottom: 12px;
  text-align: center;
`;

const PopoverBody = styled.div`
  font-size: 16px;
  color: rgb(83, 84, 84);
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: #868e96;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #212529;
  }
`;

const ContactButton = styled(Button)`
  width: 100%;
  background-color: rgb(194, 227, 255);
  color: white;
  border-radius: 8px;
  padding: 10px;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgb(0, 90, 174);
  }

  &:active {
    background-color: rgb(214, 233, 255);
  }
`;

const StyledNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  font-family: Arial, sans-serif;
  font-size: 24px;
  font-weight: bold;

  @media (max-width: 768px) {
    justify-content: space-between;
    flex-direction: row;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const LogoImg = styled.img`
  height: 40px;
  cursor: pointer;
`;

// New styled component for Calendar Icon
const CalendarIconContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    margin-right: 10px;
  }
`;

const CalendarImg = styled.img`
  height: 30px;
  width: 30px;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const AlertContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 40px;
  @media (max-width: 768px) {
    margin-left: 10px;
    order: 1;
  }
`;

const StaticAlert = styled.img`
  height: 30px;
  width: 30px;
  cursor: pointer;
`;

const MotionAlert = motion(StaticAlert); // Convert Alert to a motion component

const GreetingContainer = styled.div`
  padding: 30px 20px;
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
  }
`;