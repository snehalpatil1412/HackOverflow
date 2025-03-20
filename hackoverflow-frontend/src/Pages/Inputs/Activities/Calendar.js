import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getDatabase, ref, set, onValue, remove } from 'firebase/database';
import { auth } from '../../../firebaseConfig';  // Firebase config import
import Delete from "../../../assets/trash.png";
import { ToastContainer, toast } from 'react-toastify';
import {useToast} from '@chakra-ui/react';
// Helper function to get random event colors similar to the image
function getRandomEventColor(hover = false) {
  const colors = [
    '#6ed5cb', // teal
    '#ff9f9f', // pink
    '#ffd966', // yellow
    '#b693d1', // purple
    '#6fa8dc', // blue
  ];
  
  const index = Math.floor(Math.random() * colors.length);
  return hover ? colors[index] + 'dd' : colors[index];
}

// Simplified service worker registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  return null;
};

// Simplified notification permission request
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return "denied";
  }
  
  if (Notification.permission === "granted") {
    return "granted";
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
};

const Calendar = () => {
  const [clickedDate, setClickedDate] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ date: '', time: '', title: '' });
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [swRegistration, setSwRegistration] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const initialize = async () => {
      try {
        // First, request notification permission
        const permission = await requestNotificationPermission();
        console.log("Notification permission status:", permission);
        
        // Initialize IndexedDB
        const db = await initializeIndexedDB();
        console.log('IndexedDB initialized');
        
        // Register service worker for notifications
        const registration = await registerServiceWorker();
        setSwRegistration(registration);
        console.log('Service worker registered');
        
        // Fetch events from Firebase
        fetchEvents();
        
        // Set up check for upcoming events
        const intervalId = setInterval(checkUpcomingEvents, 60000); // Check every minute
        
        return () => clearInterval(intervalId);
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
    
    initialize();
  }, []);

  // Function to initialize the IndexedDB
  const initializeIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('calendarEvents', 2);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  };

  // Store events in IndexedDB for offline access
  const storeEventsInIndexedDB = async (events) => {
    try {
      const db = await initializeIndexedDB();
      
      const transaction = db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      
      // Clear existing events
      store.clear();
      
      // Add all events
      events.forEach(event => {
        store.add(event);
      });
    } catch (error) {
      console.error('Error storing events in IndexedDB:', error);
    }
  };

  // Store scheduled notification in IndexedDB
  const storeScheduledNotificationInIndexedDB = async (event, scheduledTime) => {
    try {
      const db = await initializeIndexedDB();
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      
      const notification = {
        id: `notification-${event.id}`,
        eventId: event.id,
        eventName: event.eventName,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        scheduledFor: scheduledTime
      };
      
      store.put(notification);
    } catch (error) {
      console.error('Error storing notification in IndexedDB:', error);
    }
  };

  // Function to fetch events from Firebase
  const fetchEvents = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const db = getDatabase();
    const eventsRef = ref(db, `users/${userId}/events`);

    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loadedEvents = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));
      setEvents(loadedEvents);
      
      // Store the fetched events in IndexedDB for offline access
      storeEventsInIndexedDB(loadedEvents);
      
      // Schedule notifications for all events
      loadedEvents.forEach(event => {
        scheduleNotification(event);
      });
    });
  };

  // Schedule a notification for an event
  const scheduleNotification = async (event) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }
    
    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }
    
    try {
      // Parse the event date and time
      const eventDate = event.eventDate;
      const eventTime = event.eventTime;
      
      // Create a Date object for the event time
      const [hours, minutes] = eventTime.split(':');
      const eventDateTime = new Date(eventDate);
      eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
      
      // Calculate time for notification (2 minutes before event)
      const notificationTime = new Date(eventDateTime);
      notificationTime.setMinutes(notificationTime.getMinutes() - 2);
      
      // Get the current time
      const now = new Date();
      
      // If notification time is in the future, schedule it
      if (notificationTime > now) {
        const timeUntilNotification = notificationTime.getTime() - now.getTime();
        
        // Schedule using setTimeout
        setTimeout(() => {
          showNativeNotification(event);
        }, timeUntilNotification);
        
        // Store the notification in IndexedDB
        storeScheduledNotificationInIndexedDB(event, notificationTime.getTime());
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Function to check for upcoming events
  const checkUpcomingEvents = () => {
    // Check for upcoming events in the next hour
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    events.forEach(event => {
      try {
        // Parse the event date and time
        const [year, month, day] = event.eventDate.split('-').map(Number);
        const [hours, minutes] = event.eventTime.split(':').map(Number);
        
        const eventDateTime = new Date(year, month - 1, day, hours, minutes);
        const notificationTime = new Date(eventDateTime);
        notificationTime.setMinutes(notificationTime.getMinutes() - 2);
        
        // If the event is coming up in the next hour but notification hasn't been shown yet
        if (notificationTime > now && notificationTime < oneHourFromNow) {
          const notificationId = `${event.id}-${event.eventDate}-${event.eventTime}`;
          
          if (!notifications.includes(notificationId)) {
            // Schedule the notification
            const timeUntilNotification = notificationTime.getTime() - now.getTime();
            setTimeout(() => {
              showNativeNotification(event);
            }, timeUntilNotification);
            
            // Add to tracked notifications
            setNotifications(prev => [...prev, notificationId]);
          }
        }
      } catch (error) {
        console.error('Error processing event for notification:', error);
      }
    });
  };

  // Function to show native notification
  const showNativeNotification = (event) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      showToastNotification(event);
      return;
    }
    
    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted");
      showToastNotification(event);
      return;
    }
    
    try {
      const options = {
        body: `Your event "${event.eventName}" is starting in 2 minutes`,
        icon: "/logo192.png",
        requireInteraction: true
      };
      
      // Try to show notification using the service worker
      if (swRegistration) {
        swRegistration.showNotification("Calmify Event Reminder", options);
      } else {
        // Fall back to regular Notification API
        new Notification("Calmify Event Reminder", options);
      }
    } catch (error) {
      console.error("Error showing notification:", error);
      showToastNotification(event);
    }
  };

  // Function to show toast notification as fallback
  const showToastNotification = (event) => {
    toast.info(`Reminder: "${event.eventName}" at ${event.eventTime}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Helper function to format date
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addEvent = () => {
    const userId = auth.currentUser?.uid;
  
    if (!userId || !newEvent.date || !newEvent.time || !newEvent.title) return;
  
    const db = getDatabase();
    const eventId = Date.now();
    const eventRef = ref(db, `users/${userId}/events/${eventId}`);
  
    const eventData = {
      eventName: newEvent.title,
      eventDate: newEvent.date,
      eventTime: newEvent.time
    };
  
    set(eventRef, eventData).then(() => {
      setNewEvent({ date: '', time: '', title: '' });
      setShowModal(false);
      
      // Schedule notification for the new event
      scheduleNotification({
        id: eventId.toString(),
        ...eventData
      });
      
      fetchEvents();
    });
  };

  const removeEvent = async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
  
    const db = getDatabase();
  
    try {
      // Remove event from Firebase for user
      const eventRef = ref(db, `users/${userId}/events/${id}`);
      await remove(eventRef);
  
      // Fetch doctor ID from request data before deleting
      const requestRef = ref(db, `users/${userId}/requests/${id}`);
      onValue(requestRef, async (snapshot) => {
        const requestData = snapshot.val();
        if (requestData && requestData.doctorId) {
          const doctorId = requestData.doctorId;
  
          // Remove the request from doctor's dashboard
          const doctorRequestRef = ref(db, `doctor/${doctorId}/requests/${id}`);
          await remove(doctorRequestRef);
  
          // Notify doctor about cancellation
          await set(ref(db, `doctor/${doctorId}/notifications/${id}`), {
            message: `The appointment with ${requestData.userName} has been cancelled.`,
            timestamp: Date.now(),
          });
  
          // Remove the request from user's requests
          await remove(requestRef);
        }
      });
  
      fetchEvents(); // Refresh calendar after deletion
  
      toast({
        title: "Appointment Canceled",
        description: "The appointment has been removed from your calendar.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error canceling event:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const emptyCells = Array(firstDayOfMonth(year, month)).fill(null);
  
  // Get events for the current month
  const currentMonthEvents = events.filter(event => {
    const [eventYear, eventMonth] = event.eventDate.split('-').map(Number);
    return eventYear === year && eventMonth === month + 1;
  });

  return (
    <>
    <ToastContainer />
      {/* Popup Section */}
      {clickedDate && (
        <Popup
          style={{
            top: `${popupPosition.y + 15}px`,
            left: `${popupPosition.x + 15}px`
          }}
        >
          <PopupHeader>
            <h4>Events on {clickedDate}</h4>
            <CloseButton onClick={() => setClickedDate(null)}>X</CloseButton>
          </PopupHeader>

          <PopupContent>
            {events
              .filter((event) => event.eventDate === clickedDate)
              .map((event, index) => (
                <div key={index}>
                  <p><strong>Time:</strong> {event.eventTime}</p>
                  <p><strong>Event:</strong> {event.eventName}</p>
                  <RemoveButton onClick={() => removeEvent(event.id)}>Delete</RemoveButton>
                </div>
              ))
            }

            {events.filter((event) => event.eventDate === clickedDate).length === 0 && (
              <p>No events on this day.</p>
            )}
          </PopupContent>
        </Popup>
      )}

      {/* Add Event Modal */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>Add New Event</h3>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            <Form>
              <Input 
                type="date" 
                value={newEvent.date} 
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} 
              />
              <Input 
                type="time" 
                value={newEvent.time} 
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} 
              />
              <Input 
                type="text" 
                placeholder="Event Title" 
                value={newEvent.title} 
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} 
              />
              <Button onClick={addEvent}>Add Event</Button>
            </Form>
          </ModalContent>
        </Modal>
      )}

      <CalendarContainer>
        <Sidebar>
        <SidebarTitle>
          <NavButton onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>{'<'}</NavButton>
          {year}
          <NavButton onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>{'>'}</NavButton>
        </SidebarTitle>

          <SidebarList>
            {[ 
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((name, index) => (
              <SidebarItem
                key={index}
                active={month === index}
                onClick={() => setCurrentDate(new Date(year, index, 1))}
              >
                {name} <EventCount>({events.filter(event => {
                  const [eventYear, eventMonth] = event.eventDate.split('-').map(Number);
                  return eventYear === year && eventMonth === index + 1;
                }).length})</EventCount>
              </SidebarItem>
            ))}
          </SidebarList>
        </Sidebar>

        <MainCalendar>
          <CalendarHeader>
            <span>{monthName} {year}</span>
            <AddEventButton onClick={() => setShowModal(true)}>+</AddEventButton>
          </CalendarHeader>

          <CalendarDays>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <DayHeader key={day}>{day}</DayHeader>
            ))}

            {emptyCells.map((_, index) => (
              <EmptyCell key={`empty-${index}`} />
            ))}

            {days.map((day) => {
              const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(event => event.eventDate === formattedDate);
            
              return (
                <Day
                  key={day}
                  hasEvent={dayEvents.length > 0}
                  onClick={(e) => {
                    setClickedDate(formattedDate);    
                    setPopupPosition({ x: e.clientX, y: e.clientY });
                  }}
                >
                  <DateNumber>{day}</DateNumber>
                </Day>
              );
            })}
          </CalendarDays>
        </MainCalendar>

        <EventList>
          <EventListHeader>Events for {monthName}</EventListHeader>
          <span></span>
          
          {currentMonthEvents.length > 0 ? (
            <EventItems>
              {currentMonthEvents.map((event, index) => {
                const eventDate = new Date(event.eventDate);
                const day = eventDate.getDate();
                return (
                  <EventItem key={index}>
                    <EventDot color={event.color || getRandomEventColor()} />
                    <EventDetails>
                      <EventDateTime>
                        {monthName} {day}, {event.eventTime}
                      </EventDateTime>
                      <EventName>{event.eventName}</EventName>
                    </EventDetails>
                    <PriorityDots>{event.priority}</PriorityDots>
                    <DeleteButton onClick={() => removeEvent(event.id)}>
                      <img 
                        src={Delete} 
                        alt="Delete" 
                        width="16" 
                        height="16" 
                      />
                    </DeleteButton>
                  </EventItem>
                );
              })}
            </EventItems>
          ) : (
            <p>No events for this month.</p>
          )}
        </EventList>
      </CalendarContainer>
    </>
  );
};

export default Calendar;

// Styled Components
const CalendarContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #ffffff;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 220px;
  background-color: #8e73be;
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const SidebarTitle = styled.h3`
  text-align: center;
  margin-bottom: 30px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;

`;

const NavButton = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 30%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  // margin: 20px;
  flex-grow: 1;
`;

const SidebarItem = styled.li`
  padding: 10px 20px;
  cursor: pointer;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const EventCount = styled.span`
  font-size: 14px;
  opacity: 0.8;
`;

const MainCalendar = styled.div`
  flex-grow: 1;
  padding: 20px;
  background-color: #f9f9f9;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  color: #333;
`;

const AddEventButton = styled.button`
  background-color: #8e73be;
  color: white;
  border: none;
  border-radius: 30%;
  width: 40px;
  height: 40px;
  display: flex;
  padding-top: 0px;
  align-items: center;
  text-align: center;
  justify-content: center;
  cursor: pointer;
  font-size: 25px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #7b63a7;
  }
`;

const CalendarDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 30px;
`;

const DayHeader = styled.div`
  text-align: center;
  font-weight: 600;
  color: #888;
  padding: 10px 0;
  font-size: 17px;
`;

const Day = styled.div`
  background-color: white;
  border-radius: 50%;
  aspect-ratio: 1;
  height: 55px;
  width: 55px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  
  ${props => props.hasEvent && `
    background-color: ${getRandomEventColor()};
    color: white;
  `}
  
  &:hover {
    background-color: ${props => props.hasEvent ? getRandomEventColor(true) : '#f0f0f0'};
  }
`;

const EmptyCell = styled.div`
  aspect-ratio: 0;
`;

const DateNumber = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const EventList = styled.div`
  width: 430px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;
const EventListHeader = styled.h3`
  display: flex;
  justify-content: flex-start;
  padding: 8px;
  margin-top: 18px;
  font-size: 20px;
`;

const EventItems = styled.div`
  padding: 0 16px 16px;
`;

const EventItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
`;
const EventDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 12px;
  margin-top: 5px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  opacity: 0.7;

   img {
    width: 22px;  /* Increased image size */
    height: 22px;  /* Increased image size */
  }
  
  &:hover {
    opacity: 1;
  }
`;
const EventDetails = styled.div`
  flex: 1;
`;

const EventDateTime = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 2px;
`;

const EventName = styled.div`
  font-size: 14px;
  color: #333;
`;

const PriorityDots = styled.div`
  color: #aaa;
  font-size: 12px;
  letter-spacing: 1px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #8e73be;
  }
`;

const Button = styled.button`
  background-color: #8e73be;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #7b63a7;
  }
`;

const Popup = styled.div`
  position: fixed;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  
  h4 {
    margin: 0;
    font-weight: 500;
  }
`;

const PopupContent = styled.div`
  padding: 15px;
  
  p {
    margin: 5px 0;
    padding: 8px;
  }
`;

const RemoveButton = styled.button`
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 5px;
  
  &:hover {
    background-color: #ff3232;
  }
`;