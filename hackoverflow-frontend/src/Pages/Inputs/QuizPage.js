import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  RadioGroup,
  Radio,
  Text,
  Heading,
  Stack,
  Card,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  AspectRatio,
  useBreakpointValue,
  Center,
  HStack,
} from "@chakra-ui/react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styled from "styled-components";
import { db } from "../../firebaseConfig";
import { ref, push, get, update } from "firebase/database";
import { useAuth } from "../Authentication/AuthContext";
import saveStressData from "../../FirebaseUtils";
import backgroundImage from "../../assets/quiz.jpg";
import { useNavigate } from "react-router-dom";
import CalmifyLogo from "../../assets/logocalmify.png";

const youtubeVideos = [
  {
    id: 1,
    title: "3-Minute Stress Management: Reduce Stress With This Short Activity",
    url: "https://youtu.be/grfXR6FAsI8?si=Npm8XkqaYLTKe0Tz",
    embedUrl: "https://www.youtube.com/embed/grfXR6FAsI8",
    thumbnail: "https://img.youtube.com/vi/grfXR6FAsI8/0.jpg",
  },
  {
    id: 2,
    title:
      "How to protect your brain from stress | Niki Korteweg | TEDxAmsterdamWomen",
    url: "https://youtu.be/Nz9eAaXRzGg?si=B8RAdhiWiRo9CeAL",
    embedUrl: "https://www.youtube.com/embed/Nz9eAaXRzGg",
    thumbnail: "https://img.youtube.com/vi/Nz9eAaXRzGg/0.jpg",
  },
  {
    id: 3,
    title:
      "How stress is killing us (and how you can stop it). | Thijs Launspach | TEDxUniversiteitVanAmsterdam",
    url: "https://youtu.be/NyyPZJrDfkM?si=U0eZ_3Yl13hRd8fa",
    embedUrl: "https://www.youtube.com/embed/NyyPZJrDfkM",
    thumbnail: "https://img.youtube.com/vi/NyyPZJrDfkM/0.jpg",
  },
  {
    id: 4,
    title: "Stress relief tips",
    url: "https://youtu.be/Q0m6MB7Dr30?si=DFjyiUFOp2imZULm",
    embedUrl: "https://www.youtube.com/embed/Q0m6MB7Dr30",
    thumbnail: "https://img.youtube.com/vi/Q0m6MB7Dr30/0.jpg",
  },
  {
    id: 5,
    title: "Hack for Headaches & Stress",
    url: "https://youtube.com/shorts/_IfbUjoFdkk?si=Lb0-3tPn2vyCSwsn",
    embedUrl: "https://www.youtube.com/embed/_IfbUjoFdkk",
    thumbnail: "https://img.youtube.com/vi/_IfbUjoFdkk/0.jpg",
  },
  {
    id: 6,
    title: "Instant Anxiety Relief Point on Your Body | Dr. Meghana Dikshit",
    url: "https://youtube.com/shorts/QPyNeGHlMao?si=y_IPkrmy9lKGARRi",
    embedUrl: "https://www.youtube.com/embed/QPyNeGHlMao",
    thumbnail: "https://img.youtube.com/vi/QPyNeGHlMao/0.jpg",
  },
  {
    id: 7,
    title: "The Science of Stress & How to Reduce It 5 Minute Stress Relief",
    url: "https://youtube.com/shorts/f8BqU9wUbP0?si=PsZU0MSumvWHCGok",
    embedUrl: "https://www.youtube.com/embed/f8BqU9wUbP0",
    thumbnail: "https://img.youtube.com/vi/f8BqU9wUbP0/0.jpg",
  },
  {
    id: 8,
    title:
      "Reduce stress and anxiety with these mind-quieting tips | How to stop overthinking | Anxiety relief",
    url: "https://youtu.be/bsaOBWUqdCU?si=SaOP1WGjJLkZPdHP",
    embedUrl: "https://www.youtube.com/embed/bsaOBWUqdCU",
    thumbnail: "https://img.youtube.com/vi/bsaOBWUqdCU/0.jpg",
  },
  {
    id: 9,
    title: "10 Minute Guided Imagery for Reducing Stress and Anxiety",
    url: "https://youtu.be/AbckuluEdM0?si=hc6dgs42rwCxgrpM",
    embedUrl: "https://www.youtube.com/embed/AbckuluEdM0",
    thumbnail: "https://img.youtube.com/vi/AbckuluEdM0/0.jpg",
  },
  {
    id: 10,
    title: "10 Minute Guided Imagery Meditation | City of Hope",
    url: "https://youtu.be/t1rRo6cgM_E?si=5GRImKLS5JB--3VA",
    embedUrl: "https://www.youtube.com/embed/t1rRo6cgM_E",
    thumbnail: "https://img.youtube.com/vi/t1rRo6cgM_E/0.jpg",
  },
];

const shuffleArray = (array) => {
  let shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const questions = [
  {
    id: 1,
    question: "How often do you feel stressed in your daily life?",
    options: [
      { text: "Rarely", score: 1 },
      { text: "Sometimes", score: 2 },
      { text: "Often", score: 3 },
      { text: "Always", score: 4 },
    ],
  },
  {
    id: 2,
    question: "How well do you sleep at night?",
    options: [
      { text: "Very well", score: 1 },
      { text: "Fairly well", score: 2 },
      { text: "Poorly", score: 3 },
      { text: "Very poorly", score: 4 },
    ],
  },
  {
    id: 3,
    question: "How often do you feel overwhelmed by your tasks?",
    options: [
      { text: "Rarely", score: 1 },
      { text: "Sometimes", score: 2 },
      { text: "Often", score: 3 },
      { text: "Always", score: 4 },
    ],
  },
  {
    id: 4,
    question: "How often do you take breaks during work or study?",
    options: [
      { text: "Frequently", score: 1 },
      { text: "Sometimes", score: 2 },
      { text: "Rarely", score: 3 },
      { text: "Never", score: 4 },
    ],
  },
  {
    id: 5,
    question: "How would you describe your eating habits?",
    options: [
      { text: "Healthy", score: 1 },
      { text: "Moderate", score: 2 },
      { text: "Unhealthy", score: 3 },
      { text: "Very unhealthy", score: 4 },
    ],
  },
  {
    id: 6,
    question: "How much time do you spend on physical activities weekly?",
    options: [
      { text: "More than 5 hours", score: 1 },
      { text: "2-5 hours", score: 2 },
      { text: "Less than 2 hours", score: 3 },
      { text: "None", score: 4 },
    ],
  },
  {
    id: 7,
    question: "How often do you feel supported by friends or family?",
    options: [
      { text: "Always", score: 1 },
      { text: "Often", score: 2 },
      { text: "Sometimes", score: 3 },
      { text: "Never", score: 4 },
    ],
  },
];

const calculateMood = (score) => {
  if (score <= 14) return { mood: "Relaxed", color: "#4caf50" };
  if (score <= 21) return { mood: "Moderately Stressed", color: "#ffeb3b" };
  return { mood: "Highly Stressed", color: "#f44336" };
};

const QuizPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [videos, setVideos] = useState([]);
  const [mood, setMood] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  
  // Track question answers to allow going back
  const [questionAnswers, setQuestionAnswers] = useState({});

  // Responsive layout adjustments
  const gridColumns = useBreakpointValue({ base: "1fr", md: "repeat(2, 1fr)" });
  const flexDirection = useBreakpointValue({ base: "column", md: "row" });
  const containerWidth = useBreakpointValue({ base: "100%", md: "50%" });
  const modalSize = useBreakpointValue({ base: "full", md: "xl", lg: "2xl" });

  const handleNext = () => {
    if (selectedOption === null) return;

    window.speechSynthesis.cancel();

    const question = questions[currentQuestion];
    const selectedScore = question.options.find(
      (option) => option.text === selectedOption
    )?.score;

    // Save the current question's answer
    setQuestionAnswers((prev) => ({
      ...prev,
      [currentQuestion]: selectedOption,
    }));
    
    setResponses((prev) => ({ ...prev, [question.question]: selectedOption }));
    setScore((prevScore) => prevScore + selectedScore);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Set the selected option for the next question if it was previously answered
      setSelectedOption(questionAnswers[currentQuestion + 1] || null);
    } else {
      setIsFinished(true);
    }
  };
  
  const handleBack = () => {
    if (currentQuestion === 0) return;
    
    window.speechSynthesis.cancel();
    
    // Subtract the score from the current question
    const currentQuestionObj = questions[currentQuestion];
    const currentAnswer = questionAnswers[currentQuestion];
    
    if (currentAnswer) {
      const currentScore = currentQuestionObj.options.find(
        (option) => option.text === currentAnswer
      )?.score || 0;
      
      setScore((prevScore) => prevScore - currentScore);
    }
    
    // Go back to the previous question
    setCurrentQuestion(currentQuestion - 1);
    
    // Set the selected option to what was previously selected for this question
    setSelectedOption(questionAnswers[currentQuestion - 1] || null);
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    onOpen();
  };

  useEffect(() => {
    if (isFinished) {
      const result = calculateMood(score);
      setMood(result);

      // Generate videos for the 2x2 grid only if moderately or highly stressed
      if (
        result.mood === "Moderately Stressed" ||
        result.mood === "Highly Stressed"
      ) {
        const shuffledVideos = shuffleArray(youtubeVideos).slice(0, 2);
        setVideos(shuffledVideos);
      } else {
        // For relaxed users, set empty videos array
        setVideos([]);
      }

      // Fade out background
      setShowBackground(false);

      // Only save to Firebase if user is stressed
      if (
        result.mood === "Moderately Stressed" ||
        result.mood === "Highly Stressed"
      ) {
        if (user) {
          const saveQuizData = async () => {
            const userRef = ref(db, `users/${user.uid}/input/quiz`);
            const stressRef = ref(db, `users/${user.uid}/input/stress_count`);

            // Extract video details for saving if stressed
            const videoSuggestions = result.mood !== "Relaxed" ? 
              shuffleArray(youtubeVideos).slice(0, 2).map((video) => ({
                title: video.title,
                url: video.url,
              })) : [];

            const newResponse = {
              ...responses,
              prediction: result.mood,
              score,
              timestamp: new Date().toLocaleString(),
              suggestedVideos: videoSuggestions,
            };

            // Save quiz response to Firebase
            await push(userRef, newResponse);

            // Update stress count
            const snapshot = await get(stressRef);
            const currentCount = snapshot.exists() ? snapshot.val().count : 0;
            await update(stressRef, { count: currentCount + 1 });

            // Save stress data along with video suggestions
            await saveStressData(videoSuggestions);
          };
          saveQuizData();
        }
      }
    }
  }, [isFinished, score, user, responses]);

  // Calculate default color for CircularProgressbar
  const getDefaultColor = () => {
    if (!mood) return "#87CEEB"; // Default light blue color
    return mood.color;
  };

  // Function to convert text to speech
  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Speak the question when the component updates with a new question
  useEffect(() => {
    if (isStarted && !isFinished) {
      // Small timeout to ensure any previous speech is fully cancelled
      setTimeout(() => {
        speakText(questions[currentQuestion].question);
      }, 100);
    }

    // Cleanup function to cancel speech when component unmounts or changes
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion, isStarted, isFinished]);

  const navigateToGames = () => {
    navigate("/games");
  };

  const navigateToMusic = () => {
    navigate("/music");
  };

  return (
    <MainContainer>
      <ContentWrapper flexDirection={flexDirection}>
        {/* Left side - Quiz */}
        <QuizContainer width={containerWidth}>
          <Card
            height="full"
            width="full"
            mt="1px"
            p={{ base: 4, md: 6 }}
            borderRadius="20px"
            boxShadow=" 0 5px 15px rgba(0, 0, 0, 0.1)"
          >
            <Center mb={6}>
              <LogoContainer>
                <LogoImg src={CalmifyLogo} alt="Calmify" />
              </LogoContainer>
            </Center>

            <Center>
              <Heading size="lg" color="#8869e1" textAlign="center" mb={6}>
                Stress Assessment Quiz
              </Heading>
            </Center>

            {!isStarted ? (
              <VStack spacing={8} height="full" mt={20}>
                <Text textAlign="center" fontSize="xl" maxW="md" mx="auto">
                  This quiz will help assess your current stress levels and
                  provide personalized suggestions.
                </Text>
                <Button
                  onClick={() => setIsStarted(true)}
                  color="#ffffff"
                  bgColor="#8869e1"
                  size="lg"
                  px={10}
                  py={6}
                  fontSize="md"
                  fontWeight="bold"
                  borderRadius="full"
                  _hover={{ bgColor: "#7559d1", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                  boxShadow="md"
                >
                  Start Quiz
                </Button>
              </VStack>
            ) : !isFinished ? (
              <VStack spacing={8} justify="center" height="full" mt={4}>
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  color="#8869e1"
                >
                  Question {currentQuestion + 1} of {questions.length}
                </Text>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  textAlign="center"
                  fontWeight="medium"
                >
                  {questions[currentQuestion].question}
                </Text>
                <RadioGroup
                  onChange={setSelectedOption}
                  value={selectedOption || ""}
                  width="full"
                  maxW="md"
                  mx="auto"
                >
                  <Stack
                    spacing={6}
                    direction="column"
                    alignItems="center"
                    justify="center"
                    width="full"
                  >
                    {questions[currentQuestion].options.map((option, index) => (
                      <Radio
                        key={index}
                        value={option.text}
                        width="full"
                        justifyContent="center"
                        colorScheme="purple"
                        size="lg"
                      >
                        <Text fontSize="md">{option.text}</Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
                
                {/* Navigation buttons in a flex container */}
                <HStack 
                  width={{ base: "full", md: "60%" }} 
                  maxW="md" 
                  spacing={4} 
                  justify="center"
                >
                  {/* Back button */}
                  <Button
                    onClick={handleBack}
                    isDisabled={currentQuestion === 0}
                    color="white"
                    bgColor="#9e7cee"
                    flex="1"
                    py={6}
                    borderRadius="full"
                    _hover={{ bgColor: "#8f6ddf", transform: "translateY(-2px)" }}
                    transition="all 0.3s ease"
                    boxShadow="md"
                  >
                    Back
                  </Button>
                  
                  {/* Next/Finish button */}
                  <Button
                    onClick={handleNext}
                    isDisabled={selectedOption === null}
                    color="white"
                    bgColor="#8869e1"
                    flex="1"
                    py={6}
                    borderRadius="full"
                    _hover={{ bgColor: "#7559d1", transform: "translateY(-2px)" }}
                    transition="all 0.3s ease"
                    boxShadow="md"
                  >
                    {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack spacing={8} justify="center" height="full" mt={4}>
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  color="#8869e1"
                >
                  Quiz Complete!
                </Text>
                {mood && (
                  <>
                    <Box
                      width={{ base: "150px", md: "180px" }}
                      height={{ base: "150px", md: "180px" }}
                    >
                      <CircularProgressbar
                        value={(score / (questions.length * 4)) * 100}
                        text={`${Math.round(
                          (score / (questions.length * 4)) * 100
                        )}%`}
                        styles={buildStyles({
                          textSize: "20px",
                          fontWeight: "bold",
                          pathColor: getDefaultColor(),
                          textColor: getDefaultColor(),
                          trailColor: "#e6e6e6",
                          pathTransition: "stroke-dashoffset 0.5s ease 0s",
                        })}
                      />
                    </Box>
                    <Text fontSize="xl" textAlign="center" fontWeight="medium">
                      Your stress level is:{" "}
                      <Box as="span" fontWeight="bold" color={mood.color}>
                        {mood.mood}
                      </Box>
                    </Text>
                  </>
                )}
                <Button
                  onClick={() => window.location.reload()}
                  colorScheme="purple"
                  variant="outline"
                  size="lg"
                  borderRadius="full"
                  _hover={{ transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                  boxShadow="sm"
                >
                  Retake Quiz
                </Button>
              </VStack>
            )}
          </Card>
        </QuizContainer>

        {/* Right side - Background/Results */}
        <SuggestionsContainer width={containerWidth}>
          {showBackground ? (
            <BackgroundImageContainer
              style={{
                backgroundImage: `url(${backgroundImage})`,
                opacity: isFinished ? 0 : 1,
                transition: "opacity 0.5s ease-in-out",
              }}
            />
          ) : (
            <ResultsContainer>
              {mood && (
                <EmotionFrame>
                  <Heading size="md" mb={4} color="rgb(108, 59, 222)">
                    Recommendation Based on Your Results
                  </Heading>
                  <EmotionText>
                    {mood.mood === "Moderately Stressed" ||
                    mood.mood === "Highly Stressed" ? (
                      <>
                        It seems you're feeling <b>{mood.mood}</b>. No worries,
                        we're here to help you relax and feel better! Here are
                        some recommendations.
                      </>
                    ) : (
                      "You're doing great! You can still use the games and music to improve your mood! Keep it up, and remember to take breaks when needed. Stay positive!"
                    )}
                  </EmotionText>
                </EmotionFrame>
              )}

              {isFinished && (
                <Grid templateColumns={gridColumns} gap={6} mt={6}>
                  {/* YouTube videos only for moderately or highly stressed users */}
                  {(mood?.mood === "Moderately Stressed" || mood?.mood === "Highly Stressed") && 
                    videos.map((video) => (
                      <GridItem key={video.id}>
                        <VideoCard>
                          <Thumbnail src={video.thumbnail} alt={video.title} />
                          <VideoTitle>{video.title}</VideoTitle>
                          <VideoLink onClick={() => openVideoModal(video)}>
                            Watch Video
                          </VideoLink>
                        </VideoCard>
                      </GridItem>
                    ))}

                  {/* Games and Music buttons for all users */}
                  <GridItem colSpan={mood?.mood === "Relaxed" ? 1 : undefined}>
                    <NavButton onClick={navigateToGames}>
                      <Heading size="md">Games</Heading>
                      <Text mt={2}>Play stress-relief games</Text>
                    </NavButton>
                  </GridItem>
                  <GridItem colSpan={mood?.mood === "Relaxed" ? 1 : undefined}>
                    <NavButton onClick={navigateToMusic}>
                      <Heading size="md">Music</Heading>
                      <Text mt={2}>Listen to calming music</Text>
                    </NavButton>
                  </GridItem>
                </Grid>
              )}
            </ResultsContainer>
          )}
        </SuggestionsContainer>
      </ContentWrapper>

      {/* Video Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>{selectedVideo?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedVideo && (
              <AspectRatio ratio={16 / 9}>
                <iframe
                  title={selectedVideo.title}
                  src={selectedVideo.embedUrl}
                  allowFullScreen
                />
              </AspectRatio>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="purple"
              justifyContent="center"
              mr={3}
              onClick={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MainContainer>
  );
};

export default QuizPage;

// Styled components
const LogoImg = styled.img`
  height: 50px;
  cursor: pointer;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const MainContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
`;

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1400px;
  min-height: 600px;
  gap: 30px;
  flex-direction: ${(props) => props.flexDirection || "row"};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const QuizContainer = styled.div`
  flex: 1;
  width: ${(props) => props.width || "50%"};
  min-height: 600px;
  display: flex;

  @media (max-width: 768px) {
    width: 100%;
    min-height: unset;
    margin-bottom: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SuggestionsContainer = styled.div`
  flex: 1;
  width: ${(props) => props.width || "50%"};
  min-height: 600px;
  display: flex;

  @media (max-width: 768px) {
    width: 100%;
    min-height: unset;
  }
`;

const BackgroundImageContainer = styled.div`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    min-height: 300px;
  }
`;

const ResultsContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 25px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const EmotionText = styled.p`
  font-size: 16px;
  color: #333;
  line-height: 1.8;
`;

const EmotionFrame = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 20px;
  border-left: 6px solid rgb(158, 124, 238);
`;

const VideoCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
  aspect-ratio: 16/9;
`;

const VideoTitle = styled.h4`
  text-align: center;
  margin: 12px 0;
  font-size: 16px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
`;

const VideoLink = styled.button`
  text-decoration: none;
  color: rgb(158, 124, 238);
  font-weight: bold;
  margin-top: auto;
  padding: 8px 20px;
  border: 1.5px solid rgb(158, 124, 238);
  border-radius: 20px;
  transition: all 0.3s ease;
  background: none;
  cursor: pointer;

  &:hover {
    background-color: rgb(158, 124, 238);
    color: white;
  }
`;

const NavButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  border: 2px solid #e8e8e8;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-color: rgb(158, 124, 238);
  }
`;
