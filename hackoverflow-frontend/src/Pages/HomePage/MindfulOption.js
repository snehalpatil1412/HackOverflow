import {
  Button,
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
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
// import { database } from '../../firebase'; 
import yoga from "../../assets/Yoga/yoga.jpg"

const MindfulOption = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCard, setSelectedCard] = useState(null);
  const [cards, setCards] = useState([]);

  // Fetch data from Firebase Realtime Database
  useEffect(() => {
    const db = getDatabase();
    const cardsRef = ref(db, "yogaCards");
    const unsubscribe = onValue(cardsRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Fetched data:", data); // Log data
      if (data) {
        setCards(Object.values(data));
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });
    return () => unsubscribe(); // Clean up subscription
  }, []);

  // Handle card click and open modal with details
  const handleCardClick = (card) => {
    setSelectedCard(card);
    onOpen();
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          padding: "10px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>Calmify</div>
        <Heading justify="center" m={5}>
          Mindful Activity
        </Heading>
        <Button onClick={handleBackClick} style={buttonStyle}>
          Back
        </Button>
      </nav>

      <div style={{ textAlign: "center" }}>
        <Stack direction="row" spacing={20} justify="center" align="center" m={20}>
          {/* <h1>dfhg</h1> */}
          {cards.map((card, index) => (
            <Card maxW="sm" key={index}>
              <CardBody onClick={() => handleCardClick(card)}>
                {/* <Image src={card.image} alt={card.title} borderRadius="lg" /> */}
                <Image src={yoga} alt={card.title} borderRadius="lg" />
                <Stack mt="6" spacing="3">
                  <Heading size="md">{card.title}</Heading>
                  <Text>{card.shortInfo}</Text>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>

        {/* Modal to display long info */}
        {selectedCard && (
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent>
              <ModalHeader>{selectedCard.title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <InfoCard>{selectedCard.longInfo}</InfoCard>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default MindfulOption;

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  margin: "10px",
  cursor: "pointer",
};

const InfoCard = styled.div`
  border: 1px solid #ffffff;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
`;
