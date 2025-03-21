import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Input,
  Box,
  Heading,
  Text,
  Button,
  Container,
  VStack,
  HStack,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { getDatabase, ref, onValue, update, remove, set } from 'firebase/database';

const DrDashboard = () => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isReschedule, setIsReschedule] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please login to access the dashboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/drlogin');
      return;
    }
    
    // Parse user data
    const userData = JSON.parse(currentUser);
    setUser(userData);

    // Fetch doctor's requests from Firebase
    fetchDoctorRequests(userData.id);
  }, [navigate, toast]);

  const fetchDoctorRequests = (doctorId) => {
    setLoading(true);
    const db = getDatabase();
    const requestsRef = ref(db, `doctor/${doctorId}/requests`);

    onValue(requestsRef, (snapshot) => {
      const requestsData = snapshot.val();
      const requestsList = [];
      
      if (requestsData) {
        // Convert object to array with ID
        Object.keys(requestsData).forEach((key) => {
          requestsList.push({
            id: key,
            ...requestsData[key]
          });
        });
        
        // Sort by timestamp (newest first)
        requestsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
      
      setRequests(requestsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      toast({
        title: 'Error fetching requests',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    });
  };

  const handleLogout = () => {
    // Clear user data from session storage
    sessionStorage.removeItem('currentUser');
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Redirect to login page
    navigate('/drlogin');
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleAcceptRequest = async (requestId, userId, isRescheduling = false) => {
    // Set required states for the scheduling modal
    setSelectedUserId(userId);
    setSelectedRequestId(requestId);
    setIsReschedule(isRescheduling);
    
    // Clear previous selections
    setSelectedDate("");
    setSelectedTime("");
    
    // Open the scheduling modal
    setIsScheduleOpen(true);
    
    // Close the detail modal if it's open
    if (isOpen) onClose();
  };

  const handleDeleteRequest = async (requestId, userId) => {
    try {
      const db = getDatabase();
      
      // Remove from doctor's requests
      const doctorRequestRef = ref(db, `doctor/${user.id}/requests/${requestId}`);
      await remove(doctorRequestRef);
      
      // Update status to 'rejected' in user's requests (not deleting to keep history)
      const userRequestRef = ref(db, `users/${userId}/requests/${requestId}`);
      await update(userRequestRef, { status: 'rejected' });
      
      toast({
        title: 'Request deleted',
        description: 'The request has been removed from your list',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Close modal if open
      if (isOpen) onClose();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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

  const scheduleAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select a date and time",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const db = getDatabase();
      const formattedDateTime =  `${selectedDate} ${selectedTime}`;
      
      if (isReschedule) {
        const eventRef = ref(db, `users/${selectedUserId}/events/${selectedRequestId}`);
        await remove(eventRef);
        await set(eventRef, {
          eventName: "Doctor Consultation",
          eventDate: selectedDate,
          eventTime: selectedTime,
          status: "rescheduled",
        });
        await update(ref(db, `users/${selectedUserId}/requests/${selectedRequestId}`), {
          meetingTime: formattedDateTime,
        });
        await update(ref(db, `doctor/${user.id}/requests/${selectedRequestId}`), {
          meetingTime: formattedDateTime,
        });
        toast({
          title: "Meeting Rescheduled",
          description: "New date and time have been updated.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await set(ref(db, `users/${selectedUserId}/events/${selectedRequestId}`), {
          eventName: "Doctor Consultation",
          eventDate: selectedDate,
          eventTime: selectedTime,
          status: "scheduled",
        });
        await update(ref(db, `users/${selectedUserId}/requests/${selectedRequestId}`), {
          status: "accepted",
          meetingTime: formattedDateTime,
        });
        await update(ref(db, `doctor/${user.id}/requests/${selectedRequestId}`), {
          status: "accepted",
          meetingTime: formattedDateTime,
        });
        toast({
          title: "Appointment Scheduled",
          description: "Meeting has been added to the user's calendar",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      setIsScheduleOpen(false);
    } catch (error) {
      console.error("Error scheduling appointment:", error);
    }
  };

  if (!user) return null;

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Box bg="blue.50" p={6} borderRadius="md" boxShadow="md">
          <Heading size="lg" mb={2}>
            Hello, Dr. {user.name}!
          </Heading>
          <Text>Welcome to your dashboard</Text>
        </Box>
        
        <Box bg="white" p={6} borderRadius="md" boxShadow="md">
          <Heading size="md" mb={4}>Doctor Information</Heading>
          <Divider mb={4} />
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Text fontWeight="bold" minW="120px">Name:</Text>
              <Text>Dr. {user.name}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" minW="120px">Email:</Text>
              <Text>{user.email}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" minW="120px">Specialization:</Text>
              <Text>{user.specialization || "Not specified"}</Text>
            </HStack>
          </VStack>
        </Box>
        
        <Box bg="white" p={6} borderRadius="md" boxShadow="md">
          <Heading size="md" mb={4}>Patient Requests</Heading>
          <Divider mb={4} />
          
          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : requests.length === 0 ? (
            <Text textAlign="center" py={10} color="gray.500">
              No patient requests found
            </Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Patient</Th>
                    <Th>Subject</Th>
                    <Th>Date</Th>
                    <Th>Stress Count</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requests.map((request) => (
                    <Tr key={request.id}>
                      <Td>{request.userName}</Td>
                      <Td noOfLines={1} maxW="200px">
                        {request.subject}
                      </Td>
                      <Td>{formatDate(request.timestamp)}</Td>
                      <Td isNumeric>
                        {request.stressCount}
                        {request.stressCount > 5 && 
                          <Badge ml={2} colorScheme="red">High</Badge>
                        }
                      </Td>
                      <Td>{getStatusBadge(request.status)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            colorScheme="blue"
                            onClick={() => handleViewRequest(request)}
                          >
                            View
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                size="xs" 
                                colorScheme="green"
                                onClick={() => handleAcceptRequest(request.id, request.userId)}
                              >
                                Accept
                              </Button>
                              <Button 
                                size="xs" 
                                colorScheme="red"
                                onClick={() => handleDeleteRequest(request.id, request.userId)}
                              >
                                Decline
                              </Button>
                            </>
                          )}

                          {request.status === 'accepted' && (
                            <>
                              <Button 
                                size="xs" 
                                colorScheme="orange"
                                onClick={() => handleAcceptRequest(request.id, request.userId, true)}
                              >
                                Reschedule
                              </Button>
                            </>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
        
        <Box textAlign="center" pt={4}>
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </VStack>

      {/* Request Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Patient Request
            <Text fontSize="sm" fontWeight="normal" mt={1}>
              {selectedRequest && formatDate(selectedRequest.timestamp)}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            {selectedRequest && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Status:</Text>
                  {getStatusBadge(selectedRequest.status)}
                </Box>
                
                <Box>
                  <Text fontWeight="bold">From:</Text>
                  <Text>{selectedRequest.userName} ({selectedRequest.userEmail})</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Stress Count:</Text>
                  <Text>{selectedRequest.stressCount} times</Text>
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
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            {selectedRequest && selectedRequest.status === 'pending' && (
              <>
                <Button 
                  colorScheme="green" 
                  mr={3}
                  onClick={() => handleAcceptRequest(selectedRequest.id, selectedRequest.userId)}
                >
                  Accept Request
                </Button>
                <Button 
                  colorScheme="red"
                  onClick={() => handleDeleteRequest(selectedRequest.id, selectedRequest.userId)}
                >
                  Decline Request
                </Button>
              </>
            )}
            {selectedRequest && selectedRequest.status === 'accepted' && (
              <>
                <Button 
                  colorScheme="orange" 
                  mr={3}
                  onClick={() => handleAcceptRequest(selectedRequest.id, selectedRequest.userId, true)}
                >
                  Reschedule
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={onClose}
                >
                  Close
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Schedule Modal */}
      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isReschedule ? 'Reschedule Video Consultation' : 'Schedule Video Consultation'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={scheduleAppointment}>
              Confirm & {isReschedule ? 'Reschedule' : 'Schedule'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DrDashboard;