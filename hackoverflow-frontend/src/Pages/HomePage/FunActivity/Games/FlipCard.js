import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useToast,
} from "@chakra-ui/react";
import Confetti from 'react-confetti';

import img1 from "../../../../assets/Flipcard/1.jpg";
import img2 from "../../../../assets/Flipcard/2.jpg";
import img3 from "../../../../assets/Flipcard/3.jpg";
import img4 from "../../../../assets/Flipcard/4.jpg";
import img5 from "../../../../assets/Flipcard/5.jpg";
import img6 from "../../../../assets/Flipcard/6.jpg";
import img7 from "../../../../assets/Flipcard/7.jpg";
import img8 from "../../../../assets/Flipcard/8.jpg";
import Gamebg from "../../../../assets/gamebg.jpg"; // Import the background image

import victorySound from "../../../../assets/victorySound.wav";
// Array of 8 images
const imageUrls = [img1, img2, img3, img4, img5, img6, img7, img8];

const Container = styled.div`
  background-image: url(${Gamebg});
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  padding: 10px;

  display: flex;
  flex-direction: column;
  position: relative;

  @media (max-width: 480px) {
    padding: 20px; /* Remove padding for small screens */
  }
`;

const StyledCardGame = styled.div`
  width: 80px;
  height: 80px;
  margin: 10px;
  perspective: 1000px;
  cursor: pointer;

  @media (min-width: 480px) {
    width: 110px;
    height: 110px;
  }

  @media (min-width: 768px) {
    width: 130px;
    height: 130px;
  }

  @media (min-width: 1024px) {
    width: 150px;
    height: 150px;
  }
`;

const CardInner = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform: ${(props) => (props.flipped ? "rotateY(180deg)" : "none")};
`;

const CardFace = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const GameWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns for small screens */
  grid-template-rows: repeat(5, 1fr); /* 5 rows for small screens */
  justify-content: center;
  padding: 10px;
  gap: 10px;

  @media (min-width: 480px) {
    gap: 15px;
  }

  @media (min-width: 768px) {
    gap: 20px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr); /* 5 columns for large screens */
    grid-template-rows: repeat(3, 1fr); /* 3 rows for large screens */
    gap: 5px; /* 5px gap between cards */
  }
`;

const ConfettiWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
`;

const FlipCard = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [showLeftConfetti, setShowLeftConfetti] = useState(false);
  const [showRightConfetti, setShowRightConfetti] = useState(false);
  const toast = useToast(); // Initialize useToast
  
  // Sound effect refs
  const victorySoundRef = useRef(null);

  // Reset game function
  const resetGame = () => {
    const shuffledCards = [
      ...imageUrls.slice(0, 7), // 7 pairs
      ...imageUrls.slice(0, 7), // Duplicate to make pairs
    ].map((value, index) => ({ value, id: index }));

    // Randomly select one image for the extra card
    const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    shuffledCards.push({ value: randomImage, id: shuffledCards.length });

    // Shuffle cards
    const shuffled = shuffledCards.sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndexes([]);
    setMatchedIndexes([]);
    setShowLeftConfetti(false);
    setShowRightConfetti(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetGame();
    }
  }, [isOpen]);

  useEffect(() => {
    if (matchedIndexes.length === 14) { // 7 pairs so 14 matched cards
      // Show toast notification
      toast({
        title: "Congratulations!",
        description: "You successfully completed the game!",
        status: "success",
        duration: 2500, // Duration in milliseconds
        isClosable: true,
        position: "top", // Position of the toast
      });

      // Play victory sound
      if (victorySoundRef.current) {
        victorySoundRef.current.currentTime = 0;
        victorySoundRef.current.play().catch(error => {
          console.error("Error playing victory sound:", error);
        });
      }
      setShowLeftConfetti(true);
      
      // Show right confetti with a slight delay
      setTimeout(() => {
        setShowRightConfetti(true);
      }, 150);

      // Close modal after the toast
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [matchedIndexes, cards, toast, onClose]);

  const handleCardClick = (index) => {
    if (
      flippedIndexes.length === 2 || // Block interaction when two cards are already flipped
      flippedIndexes.includes(index) || // Block flipping the same card again
      matchedIndexes.includes(index) // Block flipping matched cards
    ) {
      return;
    }

    const newFlippedIndexes = [...flippedIndexes, index];
    setFlippedIndexes(newFlippedIndexes);

    if (newFlippedIndexes.length === 2) {
      const [firstIndex, secondIndex] = newFlippedIndexes;

      if (cards[firstIndex].value === cards[secondIndex].value) {
        setMatchedIndexes((prevMatched) => [...prevMatched, firstIndex, secondIndex]);
        setFlippedIndexes([]); // Reset flippedIndexes
      } else {
        setTimeout(() => {
          setFlippedIndexes([]); // Reset flippedIndexes after a delay
        }, 1000);
      }
    }
  };

  // Helper function to handle confetti complete
  const handleLeftConfettiComplete = () => {
    setShowLeftConfetti(false);
  };
  
  const handleRightConfettiComplete = () => {
    setShowRightConfetti(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetGame();
        onClose();
      }}
      size={{ base: "md", sm: "md", md: "lg", lg: "4xl" }}
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        width={{ base: "90%", sm: "85%", md: "80%", lg: "80%" }}
        height={{ base: "80vh", sm: "85vh", md: "80vh" }}
        maxHeight={{ base: "550px", sm: "600px", md: "700px" }}
      >
        <ModalHeader
          fontSize={{ base: "lg", md: "xl" }}
          paddingY={{ base: 2, md: 4 }}
        >
          Flip Card Memory Game
        </ModalHeader>
        <ModalCloseButton
          size="sm"
          top={{ base: "8px", md: "12px" }}
          right={{ base: "8px", md: "12px" }}
        />
        <ModalBody padding={0} display="flex" flexDirection="column">
          <Container>
            <GameWrapper>
              {cards.map((card, index) => (
                <StyledCardGame key={card.id} onClick={() => handleCardClick(index)}>
                  <CardInner flipped={flippedIndexes.includes(index) || matchedIndexes.includes(index)}>
                    {/* Front Face */}
                    <CardFace className="front">
                      <div style={{ backgroundColor: "gray", width: "100%", height: "100%", borderRadius: "10px" }}></div>
                    </CardFace>
                    {/* Back Face (Image) */}
                    <CardFace className="back" style={{ transform: "rotateY(180deg)" }}>
                      <img
                        src={card.value}
                        alt=""
                        style={{ width: "100%", height: "100%", borderRadius: "10px" }}
                      />
                    </CardFace>
                  </CardInner>
                </StyledCardGame>
              ))}
            </GameWrapper>
          </Container>
          <ConfettiWrapper>
            {/* Left corner confetti */}
            {showLeftConfetti && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={250}
                recycle={false}
                gravity={0.2}
                initialVelocityY={{ min: -20, max: -35 }}
                initialVelocityX={{ min: 5, max: 30 }}
                confettiSource={{
                  x: 0,
                  y: window.innerHeight,
                  w: 10,
                  h: 0
                }}
                colors={[
                  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
                  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
                  '#FF5722'
                ]}
                onConfettiComplete={handleLeftConfettiComplete}
                tweenDuration={100}
                dragFriction={0.12}
              />
            )}
            
            {/* Right corner confetti */}
            {showRightConfetti && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={250}
                recycle={false}
                gravity={0.2}
                initialVelocityY={{ min: -20, max: -35 }}
                initialVelocityX={{ min: -30, max: -5 }}
                confettiSource={{
                  x: window.innerWidth,
                  y: window.innerHeight,
                  w: 10,
                  h: 0
                }}
                colors={[
                  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
                  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
                  '#FF5722'
                ]}
                onConfettiComplete={handleRightConfettiComplete}
                tweenDuration={100}
                dragFriction={0.12}
              />
            )}
          </ConfettiWrapper>
          
          {/* Audio elements for sound effects */}
          <audio
            ref={victorySoundRef}
            src={victorySound}
            preload="auto"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FlipCard;