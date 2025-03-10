import React from 'react';
import styled from 'styled-components';
import { Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import exercise from '../../../assets/funActivities.jpg';

const FunActivities = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/funactivitiesoption');
  };

  return (
    <Section>
      <RightSection>
        <Img src={exercise} alt="fun activities img" />
      </RightSection>
      <LeftSection>
        <Content>
          <Heading as="h2" size="2xl" mb={10} textAlign="center">
            Fun Activities
          </Heading>
          Engaging in fun activities like music and games is a delightful way to reduce stress and uplift your mood. Listening to soothing tunes or playing an instrument calms the mind, while games like puzzles or board games boost focus and creativity.
          <br />
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
      </LeftSection>
    </Section>
  );
};

export default FunActivities;

const Img = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: justify;
  height: auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    flex-direction: row;
    height: 100vh; /* Full view height for larger screens */
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  // padding: 20px;
`;

const Content = styled.div`
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
  background-color: rgba(134, 115, 209, 0.69);
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
    background-color: rgba(151, 126, 249, 0.69);
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
