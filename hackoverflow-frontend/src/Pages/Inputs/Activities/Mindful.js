import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Heading,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Card,
  Stack,
  Flex,
} from "@chakra-ui/react";
import styled from "styled-components";
import yoga from "../../../assets/Mindful/image_processing20200602-24882-19tmhn3.gif";

const mindfulActivities = {
  Meditation: [
    {
      name: "Meditation",
      step: "Step 1: Find a quiet place to sit comfortably.",
      duration: 5,
    },
    {
      name: "Meditation",
      step: "Step 2: Close your eyes and focus on your breath.",
      duration: 10,
    },
    {
      name: "Meditation",
      step: "Step 3: Inhale deeply, hold for a moment, and exhale slowly.",
      duration: 10,
    },
    {
      name: "Meditation",
      step: "Step 4: Imagine a peaceful and calm environment, like a beach or forest.",
      duration: 10,
    },
    {
      name: "Meditation",
      step: "Step 5: Let go of any distractions and focus solely on your breathing and surroundings.",
      duration: 5,
    },
  ],
  Breathing: [
    {
      name: "Breathing",
      step: "Step 1: Sit comfortably and close your eyes.",
      duration: 5,
    },
    {
      name: "Breathing",
      step: "Step 2: Inhale deeply through your nose for a count of four.",
      duration: 5,
    },
    {
      name: "Breathing",
      step: "Step 3: Hold your breath for a count of four.",
      duration: 5,
    },
    {
      name: "Breathing",
      step: "Step 4: Exhale slowly through your mouth for a count of four.",
      duration: 5,
    },
    {
      name: "Breathing",
      step: "Step 5: Repeat the cycle for a few minutes, focusing on your breath.",
      duration: 10,
    },
  ],
  TaiChi: [
    {
      name: "TaiChi",
      step: "Step 1: Stand with your feet shoulder-width apart, relaxed.",
      duration: 5,
    },
    {
      name: "TaiChi",
      step: "Step 2: Slowly raise your arms, palms facing downward, as you inhale.",
      duration: 10,
    },
    {
      name: "TaiChi",
      step: "Step 3: Slowly lower your arms, exhaling, and relax your shoulders.",
      duration: 10,
    },
    {
      name: "TaiChi",
      step: "Step 4: Shift your weight to one leg, and gently lift the other leg to a 45-degree angle.",
      duration: 10,
    },
    {
      name: "TaiChi",
      step: "Step 5: Repeat on the other side, maintaining a fluid motion and calm breathing.",
      duration: 10,
    },
  ],
  Visualization: [
    {
      name: "Visualization",
      step: "Step 1: Sit or lie down comfortably in a quiet space.",
      duration: 5,
    },
    {
      name: "Visualization",
      step: "Step 2: Close your eyes and take a few deep breaths.",
      duration: 5,
    },
    {
      name: "Visualization",
      step: "Step 3: Imagine yourself in a peaceful, beautiful place.",
      duration: 10,
    },
    {
      name: "Visualization",
      step: "Step 4: Visualize the sights, sounds, and smells of this place, fully immersing yourself.",
      duration: 10,
    },
    {
      name: "Visualization",
      step: "Step 5: Allow yourself to relax and enjoy this calming experience for a few moments.",
      duration: 10,
    },
  ],
};

const Mindful = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const toast = useToast();

  const handleActivitySelection = (activity) => {
    setSelectedActivity(activity);
    setCurrentStepIndex(0);
    setTimer(mindfulActivities[activity][0].duration);
    setIsModalOpen(true);
    speak(mindfulActivities[activity][0].step);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
    setCurrentStepIndex(0);
    setTimer(0);
    setIsTimerRunning(false);
    speechSynthesis.cancel();
  };

  const handleNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < mindfulActivities[selectedActivity].length) {
      setCurrentStepIndex(nextIndex);
      const nextStep = mindfulActivities[selectedActivity][nextIndex];
      setTimer(nextStep.duration);
      speak(nextStep.step);
    } else {
      toast({
        title: "Activity Complete!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      handleCloseModal();
    }
  };

  const speak = (text) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (isTimerRunning && !isPaused) {
      setIsPaused(true);
      speechSynthesis.pause();
    } else if (isTimerRunning && isPaused) {
      setIsPaused(false);
      speechSynthesis.resume();
    }
  };

  useEffect(() => {
    if (isTimerRunning && !isPaused && timer > 0) {
      const countdown = setTimeout(() => {
        speak(timer.toString());
        setTimer((prev) => prev - 1);
      }, 2000);
      return () => clearTimeout(countdown);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
  }, [timer, isTimerRunning, isPaused]);

  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
  };

  return (
    <>
      <Heading 
        as="h2" 
        size="2xl" 
        color="#404060" 
        textAlign="center" 
        marginTop="100px">
        Mindful Activity
      </Heading>
      
      <Section>
        <LeftSection>
          <Box>
            <Text 
              fontSize="2xl" 
              mb={7} 
              color="grey" 
              textAlign="center">
              Choose an activity
            </Text>
            <Stack spacing={4} align="center" width="280px">
              {Object.keys(mindfulActivities).map((activity) => (
                <Card
                  key={activity}
                  onClick={() => handleActivitySelection(activity)}
                  transition="all 0.5s ease-in-out"
                  _hover={{ transform: "scale(1.1)", boxShadow: "xl" }}
                  boxShadow="lg"
                  borderRadius="10px"
                  p={4}
                  width={{ base: "100%", md: "500px" }}
                >
                  <Text fontSize="2xl" textAlign="center">
                    {activity}
                  </Text>
                </Card>
              ))}
            </Stack>
          </Box>
        </LeftSection>

        <RightSection>
          <Img src={yoga} alt="yoga img" />
        </RightSection>
      </Section>

      {/* Modal for Mindful Activities */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader 
            textAlign="center" 
            fontSize="2xl" 
            fontWeight="bold"
            color="#404060"
          >
            {selectedActivity}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack 
              spacing={6} 
              align="center" 
              justify="center" 
              width="full"
            >
              {selectedActivity && (
                <>
                  {/* <Box 
                    textAlign="center" 
                    p={4} 
                    borderWidth={1} 
                    borderRadius="lg" 
                    width="full"
                  > */}
                    <Text 
                      fontSize="lg" 
                      mb={2} 
                      fontWeight="semibold"
                    >
                      {mindfulActivities[selectedActivity][currentStepIndex].step}
                    </Text>
                  {/* </Box> */}
                  <Flex 
                    width="full" 
                    justifyContent="center" 
                    alignItems="center"
                  >
                    <Text 
                      fontSize="md" 
                      fontWeight="medium" 
                      color="gray.600"
                    >
                      Timer: {timer} seconds
                    </Text>
                  </Flex>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter 
            display="flex" 
            justifyContent="space-between" 
            width="full"
          >
            {!isTimerRunning && (
              <Button
                onClick={startTimer}
                colorScheme="green"
                isDisabled={isTimerRunning}
                flex={1}
                mr={2}
              >
                Start
              </Button>
            )}
            {isTimerRunning && (
              <Button 
                onClick={handlePauseResume} 
                colorScheme="yellow"
                flex={1}
                mr={2}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}
            <Button
              onClick={handleNextStep}
              isDisabled={
                selectedActivity && 
                currentStepIndex === 
                mindfulActivities[selectedActivity].length - 1
              }
              colorScheme="blue"
              flex={1}
            >
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Mindful;

// Styled components remain the same as in the original file
const Img = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  max-width: 800px;

  @media (max-width: 768px) {
    width: 90%;
    margin-bottom: 20px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 769px) {
    flex-direction: row;
    justify-content: space-around;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 20px;

  @media (min-width: 769px) {
    order: 1;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;

  @media (min-width: 769px) {
    order: 2;
  }

  @media (max-width: 768px) {
    order: -1;
  }
`;