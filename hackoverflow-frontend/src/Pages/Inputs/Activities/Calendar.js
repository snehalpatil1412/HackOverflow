import React, { useState } from 'react';
import styled from 'styled-components';

const CalendarContainer = styled.div`
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
`;

const Sidebar = styled.div`
  width: 200px;
  background: #8a6df1;
  color: white;
  padding: 20px;
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

const DateNumber = styled.div`
  font-weight: bold;
`;

const EventTitle = styled.div`
  margin-top: 8px;
  background: #ffcc66;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ date: '', time: '', title: '' });

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const addEvent = () => {
    if (newEvent.date && newEvent.time && newEvent.title) {
      const newEvents = [...events, { ...newEvent }];
      setEvents(newEvents);
      setNewEvent({ date: '', time: '', title: '' });
    }
  };

  const removeEvent = (index) => {
    const updatedEvents = [...events];
    updatedEvents.splice(index, 1);
    setEvents(updatedEvents);
  };

  const getEventCountForMonth = (year, month) => {
    return events.filter((event) => {
      const [eventYear, eventMonth] = event.date.split('-').map(Number);
      return eventYear === year && eventMonth === month + 1;
    }).length;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const emptyCells = Array(firstDayOfMonth(year, month)).fill(null);

  return (
    <CalendarContainer>
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

          {emptyCells.map((_, index) => (
            <EmptyCell key={`empty-${index}`} />
          ))}

          {days.map((day) => {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const event = events.find((e) => e.date === date);

            return (
              <Day key={day} hasEvent={!!event}>
                <DateNumber>{day}</DateNumber>
                {event && (
                  <EventTitle>{`${event.title} @ ${formatTime(event.time)}`}</EventTitle>
                )}
              </Day>
            );
          })}
        </CalendarDays>
      </MainCalendar>

      <EventList>
        <AddEventForm>
          <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
          <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
          <Input type="text" placeholder="Event Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
          <Button onClick={addEvent}>Add Event</Button>
        </AddEventForm>
      </EventList>
    </CalendarContainer>
  );
};

export default Calendar;
