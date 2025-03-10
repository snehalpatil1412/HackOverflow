import React from "react";
import styled, { keyframes } from "styled-components";
import logo from "../assets/logo.png";

const slideImageLeft = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-80px);
  }
`;

const slideFromBehind = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: white;
  color: #555;
  font-family: "Roboto", sans-serif;
  font-weight: 300;
  font-size: 32px;
  text-align: center;
  overflow: hidden;
`;

const MainImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${slideImageLeft} 2s ease-in-out forwards; /* Slide image to the left */
  z-index: 1; /* Ensure the logo is above the text */
`;

const MainImage = styled.img`
  width: 250px; /* Adjust width as needed */
  height: auto; /* Maintain aspect ratio */
`;

const SubTextContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 32px; /* Adjust to position the text behind the logo */
  margin-left: 85px;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 0; /* Ensure the text is behind the logo */
`;

const SubText = styled.span`
  font-size: 40px;
  font-weight: 600;
  color: rgba(40, 91, 97, 0.88);
  font-family: "Dancing Script", regular;
  animation: ${slideFromBehind} 2s ease-in-out forwards; /* Runs animation once */
  white-space: nowrap;
`;

const Loader = () => {
  return (
    <LoaderContainer>
      <MainImageContainer>
        <MainImage src={logo} alt="Calmify Demo" />
      </MainImageContainer>
      <SubTextContainer>
        <SubText>Calmify</SubText>
      </SubTextContainer>
    </LoaderContainer>
  );
};

export default Loader;
