import {
  Card,
  CardBody,
  Image,
  Stack,
  Heading,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import YouTube from 'react-youtube';
import CalmifyLogo from "../../../assets/logocalmify.png";
import exercise1 from "../../../assets/Exercise/exercise1.jpg";
import exercise2 from "../../../assets/Exercise/exercise2.jpg";
import exercise3 from "../../../assets/Exercise/exercise3.jpg";
import exercise4 from "../../../assets/Exercise/exercise4.jpg";
import exercise5 from "../../../assets/Exercise/exercise5.jpg";
import exercise6 from "../../../assets/Exercise/exercise6.jpg";
import exercise7 from "../../../assets/Exercise/exercise7.jpg";

const ExerciseOption = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCard, setSelectedCard] = useState(null);
  const [cards, setCards] = useState([]);
  const images = [exercise1, exercise2, exercise3, exercise4, exercise5, exercise6, exercise7];

  // Array of YouTube video links
  const videos = [
    "https://youtu.be/AbPufvvYiSw?t=44",
    "https://youtu.be/qEVNj4tcr0Y?t=3",
    "https://youtu.be/g_tea8ZNk5A?t=8",
    "https://youtu.be/yUNvvuJZa_c",
    "https://youtu.be/FEo514Kp_ys?t=6",
    "https://youtu.be/16qCwSMGqx4",
    "https://youtu.be/2zMMjowsfB0"
  ];

  // Extract video ID and start time from YouTube URL
  const getVideoIdAndStartTime = (url) => {
    if (!url) return { videoId: null, startTime: 0 };
    let videoId, startTime = 0;

    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    }

    const urlObj = new URL(url);
    startTime = urlObj.searchParams.get('t') ? parseInt(urlObj.searchParams.get('t')) : 0;

    return { videoId, startTime };
  };


  // Fetch data from Firebase Realtime Database
  useEffect(() => {
    const db = getDatabase();
    const cardsRef = ref(db, "ExcerciseCards");
    const unsubscribe = onValue(
      cardsRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log("Fetched data:", data);
        if (data) {
          setCards(Object.values(data));
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle card click and open modal with video and details
  const handleCardClick = (card, videoId, startTime) => {
    setSelectedCard({ ...card, videoId, startTime });
    onOpen();
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  // YouTube video options, dynamically set start time
  const videoOptions = {
    height: '315',
    width: '100%',
    playerVars: {
      autoplay: 0,
      start: selectedCard?.startTime || 0,
    },
  };

  return (
    <div>
      <StyledNav>
        <Logo onClick={handleLogoClick}>
          <LogoImg src={CalmifyLogo} alt="Calmify" />
        </Logo>
      </StyledNav>
      <Heading justify="center" m={15} textAlign={"center"}>Exercise</Heading>

      <div style={{ textAlign: "center" }}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} m={10}>
          {cards.map((card, index) => {
            const { videoId, startTime } = getVideoIdAndStartTime(videos[index]);
            return (
              <Card maxW="sm" key={index} onClick={() => handleCardClick(card, videoId, startTime)} style={StyledCard}>
                <CardBody>
                  <Image src={images[index]} alt={card.title} borderRadius="lg" style={ImageStyle} />
                  <Stack mt="6" spacing="3">
                    <Heading size="md">{card.title}</Heading>
                    <Text>{card.shortInfo}</Text>
                  </Stack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>

        {/* Modal to display long info and YouTube video */}
        {selectedCard && (
          <Modal isOpen={isOpen} size={'xl'} onClose={onClose}>
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent>
              <ModalHeader>{selectedCard.title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <YouTube videoId={selectedCard.videoId} opts={videoOptions} />
                <InfoCard>{selectedCard.longInfo}</InfoCard>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ExerciseOption;

const ImageStyle = {
  width: "100%",
  height: "300px",
  objectFit: "cover",
  borderTopLeftRadius: "10px",
  borderTopRightRadius: "10px",
};

const InfoCard = styled.div`
  border: 1px solid #ffffff;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
`;

const StyledCard = {
  width: "100%",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.23)",
  borderRadius: "10px",
  overflow: "hidden",
  transition: "transform 0.3s ease-in-out",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  margin: "auto",

  "@media (min-width: 768px)": {
    width: "360px",
    height: "510px",
  },
};

const StyledNav = styled.nav`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: rgb(239, 241, 244);
  padding: 15px 20px;
  font-family: Arial, sans-serif;
  font-size: 24px;
  font-weight: bold;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImg = styled.img`
  height: 40px;
  margin-right: 20px;
  cursor: pointer;
`;
