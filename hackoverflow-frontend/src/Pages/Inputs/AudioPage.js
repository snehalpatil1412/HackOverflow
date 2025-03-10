import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import microphoneImage from "../../assets/microphone.png";
import AudioImg from "../../assets/audioimg.jpg";
import saveStressData from "../../FirebaseUtils";
import { useAuth } from "../Authentication/AuthContext";
import { db } from "../../firebaseConfig";
import { ref, push, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { 
  useDisclosure, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  AspectRatio,
  GridItem,
  Text,
  Heading,
  useBreakpointValue
} from "@chakra-ui/react";

const AudioPage = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showRecordingInterface, setShowRecordingInterface] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalSize = useBreakpointValue({ base: "full", md: "xl", lg: "2xl" });
  
  // Refs for scrolling
  const videoSectionRef = useRef(null);

  // Array of stress relief videos 
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
      title: "How to protect your brain from stress | Niki Korteweg | TEDxAmsterdamWomen",
      url: "https://youtu.be/Nz9eAaXRzGg?si=B8RAdhiWiRo9CeAL",
      embedUrl: "https://www.youtube.com/embed/Nz9eAaXRzGg",
      thumbnail: "https://img.youtube.com/vi/Nz9eAaXRzGg/0.jpg",
    },
    {
      id: 3,
      title: "How stress is killing us (and how you can stop it). | Thijs Launspach | TEDxUniversiteitVanAmsterdam",
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
      title: "Reduce stress and anxiety with these mind-quieting tips | How to stop overthinking | Anxiety relief",
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

  // Effect to auto-scroll when videos are loaded
  useEffect(() => {
    if (videos.length > 0 && videoSectionRef.current) {
      setTimeout(() => {
        videoSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
    }
  }, [videos]);

  // Shuffle function to randomize the order of videos
  const shuffleArray = (array) => {
    let shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  useEffect(() => {
    // Initialize the Speech Recognition API
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-US";

      recog.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };

      recog.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      setRecognition(recog);
    } else {
      console.error("SpeechRecognition API not supported.");
    }
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      recognition.stop(); // Stop speech recognition
      mediaRecorder.stop(); // Stop recording
      setIsRecording(false);
    } else {
      setTranscript("");
      setPrediction("");
      recognition.start(); // Start speech recognition
      setIsRecording(true);

      // Start recording audio
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          setAudioBlob(event.data);
          setAudioURL(URL.createObjectURL(event.data)); // Create a URL for the audio blob
        };

        recorder.start();
        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  const handleSubmitTranscript = async () => {
    if (!transcript.trim()) {
      alert("No transcribed text available");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("https://calmify-a-stress-reduction-space.onrender.com/api/predict/text/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcript }),
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
          // Save to Firebase
          const userRef = ref(db, `users/${user.uid}/input/audio`);
          const stressRef = ref(db, `users/${user.uid}/input/stress_count`);

          // Extract video details for saving
          const videoSuggestions = shuffledVideos.map((video) => ({
            title: video.title,
            url: video.url,
          }));

          const newResponse = {
            transcript: transcript,
            prediction: "stressed",
            timestamp: new Date().toLocaleString(),
            suggestedVideos: videoSuggestions,
          };

          // Save audio response to Firebase
          await push(userRef, newResponse);

          // Update stress count
          const snapshot = await get(stressRef);
          const currentCount = snapshot.exists() ? snapshot.val().count : 0;
          await update(stressRef, { count: currentCount + 1 });

          // Save stress data
          await saveStressData("audio", transcript, "stressed", videoSuggestions);
        }
      }
    } catch (error) {
      console.error("Error while submitting transcript:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordAudio = () => {
    setShowRecordingInterface(true);
  };

  const handleUploadAudio = () => {
    // Alert user that this feature is coming soon
    alert("Audio upload functionality will be available soon!");
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

  const handleBack = () => {
    // Reset states and go back to main screen
    setShowRecordingInterface(false);
    setAudioBlob(null);
    setAudioURL("");
    setTranscript("");
    setPrediction("");
    setVideos([]);
  };

  // Initial page view
  if (!showRecordingInterface) {
    return (
      <PageContainer>
        <ContentContainer>
          <TextSection>
            <Title><b>Audio</b></Title>
            <TitleNext><b>Stress Detection</b></TitleNext>
            <Description>
              Share how you're feeling by speaking or uploading an audio clip. Our system will 
              analyze your voice patterns and offer personalized stress-relief recommendations.
            </Description>
            <ButtonContainer>
              <PrimaryButton onClick={handleRecordAudio}>
                Record Audio
              </PrimaryButton>
              <SecondaryButton onClick={handleUploadAudio}>
                Upload Audio
              </SecondaryButton>
            </ButtonContainer>
          </TextSection>
          <IllustrationSection>
            <Illustration src={AudioImg} alt="Audio Emotion Detection" />
          </IllustrationSection>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Recording interface
  return (
    <RecordingPageContainer>
          <BackButton onClick={handleBack}>
            <span>←</span> Back
          </BackButton>
          
          <RecordingCard>
            <CardHeader>
              <CardTitle>Voice Stress Analysis</CardTitle>
              <CardSubtitle>Speak naturally for 10-30 seconds for best results</CardSubtitle>
            </CardHeader>
    
            <RecordingSection>
              <RecordingStatus isRecording={isRecording}>
                {isRecording ? "Recording..." : "Ready to record"}
              </RecordingStatus>
              
              <MicrophoneButton
                isRecording={isRecording}
                onClick={toggleRecording}
                image={microphoneImage}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <RecordingIcon>⬛</RecordingIcon>
                ) : (
                  <RecordingIcon>🎙️</RecordingIcon>
                )}
              </MicrophoneButton>
              
              <RecordingInstructions>
                {isRecording ? "Tap to stop recording" : "Tap microphone to begin"}
              </RecordingInstructions>
            </RecordingSection>
    
            {audioBlob && (
              <AudioPreview>
                <PreviewLabel>Review your recording:</PreviewLabel>
                <AudioPlayer controls>
                  <source src={audioURL} type="audio/wav" />
                  Your browser does not support the audio element.
                </AudioPlayer>
              </AudioPreview>
            )}
    
            {transcript && (
              <TranscriptBox>
                <TranscriptLabel>Transcription:</TranscriptLabel>
                <TranscriptText>{transcript}</TranscriptText>
              </TranscriptBox>
            )}
    
            {audioBlob && (
              <ActionButton 
                onClick={handleSubmitTranscript} 
                disabled={isProcessing}
              >
                {isProcessing ? "Analyzing..." : "Analyze My Voice"}
              </ActionButton>
            )}
          </RecordingCard>
          {/* </RecordingPageContainer> */}
    

      {/* // {isProcessing && <ProcessingSpinner />} */}

      {prediction !== "" && (
        <PredictionFrame>
          <Heading size="md" mb={4} color="rgb(164, 111, 61)">
            Your Voice Analysis Results
          </Heading>

          {prediction === 1 ? (
            <PredictionText>
              I've detected signs of stress in your voice. No worries, we're here 
              to help you relax and feel better! Check out these videos to calm your mind.
            </PredictionText>
          ) : (
            <PredictionText>
              You're doing great! Your voice patterns suggest you're in a positive state.
              Remember to maintain this balance and practice self-care regularly.
            </PredictionText>
          )}
        </PredictionFrame>
      )}

      {videos.length > 0 && (
        <VideoSection ref={videoSectionRef}>
          <VideoSectionTitle>Recommended Videos For You</VideoSectionTitle>
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
    </RecordingPageContainer>
  );
};

export default AudioPage;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f2ff 0%, #ffffff 100%);
  padding: 20px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1000px;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const TextSection = styled.div`
  flex: 1;
  padding: 40px;
  order: 2;
  
  @media (min-width: 768px) {
    order: 1;
  }
`;

const IllustrationSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  // background-color: #f7fafc;
  padding: 20px;
  order: 1;
  
  @media (min-width: 768px) {
    order: 2;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: rgb(139, 193, 252);
  // margin-bottom: 5px;
  // font-weigth: 10px;

  @media (min-width: 768px) {
    font-size: 38px;
  }
`;

const TitleNext = styled.h1`
font-size: 28px;
  color: rgb(36, 36, 36);
  margin-bottom: 35px;
  font-weigth: 10px;

  @media (min-width: 768px) {
    font-size: 38px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: #555;
  margin-bottom: 30px;
  line-height: 1.6;
  
  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 20px;
  }
`;

const PrimaryButton = styled.button`
  padding: 12px 24px;
  background-color:rgb(192, 219, 248) ;
  color: rgb(143, 143, 143);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background-color:#e6f2ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SecondaryButton = styled.button`
  padding: 12px 24px;
  background-color: #e6f2ff;
  color:rgb(143, 143, 143);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background-color:rgb(190, 218, 248);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Illustration = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 10px;
`;

const RecordingPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background-color: #f7fafc;
    transform: translateY(-2px);
  }

  span {
    font-size: 20px;
  }
`;

const RecordingCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 600px;
  padding: 30px;
  margin-bottom: 30px;
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const CardTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
`;

const CardSubtitle = styled.p`
  font-size: 16px;
  color: #718096;
  margin: 0;
`;

const RecordingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const RecordingStatus = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.isRecording ? '#e53e3e' : '#4a5568'};
  margin-bottom: 20px;
`;

const MicrophoneButton = styled.button`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.isRecording ? '#fed7d7' : '#e6fffa'};
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  
  ${(props) =>
    props.isRecording &&
    `
    animation: pulse 1.5s infinite;
  `}

  &:hover {
    transform: scale(1.05);
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(229, 62, 62, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
    }
  }
`;

const RecordingIcon = styled.span`
  font-size: 36px;
`;

const RecordingInstructions = styled.p`
  font-size: 16px;
  color: #718096;
  text-align: center;
`;

const AudioPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
`;

const PreviewLabel = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 12px;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-top: 8px;
`;

const TranscriptBox = styled.div`
  background-color: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  width: 100%;
`;

const TranscriptLabel = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
`;

const TranscriptText = styled.p`
  font-size: 16px;
  color: #2d3748;
  line-height: 1.5;
  margin: 0;
`;

const ActionButton = styled.button`
  background-color: #6c5ce7;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 28px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(108, 92, 231, 0.2);

  &:hover:not(:disabled) {
    background-color: #5847e0;
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(108, 92, 231, 0.25);
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;


const PredictionFrame = styled.div`
  margin: 20px 0;
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 25px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-left: 6px solid rgb(190, 152, 117);
  border-right: 6px solid rgb(190, 152, 117);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const PredictionText = styled.p`
  font-size: 18px;
  color: #333;
  line-height: 1.8;
`;

const VideoSection = styled.div`
  margin: 30px 0;
  width: 100%;
  max-width: 1100px;
  scroll-margin-top: 20px;
`;

const VideoSectionTitle = styled.h3`
  font-size: 24px;
  color: rgb(164, 111, 61);
  margin-bottom: 20px;
  text-align: center;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
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
  flex-grow: 1;
`;

// const VideoLink = styled.button`
//   text-decoration: none;
//   color: rgb(0, 0, 0);
//   font-weight: bold;
//   padding: 8px 20px;
//   border: 1.5px solid rgb(190, 152, 117);
//   border-radius: 20px;
//   transition: all 0.3s ease;
//   background: none;
//   cursor: pointer;
//   margin-top: 10px;

//   &:hover {
//     background-color: rgb(190, 152, 117);
//     color: white;
//   }
// `;

const GamesMusicContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 30px;
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

// const spin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;

// const ProcessingSpinner = styled.div`
//   border: 6px solid rgba(0, 0, 0, 0.1);
//   border-top: 6px solid rgb(190, 152, 117);
//   border-radius: 50%;
//   width: 50px;
//   height: 50px;
//   animation: ${spin} 1s linear infinite;
//   margin-top: 20px;
// `;

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