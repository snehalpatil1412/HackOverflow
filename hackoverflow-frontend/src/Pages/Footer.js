import React from 'react';
import styled from 'styled-components';
import { Box, Text} from '@chakra-ui/react';

const FooterContainer = styled(Box)`
  background-color: #2D3748;  /* Dark background */
  color: white;
  padding: 20px;
  text-align: center;
`;

const Footer = () => {
  return (
    <FooterContainer>
      {/* <HStack justify="center" spacing={8}>
        <Link href="#" color="teal.300">
          Home
        </Link>
        <Link href="#" color="teal.300">
          About
        </Link>
        <Link href="#" color="teal.300">
          Contact
        </Link>
      </HStack> */}
      <Text mt={2}> © 2024 Calmify. All rights reserved.</Text>
    </FooterContainer>
  );
};

export default Footer;
