import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CalendarContainer = styled.div`
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
  scroll-behavior: smooth;
  transition: all 0.2s ease-in-out;
`;

const Sidebar = styled.div`
  width: 200px;
  background: linear-gradient(135deg, #8a6df1, #5748a6);
  color: white;
  padding: 20px;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1); 
  transition: all 0.4s ease-in-out;
  
  &:hover {
    background: linear-gradient(135deg, #6b54d3, #4e3c97);
    box-shadow: 6px 0 18px rgba(0, 0, 0, 0.2);
    transform: translateX(5px);
  }

  &:focus, &:active {
    outline: none;
    border: 2px solid #fff;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
  }
`;

const SidebarTitle = styled.h3`
  text-align: center;
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
`;

const SidebarItem = styled.li`
  padding: 10px;
  cursor: pointer;
  background: ${props => props.active ? '#5748a6' : 'transparent'};
  
  &:hover {
    background: #5748a6;
  }
`;

const EventCount = styled.span`
  margin-left: 5px;
`;

const MainCalendar = styled.div`
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
`;

const HeaderButton = styled.button`
  background: #8a6df1;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  
  &:hover {
    background: #6b54d3;
  }
`;

const CalendarDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
`;

const Day = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: ${props => props.hasEvent ? '#ffdddd' : 'white'};
  border: ${props => props.hasEvent ? '2px solid #ff7f7f' : '1px solid #ccc'};
  padding: 20px;
  height: 100px;
  transition: 0.3s;
  
  &:hover {
    background: ${props => props.hasEvent ? '#ffdddd' : '#eaeaea'};
  }
`;

const DayHeader = styled(Day)`
  background: #8a6df1;
  color: white;
  font-weight: bold;
  height: auto;
  padding: 10px;
  
  &:hover {
    background: #8a6df1;
  }
`;

const EmptyCell = styled(Day)`
  background: #f9f9f9;
  
  &:hover {
    background: #f9f9f9;
  }
`;
const EventPopup = styled.div`
  position: absolute;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: opacity 0.4s ease, transform 0.3s ease;
  
  &.entering {
    opacity: 0;
    transform: scale(0.9);
  }
  
  &.entered {
    opacity: 1;
    transform: scale(1);
  }
  
  &.exiting {
    opacity: 0;
    transform: scale(0.9);
  }
`;

const DateNumber = styled.div`
  font-weight: bold;
`;

const EventTitle = styled.div`
  margin-top: 5px;
  background: #ffcc66;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: 0.3s;

  &:hover {
    background: #ffa500;
    color: white;
  }
`;


const EventList = styled.div`
  width: 300px;
  padding: 20px;
  background: #f0f0f0;
  border-left: 1px solid #ccc;
  overflow-y: auto;
`;

const EventItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background: white;
  border: 1px solid #ccc;
`;

const RemoveButton = styled.button`
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
  
  &:hover {
    background: #ff1a1a;
  }
`;

const AddEventForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const Input = styled.input`
  padding: 10px;
  border: 2px solid #8a6df1;
  outline: none;
`;

const Button = styled.button`
  padding: 10px;
  border: 2px solid #8a6df1;
  background: #8a6df1;
  color: white;
  cursor: pointer;
  
  &:hover {
    background: #6b54d3;
  }
`;

const Calendar = () => {
  const [clickedDate, setClickedDate] = useState(null);   // Stores the clicked date
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });   // Position of the popup
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ date: '', time: '', title: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

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
    });
  };

  const addEvent = () => {
    const userId = auth.currentUser?.uid;

    if (!userId || !newEvent.date || !newEvent.time || !newEvent.title) return;

    const db = getDatabase();
    const eventRef = ref(db, `users/${userId}/events/${Date.now()}`);

    set(eventRef, {
      eventName: newEvent.title,
      eventDate: newEvent.date,
      eventTime: newEvent.time
    }).then(() => {
      setNewEvent({ date: '', time: '', title: '' });
      fetchEvents();
    });
  };

  const removeEvent = (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const db = getDatabase();
    const eventRef = ref(db, `users/${userId}/events/${id}`);
    remove(eventRef).then(() => fetchEvents());
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const emptyCells = Array(firstDayOfMonth(year, month)).fill(null);

  return (
    <CalendarContainer>
      {/* Sidebar */}
      <Sidebar>
        <SidebarTitle>{year}</SidebarTitle>
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
              {name} <EventCount>({getEventCountForMonth(year, index)})</EventCount>
            </SidebarItem>
          ))}
        </SidebarList>
      </Sidebar>

      {/* Calendar Section */}
      <MainCalendar>
        <CalendarHeader>
          <HeaderButton onClick={prevMonth}>{'<'}</HeaderButton>
          <span>{monthName} {year}</span>
          <HeaderButton onClick={nextMonth}>{'>'}</HeaderButton>
        </CalendarHeader>

          <CalendarDays>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <DayHeader key={day}>{day}</DayHeader>
            ))}

          {/* Empty cells for the correct start day */}
          {emptyCells.map((_, index) => (
            <EmptyCell key={`empty-${index}`}></EmptyCell>
          ))}

          {days.map((day) => {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const event = events.find((e) => e.date === date);

            return (
              <Day key={day} hasEvent={!!event}>
                <DateNumber>{day}</DateNumber>
                {event && <EventTitle>{event.title}</EventTitle>}
              </Day>
            );
          })}
        </CalendarDays>
      </MainCalendar>

      {/* Event List */}
      <EventList>
        <h4>Events</h4>
        {events.map((event, index) => (
          <EventItem key={index}>
            <strong>{event.title}</strong>
            <span>{event.date}</span>
            <RemoveButton onClick={() => removeEvent(index)}>Remove</RemoveButton>
          </EventItem>
        ))}

        {/* Add New Event */}
        <AddEventForm>
          <Input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <Button onClick={addEvent}>Add Event</Button>
        </AddEventForm>
      </EventList>
    </CalendarContainer>
  );
};

export default Calendar;
