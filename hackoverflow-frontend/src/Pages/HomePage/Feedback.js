import React, { useState } from 'react';
import styled from 'styled-components';
import { Text, Button } from '@chakra-ui/react';

const FeedbackContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FeedbackItem = styled.div`
  background: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  border-left: 4px solid #a8cc9c;
`;

const FeedbackForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  background: #a8cc9c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;

  &:hover {
    background: #8bc3a3;
  }
`;

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, name: 'John Doe', feedback: 'Great service! Very helpful.' },
    { id: 2, name: 'Jane Smith', feedback: 'Could improve response time.' },
    { id: 3, name: 'Alice Johnson', feedback: 'Loved the new features!' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ name: '', feedback: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback({ ...newFeedback, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newFeedback.name && newFeedback.feedback) {
      setFeedbacks([...feedbacks, { id: Date.now(), ...newFeedback }]);
      setNewFeedback({ name: '', feedback: '' });
      setShowForm(false);
    }
  };

  return (
    <FeedbackContainer>
      <Text style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '600' }}>
        User Feedbacks
      </Text>
      {feedbacks.map((feedback) => (
        <FeedbackItem key={feedback.id}>
          <strong>{feedback.name}:</strong> {feedback.feedback}
        </FeedbackItem>
      ))}
      <Button
        onClick={() => setShowForm(true)}
        style={{ width: '100%', marginTop: '20px', background: '#a8cc9c', color: 'white' }}
      >
        Give Your Feedback
      </Button>
      {showForm && (
        <FeedbackForm onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Your Name"
            value={newFeedback.name}
            onChange={handleInputChange}
            required
          />
          <Textarea
            name="feedback"
            placeholder="Your Feedback"
            value={newFeedback.feedback}
            onChange={handleInputChange}
            required
          />
          <SubmitButton type="submit">Submit Feedback</SubmitButton>
        </FeedbackForm>
      )}
    </FeedbackContainer>
  );
};

export default Feedback;
