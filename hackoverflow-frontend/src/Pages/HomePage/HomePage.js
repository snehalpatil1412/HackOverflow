import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import NavBar from "../Nav.js";
import image1 from "../../assets/slider1.png";
import image2 from "../../assets/slider2.png";
import image3 from "../../assets/slider3.png";
import backgroundImage from "../../assets/Homebg.png";
import FunActivities from "../HomePage/FunActivity/FunActivities.js";
import Yoga from "../HomePage/Yoga/Yoga.js";
import Exercise from "../HomePage/Exercise/Exercise.js";
import Feedback from "./Feedback.js";
import Footer from "../Footer.js";
// import Loader from "./Loader.js"; // Import the Loader component

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [disappearing, setDisappearing] = useState(false);
  const [loading, setLoading] = useState(true);
  const slides = [image1, image2, image3];
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/input");
  };

  useEffect(() => {
    if (loading) {
      const loadTimeout = setTimeout(() => setLoading(false), 3000); // 3 seconds for loading screen
      return () => clearTimeout(loadTimeout); // Clean up timeout on unmount
    }

    const interval = setInterval(() => {
      setDisappearing(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setDisappearing(false);
      }, 1000); // Duration of the disappearing animation
    }, 20000); // 15 seconds visible + 1 second for disappearing animation
    return () => clearInterval(interval);
  }, [loading, slides.length]);

  return (
    <>
      {/* {loading ? (
        < >
      ) : ( */}
        <>
          <link
            href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap"
            rel="stylesheet"
          />
          <NavBar />
          <HomeContainer id="home">
            <Slider>
              <SliderImage className={disappearing ? "disappearing" : "active"}>
                <SliderImageImg
                  src={slides[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                />
              </SliderImage>
            </Slider>
            <HomeText>
              <Heading>Welcome To Calmify!</Heading>
              <Text>Your space to find solutions to emotions.</Text>
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
            </HomeText>
          </HomeContainer>
          <Main id="yoga-practices">
            <Yoga />
          </Main>
          <Main id="fun-activities">
            <FunActivities />
          </Main>
          <Main id="exercises">
            <Exercise />
          </Main>
          <Main id="feedback">
            <Feedback />
          </Main>
          <Footer />
        </>
      {/* )} */}
    </>
  );
}

export default HomePage;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  height: 750px;
  width: 100vw;
  padding: 0 20px;
  margin-top: 110px; /* Adjusted for the navbar height */

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    padding: 0 220px;
  }
`;

const HomeText = styled.div`
  max-width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (min-width: 768px) {
    text-align: left;
    align-items: flex-start;
  }
`;

const Heading = styled.div`
  color: #fff;
  font-size: 40px;
  font-weight: bold;
  font-family: Helvetica;
  text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9,
    0 5px 0 #aaa, 0 0 5px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.2),
    0 20px 20px rgba(0, 0, 0, 0.15);

  @media (min-width: 768px) {
    font-size: 65px;
  }
`;

const Text = styled.div`
  color: black;
  font-size: 16px;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const StartButton = styled.button`
  background-color: rgb(131, 172, 131);
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
    background-color: #a8cc9c;
  }

  @media (min-width: 768px) {
    padding: 15px 25px;
    font-size: 16px;
    width: 200px;
  }
`;

const ArrowIcon = styled.svg`
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;

  ${StartButton}:hover & {
    transform: translateX(5px);
  }
`;

const Slider = styled.div`
  width: 100%;
  height: 300px;
  overflow: hidden;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    position: absolute;
    right: 50px;
    width: 700px;
    height: 620px;
  }
`;

const SliderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: opacity 1s ease-in-out;

  &.disappearing {
    opacity: 0;
  }

  &.active {
    opacity: 1;
  }
`;

const SliderImageImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Main = styled.div`
  font-size: 20px;
  padding: 20px;

  @media (min-width: 768px) {
    font-size: 25px;
  }
`;
