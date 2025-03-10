import React from "react";
import { Heading, Text, Stack } from "@chakra-ui/react";
import styled from "styled-components";

// import consult from "../../../assets/consultdr.jpeg";

const ConsultDr = () => {
  return (
    <>
      {/* <Section>
        <LeftSection>
          <Img src={consult} alt="img" />
        </LeftSection> */}

        {/* <RightSection> */}
          <Stack>
            <Heading mb={109} as="h2" size="xl">
              Consult a Doctor
            </Heading>
            <TextArea placeholder="Write about your concern!"></TextArea>
            <SubmitButton>
              <Text align="center" >Send</Text>
            </SubmitButton>
          </Stack>
        {/* </RightSection>
      </Section> */}
    </>
  );
};

export default ConsultDr;

const TextArea = styled.textarea`
  width: 600px;
  height: 300px;
  padding: 10px;
  border-radius: 10px;
  border: 2px solid rgb(188, 245, 236);
  font-size: 22px;
  color: #000000;
  outline: none;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  resize: none;
`;

// const Img = styled.img`
//   width: 80%;
//   height: 80%;
//   object-fit: cover;
// `;

// const Section = styled.div`
//   display: flex;
//   height: 100vh;
//   padding: 20px;
//   box-sizing: border-box;
// `;

// const LeftSection = styled.div`
//   flex: 1;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const RightSection = styled.div`
//   flex: 1;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-direction: column;
// `;

const SubmitButton = styled.button`
  background-color: rgb(168, 213, 255);
  color: white;
  margin-left: 200px;
  padding: 15px 25px;
  font-size: 16px;
  font-family: "Roboto", sans-serif;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  margin-top: 20px;
  gap: 10px;
  width: 200px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #eaf4fe;
  }
`;
