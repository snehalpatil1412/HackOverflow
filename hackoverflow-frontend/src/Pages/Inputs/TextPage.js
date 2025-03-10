import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import backgroundImage from "./../../assets/textpage.jpg"; // Import your image here
import saveStressData from "../../FirebaseUtils";
import { useAuth } from "../Authentication/AuthContext";
import { db } from "../../firebaseConfig";
import { ref, push, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { GridItem, Text, Heading, useDisclosure, Modal, useBreakpointValue, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, AspectRatio } from "@chakra-ui/react";

const TextPage = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [prediction, setPrediction] = useState("");
  const [videos, setVideos] = useState([]);
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalSize = useBreakpointValue({ base: "full", md: "xl", lg: "2xl" });
  
  // Refs for scrolling
  const videoSectionRef = useRef(null);

  // Effect to auto-scroll when videos are loaded
  useEffect(() => {
    if (videos.length > 0 && videoSectionRef.current) {
      setTimeout(() => {
        videoSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500); // Small delay to ensure content is rendered
    }
  }, [videos]);

  // Array of 10 YouTube videos
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
  // Shuffle function to randomize the order of videos
  const shuffleArray = (array) => {
    let shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text");
      return;
    }
    setIsProcessing(true);

    try {
      const response = await fetch("https://calmify-a-stress-reduction-space.onrender.com/api/predict/text/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data.stress);

      // If prediction is 'stressed', display 3 random videos
      if (data.stress === 1) {
        const shuffledVideos = shuffleArray(youtubeVideos).slice(0, 3);
        setVideos(shuffledVideos);

        if (user) {
          const saveTextData = async () => {
            const userRef = ref(db, `users/${user.uid}/input/text`);
            const stressRef = ref(db, `users/${user.uid}/input/stress_count`);

            // Extract video details for saving
            const videoSuggestions = shuffledVideos.map((video) => ({
              title: video.title,
              url: video.url,
            }));

            const newResponse = {
              prediction: "stressed",
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

          saveTextData();
        }
      }
    } catch (error) {
      console.error("Error while submitting text:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    onOpen();
  };

  const navigateToGames = () => {
    navigate("/games");
  };

  const navigateToMusic = () => {
    navigate("/music");
  };

  return (
    <Container>
      <Tagline>Let's find your calm together!</Tagline>

      <TextArea
        placeholder="How was your day....."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
      {isProcessing && <ProcessingSpinner />}
      {prediction !== "" && ( // Check if prediction is not an empty string
        <PredictionFrame>
          <Heading size="md" mb={4} color="rgb(164, 111, 61)">
            Recommendation Based on Your Results
          </Heading>

          {prediction === 1 ? (
            <PredictionText>
              It seems you're feeling stressed. No worries, we're here to help
              you relax and feel better! Here are some videos to calm your mind.
            </PredictionText>
          ) : (
            <PredictionText>
              You're doing great! Keep it up, and remember to take breaks when
              needed. Stay positive!
            </PredictionText>
          )}
        </PredictionFrame>
      )}

      {videos.length > 0 && (
        <VideoSection ref={videoSectionRef}>
          <VideoGrid>
            {videos.map((video) => (
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
          </VideoGrid>

          <GamesMusicContainer>
            <GridItem>
              <NavButton onClick={navigateToGames}>
                <Heading size="lg" color="black">Games</Heading>
                <Text mt={2} color="black">Play stress-relief games</Text>
              </NavButton>
            </GridItem>
            <GridItem>
              <NavButton onClick={navigateToMusic}>
                <Heading size="lg" color="black">Music</Heading>
                <Text mt={2} color="black">Listen to calming music</Text>
              </NavButton>
            </GridItem>
          </GamesMusicContainer>
        </VideoSection>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>{selectedVideo?.title}</ModalHeader>

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
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default TextPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  color: white;
  padding: 20px;
`;

const TextArea = styled.textarea`
  width: 95%;
  max-width: 900px;
  height: 250px;
  padding: 10px;
  border-radius: 10px;
  border: 2px solid rgb(190, 152, 117);
  font-size: 18px;
  color: #000000;
  outline: none;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  resize: vertical;

  @media (min-width: 768px) {
    height: 300px;
    font-size: 22px;
  }
`;

const SubmitButton = styled.button`
  background-color: rgb(164, 111, 61);
  color: white;
  padding: 12px 40px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 18px;
  margin: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;

  &:hover {
    background-color: rgb(190, 152, 117);
  }

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const VideoSection = styled.div`
  margin-top: 20px;
  width: 90%;
  max-width: 1150px;
  scroll-margin-top: 20px;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const VideoCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 15px;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 10px;
  object-fit: cover;
`;

const VideoTitle = styled.h4`
  text-align: center;
  margin: 10px 0;
  font-size: 16px;
  color: #333;
`;

const Tagline = styled.h1`
  margin-bottom: 20px;
  font-size: 2rem;
  color:rgb(164, 111, 61);

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const PredictionText = styled.p`
  font-size: 19px;
  color: #333;
  line-height: 1.8;
`;

const PredictionFrame = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 23px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-left: 6px solid rgb(190, 152, 117);
  border-right: 6px solid rgb(190, 152, 117);
`;

const GamesMusicContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  gap: 15px;
  justify-content: center;
  align-items: center;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const NavButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 25px;
  width: 110%;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 50%;
  border: 2px solid #e8e8e8;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    width: 550px;
  }
`;

const VideoLink = styled.button`
  text-decoration: none;
  color: rgb(0, 0, 0);
  font-weight: bold;
  padding: 8px 20px;
  border: 1.5px solid rgb(190, 152, 117);
  border-radius: 20px;
  transition: all 0.3s ease;
  background: none;
  cursor: pointer;

  &:hover {
    background-color: rgb(190, 152, 117);
    color: white;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ProcessingSpinner = styled.div`
  border: 6px solid rgba(0, 0, 0, 0.1);
  border-top: 6px solid rgb(190, 152, 117);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 20px;
  font-size: 16px;
  background-color: rgb(190, 152, 117);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  &:hover {
    background-color: rgb(190, 152, 117);
  }
  @media (min-width: 768px) {
    width: auto;
  }
`;