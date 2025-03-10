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
import TextImage from "../../assets/textoption.jpeg";
import AudioImage from "../../assets/audiooption.jpeg";
import VideoImage from "../../assets/videooption.jpeg";
import QuizeImage from "../../assets/quizeoption.jpeg";
import CalmifyLogo from "../../assets/logocalmify.png";
import ActiveAlert from "../../assets/activealert.png";
import Alert1 from "../../assets/alert.png";
import Mindful from "./Activities/Mindful.js";
// import ConsultDr from "./Activities/ConsultDr.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useAuth } from "../Authentication/AuthContext.js";
import { getDatabase, ref, onValue } from "firebase/database";

function InputsPage() {
  const [isOpen, setIsOpen] = useState(false);
  // const popoverRef = useRef(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();
  const cancelRef = React.useRef();
  const [ratings, setRatings] = useState({
    video: 0,
    audio: 0,
    text: 0,
    quiz: 0,
  });

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

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handle star ratings
  const handleRating = (category, rating) => {
    setRatings((prevRatings) => ({ ...prevRatings, [category]: rating }));
  };

  // Render star rating
  const renderStars = (category) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        filled={index < ratings[category]}
        onClick={() => handleRating(category, index + 1)}
      >
        ★
      </Star>
    ));
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
          
          // backgro: rgb(255, 201, 214);
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
                  // onClick={handleAlertClick}
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
          size="2xl"
          mt={{ base: 4, md: 0 }}
          ml={{ base: "20px", md: "70px" }}
        >
          Hello, {user?.firstName} {user?.lastName}
        </Heading>
        <Text
          fontSize="2xl"
          color="grey"
          pt="5"
          ml={{ base: "20px", md: "70px" }}
        >
          Select any option to convey your thoughts or feelings to us!!
        </Text>
      </GreetingContainer>
      {/* Options for Input */}
      <StyledStack>
        <StyledCard onClick={() => handleNavigation("/video")}>
          <StyledImage src={VideoImage} alt="Video" />
          <CardContent>
            <StyledHeading>Video</StyledHeading>
            <StyledText>
              Convey your feelings or thoughts by uploading or recording a
              video.
            </StyledText>
            <StarRating>{renderStars("video")}</StarRating>
          </CardContent>
        </StyledCard>

        <StyledCard onClick={() => handleNavigation("/audio")}>
          <StyledImage src={AudioImage} alt="Audio" />
          <CardContent>
            <StyledHeading>Audio</StyledHeading>
            <StyledText>
              Convey your feelings or thoughts by uploading or recording audio.
            </StyledText>
            <StarRating>{renderStars("audio")}</StarRating>
          </CardContent>
        </StyledCard>

        <StyledCard onClick={() => handleNavigation("/text")}>
          <StyledImage src={TextImage} alt="Text" />
          <CardContent>
            <StyledHeading>Text</StyledHeading>
            <StyledText>
              Convey your feelings or thoughts by writing text.
            </StyledText>
            <StarRating>{renderStars("text")}</StarRating>
          </CardContent>
        </StyledCard>

        <StyledCard onClick={() => handleNavigation("/quiz")}>
          <StyledImage src={QuizeImage} alt="Quiz" />
          <CardContent>
            <StyledHeading>Quiz</StyledHeading>
            <StyledText>
              Convey your feelings or thoughts by taking a quiz.
            </StyledText>
            <StarRating>{renderStars("quiz")}</StarRating>
          </CardContent>
        </StyledCard>
      </StyledStack>
      {/* Mindfulness Section */}
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Mindful />
      </div>
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
  // margintop: "40px" @media (max-width: 768px) {
  //   max-width: 280px;
  //   margin: 0 10px;
  // }
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

const StyledCard = styled.div`
  width: 100%;
  max-width: 360px;
  height: 510px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-10px);
  }

  @media (max-width: 1024px) {
    max-width: 48%;
    height: auto;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    height: auto;
    margin-bottom: 20px;
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  @media (max-width: 768px) {
    height: 200px;
  }
`;

const CardContent = styled.div`
  padding: 20px;
  text-align: center;
`;

const StyledHeading = styled.h3`
  font-size: 1.5em;
  margin-bottom: 10px;
`;

const StyledText = styled.p`
  font-size: 1em;
  color: #555;
`;

const StyledStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 50px;
  padding: 0 20px;

  @media (max-width: 1024px) {
    flex-direction: row;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
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

const AlertContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 40px;
  @media (max-width: 768px) {
    margin-left: 10px;
    // margin-right: 10px;

    // padding: 10px;
    order: 1;
  }
`;

const StarRating = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const Star = styled.span`
  font-size: 24px;
  color: ${({ filled }) => (filled ? "#FFD700" : "#dcdcdc")};
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #ffcc00;
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
