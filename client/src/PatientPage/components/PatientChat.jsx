import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import styles from '../styles/PatientChat.module.css'; // CSS for styling the component
import { Chat, Close } from '@mui/icons-material';



const PatientChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const messageEndRef = useRef(null);
  const [error, setError] = useState('');
  const [predefinedQuestions, setPredefinedQuestions] = useState([]); // State to store predefined questions
  const [workingHours, setWorkingHours] = useState({ start: 9, end: 17 });


  // Initialize Socket.IO connection and fetch messages when the component mounts
  useEffect(() => {
    const socketIO = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket'],
    });
    setSocket(socketIO);

    // Fetch existing messages when the component mounts
    if (userId) {
      socketIO.emit('joinPatient', userId);
      fetchMessages(); // Fetch messages when the component mounts
    }

    // Listen for new messages for this patient
    socketIO.on('newMessage', (message) => {
      // Avoid duplicating messages if they already exist in the state
      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
        return isDuplicate ? prevMessages : [...prevMessages, message];
      });
      scrollToBottom();
    });

    // Fetch predefined questions from the server
    const fetchPredefinedQuestions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/predefined/predefined-questions`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        setPredefinedQuestions(response.data); // Store predefined questions in state
      } catch (error) {
        console.error('Error fetching predefined questions:', error);
      }
    };

    fetchPredefinedQuestions();

    // Fetch the secretary's profile to get working hours
    const fetchSecretaryProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/signup/secreSched`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const { START_TIME, END_TIME } = response.data;
        setWorkingHours({
          start: new Date(START_TIME).getHours(), // Get hour part of the START_TIME
          end: new Date(END_TIME).getHours(),     // Get hour part of the END_TIME
        });
      } catch (error) {
        console.error('Error fetching secretary profile:', error);
      }
    };

    fetchSecretaryProfile();



    // Clean up the socket connection on component unmount
    return () => {
      socketIO.disconnect();
    };
  }, [userId]);

  // Fetch messages from the server
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      // Check if response data is valid and an array
      if (Array.isArray(response.data)) {
        const sortedMessages = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(sortedMessages);
        scrollToBottom();
      } else {
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Function to check if the current time is within working hours
  const isSecretaryAvailable = () => {
    const currentHour = new Date().getHours();
    return currentHour >= workingHours.start && currentHour < workingHours.end;
  };

  // Handle sending messages
  const sendMessage = () => {
    setError('');

    if (newMessage.trim() !== '') {
      const messageData = {
        receiver_id: 'secretary', // Assuming the secretary is the receiver (adjust if dynamic)
        sender_id: userId,
        content: newMessage,
        sender_type: 'patient',
        timestamp: new Date().toISOString(),
      };

      // Emit the message via Socket.IO
      socket.emit('sendMessage', messageData);

      // Optimistically update the local state to reflect the new message
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage('');
      scrollToBottom();

      // Save the message to the database
      axios.post(`${process.env.REACT_APP_API_URL}/messages/send`, messageData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        setError('Failed to send message. Please try again.');
      });
      // Autoreply message if outside working hours
      if (!isSecretaryAvailable()) {
        const autoReplyMessage = {
          receiver_id: userId,
          sender_id: 'secretary',
          content: "You are messaging the secretary outside working hours. The secretary will respond once their schedule allows.",
          sender_type: 'bot',
          timestamp: new Date().toISOString(),
        };

        // Emit the autoreply message via Socket.IO
        socket.emit('sendMessage', autoReplyMessage);

        // Add autoreply message to local state
        setMessages((prevMessages) => [...prevMessages, autoReplyMessage]);
      }
    } else {
      setError('Message cannot be empty.');
    }
  };

  // Handle predefined question click
  const handlePredefinedQuestion = (question, reply) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: question, sender_type: 'patient', timestamp: new Date().toISOString() },
      { content: reply, sender_type: 'bot', timestamp: new Date().toISOString() },
    ]);
    scrollToBottom();
  };

  // Scroll to the bottom when messages are updated
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {!isOpen ? (
        <div className={styles.chatIcon} onClick={toggleChat}>
          <Chat style={{ fontSize: '40px', color: '#3f51b5', cursor: 'pointer' }} />
        </div>
      ) : (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <h4 className={styles.title}><strong>Chat with Secretary</strong></h4>
            <span className={styles.closeButton} onClick={toggleChat}><Close/></span>
          </div>
          <div className={styles.chatBody}>
          {messages.map((msg, index) => (
            <div
                key={index}
                className={`${styles.message} ${msg.sender_type === 'patient' ? styles.sentMessage : styles.receivedMessage}`}
            >
                <p>{msg.lastMessage ? msg.lastMessage : msg.content}</p>
                <div style={{
                  fontSize: '10px',
                  color: 'black',
                  textAlign: 'right',
                  marginTop: '5px'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <div className={styles.chatFooter}>
            <div className={styles.predefinedQuestions}>
            {predefinedQuestions.length > 0 ? (
                predefinedQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handlePredefinedQuestion(q.question, q.reply)}
                    className={styles.predefinedButton}
                  >
                    {q.question}
                  </button>
                ))
              ) : (
                <p>Loading predefined questions...</p>
              )}
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className={styles.chatInput}
            />
            <button onClick={sendMessage} className={styles.sendButton}>Send</button>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}
    </>
  );
};

export default PatientChat;
