import React from 'react';
import styled from 'styled-components';
import exercise from '../../../assets/exercise.jpg';
import { useNavigate } from 'react-router-dom';
import { Heading } from '@chakra-ui/react';

const Exercise = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/exerciseoption');
  };

  return (
    <Section>
      <LeftSection>
        <Img src={exercise} alt="exercise img" />
      </LeftSection>
      <RightSection>
        <Content>
          <Heading as="h2" size="2xl" mb={10} textAlign="center">
            Importance of Exercise
          </Heading>
          Mindfulness exercises help you stay grounded and focused. They reduce
          stress, improve mental clarity, and enhance emotional regulation.
          Incorporating these exercises into your daily routine can lead to a
          healthier, more balanced life.
        </Content>
        <StartButton onClick={handleStart}>
          <span>GET STARTED</span>
          <ArrowIcon
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 28 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h26M20 5l7 7-7 7"
            />
          </ArrowIcon>
        </StartButton>
      </RightSection>
    </Section>
  );
};

export default Exercise;

const Img = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    flex-direction: row;
    height: 100vh; /* Full view height for larger screens */
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: justify;
  // padding-left: 20px;
  flex-direction: column;
`;

const Content = styled.p`
  font-size: 18px; /* Adjust the text size for small screens */
  line-height: 1.7; /* Adjust line spacing */
  max-width: 100%; /* Adjust the maximum width of text */
  text-align: justify;

  @media (min-width: 768px) {
    font-size: 22px; /* Adjust the text size for larger screens */
    max-width: 650px; /* Adjust the maximum width of text */
  }
`;

const StartButton = styled.button`
  background-color: rgb(190, 152, 117);
  color: white;
  padding: 10px 15px;
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  margin-top: 20px;
  gap: 10px;
  width: 165px;
  height: 50px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(235, 190, 148);
  }

  @media (min-width: 768px) {
    padding: 15px 25px;
    font-size: 16px;
    width: 200px;
  }
`;

const ArrowIcon = styled.svg`
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;

  ${StartButton}:hover & {
    transform: translateX(5px);
  }
`;
