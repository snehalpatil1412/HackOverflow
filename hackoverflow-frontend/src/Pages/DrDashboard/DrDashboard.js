import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import Peer from 'peerjs';
import io from 'socket.io-client';
import {
  Box,
  Heading,
  Text,
  Input,
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
import { getDatabase, set, ref, onValue, update, remove } from 'firebase/database';

const socket = io('https://socketio-chat-h9jt.herokuapp.com/');

const Video = ({ stream }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{ width: '300px', height: '200px', margin: '10px' }}
    />
  );
};

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
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerId, setPeerId] = useState('');
  const peerInstance = useRef(null);
  const [activeCallRequestId, setActiveCallRequestId] = useState(null);

  useEffect(() => {
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
    
    const userData = JSON.parse(currentUser);
    setUser(userData);

    const peer = new Peer({
      host: 'peerjs-server.herokuapp.com',
      secure: true,
      port: 443,
    });

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peerInstance.current = peer;

    fetchDoctorRequests(userData.id);

    return () => {
      peer.destroy();
      if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigate, toast]);

  const fetchDoctorRequests = (doctorId) => {
    setLoading(true);
    const db = getDatabase();
    const requestsRef = ref(db, `doctor/${doctorId}/requests`);

    onValue(requestsRef, (snapshot) => {
      const requestsData = snapshot.val();
      const requestsList = [];
      
      if (requestsData) {
        Object.keys(requestsData).forEach((key) => {
          requestsList.push({
            id: key,
            ...requestsData[key]
          });
        });
        requestsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
      
      setRequests(requestsList);
      setLoading(false);
    });
  };

  const startMeet = async (requestId, userId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
      setActiveCallRequestId(requestId);

      socket.emit('meetingStarted', { peerId, requestId, userId });

      peerInstance.current.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
        });
      });

      toast({
        title: 'Meeting Started',
        description: 'Waiting for patient to join',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error starting meeting:', err);
      toast({
        title: 'Error',
        description: 'Failed to start meeting',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const endMeet = () => {
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }
    setMyStream(null);
    setRemoteStream(null);
    setActiveCallRequestId(null);
    socket.emit('meetingEnded', { peerId });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    endMeet();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
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

  const handleAcceptRequest = async (requestId, userId, isReschedule = false) => {
    try {
      const db = getDatabase();
      setSelectedUserId(userId);
      setSelectedRequestId(requestId);
      setIsScheduleOpen(true);
      setIsReschedule(isReschedule);
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteRequest = async (requestId, userId) => {
    try {
      const db = getDatabase();
      const doctorRequestRef = ref(db, `doctor/${user.id}/requests/${requestId}`);
      await remove(doctorRequestRef);
      const userRequestRef = ref(db, `users/${userId}/requests/${requestId}`);
      await update(userRequestRef, { status: 'rejected' });
      
      toast({
        title: 'Request deleted',
        description: 'The request has been removed from your list',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      if (isOpen) onClose();
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <Badge colorScheme="yellow">Pending</Badge>;
      case 'accepted': return <Badge colorScheme="green">Accepted</Badge>;
      case 'rejected': return <Badge colorScheme="red">Rejected</Badge>;
      default: return <Badge colorScheme="gray">{status}</Badge>;
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
      const formattedDateTime = `${selectedDate} ${selectedTime}`;
      
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
          {peerId && <Text>Your Peer ID: {peerId}</Text>}
        </Box>

        {(myStream || remoteStream) && (
          <Box bg="white" p={6} borderRadius="md" boxShadow="md">
            <Heading size="md" mb={4}>Active Video Consultation</Heading>
            <HStack>
              {myStream && <Video stream={myStream} />}
              {remoteStream && <Video stream={remoteStream} />}
            </HStack>
            <Button colorScheme="red" mt={4} onClick={endMeet}>
              End Meeting
            </Button>
          </Box>
        )}

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
                    <Th>Meeting Time</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requests.map((request) => (
                    <Tr key={request.id}>
                      <Td>{request.userName}</Td>
                      <Td noOfLines={1} maxW="200px">{request.subject}</Td>
                      <Td>{formatDate(request.timestamp)}</Td>
                      <Td isNumeric>
                        {request.stressCount}
                        {request.stressCount > 5 && <Badge ml={2} colorScheme="red">High</Badge>}
                      </Td>
                      <Td>{getStatusBadge(request.status)}</Td>
                      <Td>{request.meetingTime || '-'}</Td>
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
                              <Button
                                size="xs"
                                colorScheme="purple"
                                onClick={() => startMeet(request.id, request.userId)}
                                isDisabled={myStream && activeCallRequestId !== request.id}
                              >
                                Start Meet
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
                {selectedRequest.meetingTime && (
                  <Box>
                    <Text fontWeight="bold">Scheduled Time:</Text>
                    <Text>{selectedRequest.meetingTime}</Text>
                  </Box>
                )}
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
              <Button 
                colorScheme="purple" 
                mr={3}
                onClick={() => startMeet(selectedRequest.id, selectedRequest.userId)}
                isDisabled={myStream && activeCallRequestId !== selectedRequest.id}
              >
                Start Meet
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule Video Consultation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                type="date"
                value={selectedDate}
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
              Confirm & Schedule
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DrDashboard;