//AlertDr
import React, { useState, useEffect } from "react";
import {
  Heading,
  Text,
  Stack,
  Card,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Badge,
  Flex,
  Box,
  Container,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  ModalFooter,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
} from "@chakra-ui/react";
import styled from "styled-components";
import { auth } from "../../../firebaseConfig";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { useNavigate } from "react-router-dom";
import CalmifyLogo from "../../../assets/logocalmify.png";

const doctorsData = [
  {
    id: 1,
    name: "Dr. Snehal",
    specialization: "Cardiologist",
    info: "Dr. Snehal is a renowned cardiologist with over 20 years of experience specializing in heart health and cardiovascular diseases.",
    email: "snehal@gmail.com",
    contact: "123-456-7890",
    address: "123 Main St, Anytown, USA",
    color: "red.400",
    availability: "MON-FRI: 9AM-5PM",
  },
  {
    id: 2,
    name: "Dr. Sakshi",
    specialization: "Dermatologist",
    info: "Dr. Sakshi is a skilled dermatologist with a focus on skin health and cosmetic procedures.",
    email: "sakshi@gmail.com",
    contact: "987-654-3210",
    address: "456 Elm St, Anytown, USA",
    color: "green.400",
    availability: "TUE-SAT: 10AM-6PM",
  },
  {
    id: 3,
    name: "Dr. Aryan",
    specialization: "Psychiatrist",
    info: "Dr. Aryan specializes in mental health counseling with expertise in anxiety, depression, and stress management.",
    email: "aryan@gmail.com",
    contact: "555-123-4567",
    address: "789 Oak St, Anytown, USA",
    color: "purple.400",
    availability: "MON-THU: 8AM-7PM",
  },
];

const getDoctorData = (doctorId) => {
  return doctorsData.find((doctor) => doctor.id === doctorId);
};

// Function to find doctor ID by email in Firebase
const findDoctorIdByEmail = async (email) => {
  const db = getDatabase();
  const doctorRef = ref(db, 'doctor');
  const snapshot = await onValue(doctorRef);
  
  if (snapshot.exists()) {
    const doctors = snapshot.val();
    for (const key in doctors) {
      if (doctors[key].email === email) {
        return key;
      }
    }
  }
  
  return null;
};

const AlertDr = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [stressCount, setStressCount] = useState(null);
  const [mailSent, setMailSent] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [userName, setUserName] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // Save the current user ID for later use
        setCurrentUserId(currentUser.uid);
        setCurrentUserEmail(currentUser.email);

        // Fetch user details from Realtime Database
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.uid}`);

        onValue(
          userRef,
          (snapshot) => {
            const userData = snapshot.val();

            if (userData) {
              const firstName = userData.firstName || "";
              const lastName = userData.lastName || "";

              const fullName =
                firstName && lastName
                  ? `${firstName} ${lastName}`
                  : currentUser.displayName ||
                    currentUser.email?.split("@")[0] ||
                    "Calmify User";

              setUserName({
                firstName,
                lastName,
                fullName,
              });
            }
          },
          (error) => {
            console.error("Error fetching user profile:", error);
            // Fallback to display name or email
            const displayName =
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "Calmify User";
            setUserName({
              firstName: "",
              lastName: "",
              fullName: displayName,
            });
          }
        );

        fetchStressCount(currentUser.uid);
        fetchUserRequests(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserRequests = (userId) => {
    setLoadingRequests(true);
    const db = getDatabase();
    const requestsRef = ref(db, `users/${userId}/requests`);

    onValue(
      requestsRef,
      (snapshot) => {
        const data = snapshot.val();
        const requestsList = [];
        
        if (data) {
          // Convert object to array and add ID
          Object.keys(data).forEach((key) => {
            requestsList.push({
              id: key,
              ...data[key]
            });
          });
          
          // Sort by timestamp (newest first)
          requestsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        
        setUserRequests(requestsList);
        setLoadingRequests(false);
      },
      (error) => {
        console.error("Error fetching user requests:", error);
        setLoadingRequests(false);
        toast({
          title: "Error",
          description: "Failed to load your request history",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    );
  };

  const fetchStressCount = (userId) => {
    const db = getDatabase();
    const stressCountRef = ref(db, `users/${userId}/input/stress_count/count`);

    onValue(
      stressCountRef,
      (snapshot) => {
        const data = snapshot.val();
        if (typeof data === "number") {
          setStressCount(data);
        } else if (data) {
          setStressCount(data);
        } else {
          setStressCount(0);
        }
      },
      (err) => {
        console.error("Firebase error:", err);
      }
    );
  };

  const resetStressCount = async (userId) => {
    try {
      const db = getDatabase();
      const stressCountRef = ref(
        db,
        `users/${userId}/input/stress_count/count`
      );

      await set(stressCountRef, 0);
      setStressCount(0);
      setMailSent(true);

      toast({
        title: "Email sent successfully!",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      setTimeout(() => {
        navigate("/input");
      }, 4000);
    } catch (err) {
      console.error("Error resetting stress count:", err);

      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleViewInfo = (doctorId) => {
    const doctor = getDoctorData(doctorId);
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleMailDr = (doctorId) => {
    const doctor = getDoctorData(doctorId);
    setDoctorEmail(doctor.email);
    setSubject(
      `Stress Management Consultation Request - Detected as stressed ${stressCount} times in recent days`
    );
    setMessage(
      `Dear ${doctor.name},\n\nI would like to request a consultation regarding my mental health and stress management. My recent stress levels have been concerning, as I have been detected as stressed ${stressCount} times in the past few days. I believe I could benefit from your professional guidance.\n\nPlease let me know your available dates and times for an appointment.\n\nThank you,\n${userName.fullName}`
    );
    document
      .getElementById("email-form")
      .scrollIntoView({ behavior: "smooth" });
  };

  // Function to save request to Firebase
  const saveRequestToFirebase = async (doctorEmail, subject, message) => {
    try {
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      const db = getDatabase();
      const timestamp = new Date().toISOString();
      const status = "pending"; // Initial status

      // Find doctor ID by email
      const doctorRef = ref(db, 'doctor');
      let doctorId = null;
      
      await new Promise((resolve) => {
        onValue(doctorRef, (snapshot) => {
          if (snapshot.exists()) {
            const doctors = snapshot.val();
            for (const key in doctors) {
              if (doctors[key].email === doctorEmail) {
                doctorId = key;
                break;
              }
            }
          }
          resolve();
        }, { onlyOnce: true });
      });

      if (!doctorId) {
        throw new Error("Doctor not found in database");
      }

      // Create request data
      const requestData = {
        subject,
        message,
        timestamp,
        status,
        userEmail: currentUserEmail,
        userName: userName.fullName,
        doctorEmail,
        stressCount: stressCount || 0
      };

      // Save to user's requests
      const userRequestRef = ref(db, `users/${currentUserId}/requests`);
      const newUserRequestRef = push(userRequestRef);
      const requestId = newUserRequestRef.key;
      
      await set(newUserRequestRef, {
        ...requestData,
        doctorId
      });

      // Save to doctor's requests with the same ID
      const doctorRequestRef = ref(db, `doctor/${doctorId}/requests/${requestId}`);
      await set(doctorRequestRef, {
        ...requestData,
        userId: currentUserId
      });

      return true;
    } catch (error) {
      console.error("Error saving request to Firebase:", error);
      throw error;
    }
  };

  const handleSendMail = async () => {
    if (!doctorEmail || !subject || !message) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
  
    try {
      // Save request to Firebase
      await saveRequestToFirebase(doctorEmail, subject, message);
  
      // Show success toast
      toast({
        title: "Email Sent",
        description: "Your email request has been sent successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
  
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send email: ${error.message}`,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleBack = () => {
    navigate("/input");
  };

  const resetForm = () => {
    setDoctorEmail("");
    setSubject("");
    setMessage("");
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge colorScheme="yellow">Pending</Badge>;
      case 'accepted':
        return <Badge colorScheme="green">Accepted</Badge>;
      case 'rejected':
        return <Badge colorScheme="red">Rejected</Badge>;
      default:
        return <Badge colorScheme="gray">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setRequestModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <Container maxW="100%" p={0}>
      <StyledNav>
        <Logo>
          <LogoImg onClick={handleBack} src={CalmifyLogo} alt="Calmify" />
        </Logo>
      </StyledNav>
      <MainContainer>
        <LeftColumn>
          <Mailtemp id="email-form">
            <Heading as="h2" size="lg" mb={4}>
              Request Appointment
            </Heading>
            <EmailForm>
              <FormField>
                <Label htmlFor="doctor-email">Doctor's Email</Label>
                <DrMailid
                  id="doctor-email"
                  placeholder="Select a doctor first"
                  value={doctorEmail}
                  readOnly
                />
              </FormField>

              <FormField>
                <Label htmlFor="subject">Subject</Label>
                <Subject
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </FormField>

              <FormField>
                <Label htmlFor="message">Message</Label>
                <TextArea
                  id="message"
                  placeholder="Explain your concerns and request appointment or any doubt related to your mental health..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </FormField>

              <SubmitButton
                onClick={handleSendMail}
                disabled={mailSent || !doctorEmail}
              >
                {mailSent ? "Email Sent ✓" : "Send Email"}
              </SubmitButton>
            </EmailForm>
          </Mailtemp>

          {/* Request History Section */}
          <RequestHistorySection>
            <Heading as="h2" size="lg" mb={4}>
              Your Request History
            </Heading>
            {loadingRequests ? (
              <Flex justify="center" py={10}>
                <Spinner size="xl" />
              </Flex>
            ) : userRequests.length === 0 ? (
              <Text textAlign="center" py={10} color="gray.500">
                No appointment requests found
              </Text>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Doctor</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {userRequests.map((request) => (
                      <Tr key={request.id}>
                        <Td>{request.doctorEmail}</Td>
                        <Td>{formatDate(request.timestamp)}</Td>
                        <Td>{getStatusBadge(request.status)}</Td>
                        <Td>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() => handleViewRequest(request)}
                          >
                            View
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </RequestHistorySection>
        </LeftColumn>

        <DoctorListContainer>
          <ResponsiveStack spacing={4}>
            {doctorsData.map((doctor) => (
              <DoctorCard key={doctor.id}>
                <Flex p={4}>
                  <Box flex="1">
                    <ResponsiveFlex justify="space-between" align="center">
                      <Heading size="md">{doctor.name}</Heading>
                      <Badge colorScheme="blue" mt={{ base: 2, md: 0 }}>
                        <strong>Available - </strong> {doctor.availability}
                      </Badge>
                    </ResponsiveFlex>
                    <Text noOfLines={2} mt={1} mb={2} fontSize="sm">
                      {doctor.info}
                    </Text>
                    <ResponsiveFlex
                      mt={3}
                      justify="space-between"
                      align="center"
                    >
                      <ResponsiveButtonContainer>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          mr={{ base: 0, md: 2 }}
                          mb={{ base: 2, md: 0 }}
                          width={{ base: "100%", md: "auto" }}
                          onClick={() => handleViewInfo(doctor.id)}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          width={{ base: "100%", md: "auto" }}
                          onClick={() => handleMailDr(doctor.id)}
                          disabled={mailSent}
                        >
                          Request Appointment
                        </Button>
                      </ResponsiveButtonContainer>
                    </ResponsiveFlex>
                  </Box>
                </Flex>
              </DoctorCard>
            ))}
          </ResponsiveStack>
        </DoctorListContainer>
      </MainContainer>

      {/* Doctor Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center">
              <Box>
                {selectedDoctor?.name}
                <Badge ml={12} colorScheme="blue">
                  <strong>Available - </strong> {selectedDoctor?.availability}
                </Badge>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={3}>
              <Text>{selectedDoctor?.info}</Text>
              <Divider />
              <Text>
                <strong>Email:</strong> {selectedDoctor?.email}
              </Text>
              <Text>
                <strong>Contact:</strong> {selectedDoctor?.contact}
              </Text>
              <Text>
                <strong>Address:</strong> {selectedDoctor?.address}
              </Text>
              <Box mt={4}>
                <Button
                  colorScheme="green"
                  w="full"
                  onClick={() => {
                    handleMailDr(selectedDoctor.id);
                    handleCloseModal();
                  }}
                >
                  Request Appointment
                </Button>
              </Box>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Request Detail Modal */}
      <Modal isOpen={requestModalOpen} onClose={handleCloseRequestModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Request Details
            <Text fontSize="sm" fontWeight="normal" mt={1}>
              {selectedRequest && formatDate(selectedRequest.timestamp)}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            {selectedRequest && (
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Text fontWeight="bold">Status:</Text>
                  <Box>{getStatusBadge(selectedRequest.status)}</Box>
                </HStack>
                
                <Box>
                  <Text fontWeight="bold">To:</Text>
                  <Text>{selectedRequest.doctorEmail}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Subject:</Text>
                  <Text>{selectedRequest.subject}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Message:</Text>
                  <Box p={3} bg="gray.50" borderRadius="md" whiteSpace="pre-wrap">
                    {selectedRequest.message}
                  </Box>
                </Box>

                {selectedRequest.status === 'accepted' && (
                  <Box p={3} bg="green.50" borderRadius="md">
                    <Text fontWeight="bold" color="green.700">
                      Your appointment request has been accepted!
                    </Text>
                    <Text color="green.700" mt={2}>
                      Please check your email for further communication from the doctor regarding appointment details.
                    </Text>
                  </Box>
                )}

                {selectedRequest.status === 'rejected' && (
                  <Box p={3} bg="red.50" borderRadius="md">
                    <Text fontWeight="bold" color="red.700">
                      Your appointment request was declined.
                    </Text>
                    <Text color="red.700" mt={2}>
                      You can try requesting an appointment with another doctor or at a different time.
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCloseRequestModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

const StyledNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  font-family: Arial, sans-serif;
  font-size: 24px;
  font-weight: bold;

  @media (max-width: 768px) {
    justify-content: space-between;
    flex-direction: row;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const LogoImg = styled.img`
  height: 40px;
  cursor: pointer;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

// New styled component for the left column (containing both the email form and request history)
const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  @media (min-width: 1024px) {
    width: 450px;
  }
`;

const Mailtemp = styled.div`
  width: 100%;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  border-radius: 8px;
`;

// New styled component for the request history section
const RequestHistorySection = styled.div`
  width: 100%;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  border-radius: 8px;
`;

const DoctorListContainer = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  max-height: calc(100vh - 120px);

  @media (min-width: 1024px) {
    max-height: calc(100vh - 200px);
    margin-left: 40px;
    padding-right: 20px;
  }
`;

const DoctorCard = styled(Card)`
  transition: all 0.2s ease-in-out;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    /* More compact layout for small screens */
    padding: 12px;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const ResponsiveStack = styled(Stack)`
  @media (max-width: 640px) {
    /* Adjust spacing for smaller screens */
    gap: 12px;
  }
`;

const ResponsiveFlex = styled(Flex)`
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ResponsiveButtonContainer = styled(Box)`
  @media (max-width: 640px) {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
    margin-top: 12px;
  }
`;

const EmailForm = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4a5568;
`;

const DrMailid = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  color: #2d3748;
  outline: none;
  background-color: #f8f9fa;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #63b3ed;
    box-shadow: 0 0 0 1px #63b3ed;
  }
`;

const Subject = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  color: #2d3748;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #63b3ed;
    box-shadow: 0 0 0 1px #63b3ed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  color: #2d3748;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #63b3ed;
    box-shadow: 0 0 0 1px #63b3ed;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: #c5e7f5; /* Light Blue */
  color: white;
  font-weight: 600;
  padding: 12px 16px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;

  &:hover:not(:disabled) {
    background-color: rgb(148, 213, 233);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

export default AlertDr;