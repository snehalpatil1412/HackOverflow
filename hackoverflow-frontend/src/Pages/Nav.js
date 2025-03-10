import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import styled, { css }  from 'styled-components';
import { Link } from 'react-scroll';
import CalmifyLogo from "../assets/logocalmify.png";

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/"); // Navigate to the home route
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <StickyContainer isScrolled={isScrolled}>
      <Solgan style={{ display: isScrolled ? 'none' : 'block' }}>
        <h3>Nothing is <b>Impossible</b>!!</h3>
      </Solgan>
      <NavBar>
        <Logo onClick={handleLogoClick}>
          <LogoImg src={CalmifyLogo} alt="Calmify" />
        </Logo>
        <HamburgerButton onClick={toggleNav}>
          <HamburgerIcon isNavOpen={isNavOpen} />
        </HamburgerButton>
        <NavLinks isNavOpen={isNavOpen}>
          <NavLi>
            <StyledLink to="home" smooth={true} duration={500} onClick={() => setIsNavOpen(false)}>HOME</StyledLink>
          </NavLi>
          <NavLi>
            <StyledLink to="yoga-practices" smooth={true} duration={500} onClick={() => setIsNavOpen(false)}>YOGA</StyledLink>
          </NavLi>
          <NavLi>
            <StyledLink to="fun-activities" smooth={true} duration={500} onClick={() => setIsNavOpen(false)}>FUN ACTIVITIES</StyledLink>
          </NavLi>
          <NavLi>
            <StyledLink to="exercises" smooth={true} duration={500} onClick={() => setIsNavOpen(false)}>EXERCISES</StyledLink>
          </NavLi>
          <NavLi>
            <StyledLink to="feedback" smooth={true} duration={500} onClick={() => setIsNavOpen(false)}>FEEDBACK</StyledLink>
          </NavLi>
        </NavLinks>
      </NavBar>
    </StickyContainer>
  );
};

export default Nav;

const StickyContainer = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background-color: ${({ isScrolled }) => (isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgb(255, 255, 255)')};
  transition: background-color 0.3s ease;
  box-shadow: ${({ isScrolled }) => (isScrolled ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none')};
`;

const Solgan = styled.div`
  height: 40px;
  background-color: #a8cc9c;
  text-align: center;
  padding-top: 8px;
  color: white;
`;

const NavBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: transparent; /* Ensure this remains transparent */
  font-family: 'Roboto', sans-serif;
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

const HamburgerButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const HamburgerIcon = styled.div`
  width: 30px;
  height: 3px;
  background: black;
  transition: all 0.3s ease;
  position: relative;

  &::before,
  &::after {
    content: "";
    width: 30px;
    height: 3px;
    background: black;
    position: absolute;
    left: 0;
    transition: all 0.3s ease;
  }

  &::before {
    top: -8px;
  }

  &::after {
    top: 8px;
  }

  ${({ isNavOpen }) =>
    isNavOpen &&
    css`
      background: transparent;

      &::before {
        transform: rotate(45deg) translate(7px, 7px);
      }

      &::after {
        transform: rotate(-45deg) translate(7px, -7px);
      }
    `}
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    position: absolute;
    top: 100%;
    left: 0;
    background-color: white;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: ${({ isNavOpen }) => (isNavOpen ? 'flex' : 'none')};
  }
`;

const NavLi = styled.li`
  text-decoration: none;
  color: #000;
`;

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  cursor: pointer; /* This ensures the pointer appears on hover */

  &:hover {
    color: #a8cc9c; /* Optional: Adds a hover effect */
  }
`;
