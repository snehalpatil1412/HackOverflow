// Loader.js
import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define the keyframes for the fading animation
const fade = keyframes`
  0%, 20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
`;

// Styled component for the loader container
const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

// Styled component for each dot
const Dot = styled.div`
  width: 12px;
  height: 12px;
  margin: 0 5px;
  background-color:rgb(79, 80, 80);
  border-radius: 50%;
  animation: ${fade} 1.2s infinite ease-in-out;

  &:nth-child(2) {
    animation-delay: 0.4s;
  }

  &:nth-child(3) {
    animation-delay: 0.8s;
  }
`;

const LoaderComponent = () => {
  return (
    <LoaderContainer>
      <Dot />
      <Dot />
      <Dot />
    </LoaderContainer>
  );
};

export default LoaderComponent;
