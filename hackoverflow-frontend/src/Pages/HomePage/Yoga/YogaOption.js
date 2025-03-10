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
import yoga1 from "../../../assets/Yoga/child_pose.png";
import yoga2 from "../../../assets/Yoga/downward_facing_dog.png";
import yoga3 from "../../../assets/Yoga/Savasana.jpg";
import yoga4 from "../../../assets/Yoga/viparita_karani.png";
import yoga5 from "../../../assets/Yoga/utthita_trikonasana.png";

const YogaOption = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCard, setSelectedCard] = useState(null);
  const [cards, setCards] = useState([]);
  const images = [yoga1, yoga2, yoga3, yoga4, yoga5];

  // Array of YouTube video links
  const videos = [
    "https://youtu.be/2MJGg-dUKh0?si=egSyDDcwh-spJlZ8&t=15",
    "https://youtu.be/EC7RGJ975iM?feature=shared",
    "https://www.youtube.com/watch?v=1VYlOKUdylM&t=4s",
    "https://youtu.be/a4thkiW2uPA?si=iIXbllkLo8jtYSzl&t=31",
    "https://youtu.be/zJDUKJjq_8c?si=k_4z_kpO5qCr5CQZ&t=11",
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
    const cardsRef = ref(db, "yogaCards");
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
      <Heading justify="center" m={15} textAlign={"center"}>Yoga Poses</Heading>

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

export default YogaOption;

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

