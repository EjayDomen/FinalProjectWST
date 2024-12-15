import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { AccountCircle, Add, Search } from '@mui/icons-material';
import styles from '../styles/messagesSecre.module.css';
import axios from 'axios';


const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState('');
  const messageEndRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:5000", {
      withCredentials: true,
      transports: ['websocket'],
    });


    fetchPatients();
    fetchConversations();

    axios.get(`${process.env.REACT_APP_API_URL}/secretary/profile`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => {
        const secretaryId = response.data.id;
        socket.emit('joinSecretary', secretaryId);
      })
      .catch(error => {
        console.error('Error fetching secretary details:', error);
      });

    socket.current.on('newMessage', (message) => {
      // Update the conversation list with the new message
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conversation) => {
          if (conversation.patientId === message.receiver_id || conversation.patientId === message.sender_id) {
            // Create a new object to avoid mutating the previous state
            return {
              ...conversation,
              lastMessage: message.content,
              timestamp: message.timestamp,
            };
          }
          return conversation;
        });

        // Sort the updated conversations by timestamp (to maintain the order)
        return updatedConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
      console.log('New message received:', message);
      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
        return isDuplicate ? prevMessages : [...prevMessages, message];
      });
      scrollToBottom();


      // Optionally fetch the full list of messages for the selected patient
      if (selectedPatient) {
        fetchMessages(selectedPatient.patientId);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [selectedPatient]);

  // Automatically reload the messages every 10 seconds
  useEffect(() => {
    fetchConversations(); // Initial fetch

    const interval = setInterval(() => {
      fetchConversations(); // Fetch conversations every 10 seconds
      if (selectedPatient) {
        fetchMessages(selectedPatient.patientId); // Fetch messages for selected patient
      }
    }, 1000); // 10 seconds

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, [selectedPatient]); // Reload messages based on selected patient state

  // Scroll to the bottom when messages are updated
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/patients`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setPatients(response.data);
      setFilteredPatients(response.data); // Set all patients initially
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      // Sort conversations by timestamp in descending order
      const sortedConversations = response.data.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      setConversations(sortedConversations);
      setFilteredConversations(sortedConversations); // Initialize filtered list with sorted conversations
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendSMSRequest = async (number, message) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/patient/sms/send-sms`, {  // Your API endpoint
        number,
        message
      });
      console.log('SMS sent:', response.data);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };


  const fetchMessages = async (patientId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/messages/${patientId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleReplyMessage = () => {
    if (newMessage.trim() && selectedPatient) {
      const messageData = {
        receiver_id: selectedPatient.patientId,
        content: newMessage,
        sender_type: 'secretary',
        timestamp: new Date().toISOString(),
      };

      const socket = io("http://localhost:5000", {
        withCredentials: true,
        transports: ['websocket'],
      });

      socket.emit('sendMessage', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage('');

      axios.post(`${process.env.REACT_APP_API_URL}/secretary/messages/replyMessage`, messageData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
        .then((response) => {
          console.log('Message sent successfully:', response.data);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
          setError('Failed to send message. Please try again.');
        });
    } else {
      setError('Please select a patient and enter a message.');
    }
  };




  const handleReplySMS = () => {
    if (newMessage.trim() && selectedPatient) {
      const messageData = {
        receiver_id: selectedPatient.patientId,
        content: `[SMS]: ${newMessage}`,
        sender_type: 'secretary',
        timestamp: new Date().toISOString(),
      };

      // WebSocket communication
      const socket = io("http://localhost:5000", {
        withCredentials: true,
        transports: ['websocket'],
      });

      socket.emit('sendMessage', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage('');

      // Send reply message to backend
      axios.post(`${process.env.REACT_APP_API_URL}/secretary/messages/replyMessage`, messageData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
        .then((response) => {
          console.log('Message sent successfully:', response.data);

          // Integrating sendSMS to send a message to the patient's phone
          const patientPhoneNumber = selectedPatient.patientContactNum;  // Assuming patient has a phoneNumber field


          if (patientPhoneNumber) {

            sendSMSRequest(patientPhoneNumber, newMessage)
          }
        })
        .catch((error) => {
          console.error('Error sending message:', error);
          setError('Failed to send message. Please try again.');
        });
    } else {
      setError('Please select a patient and enter a message.');
    }
  };



  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      setFilteredConversations(
        conversations.filter((conversation) =>
          conversation.patientName.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredConversations(conversations);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    fetchMessages(patient.patientId);
    closeModal();
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className={styles.doctorsSection}>
      <div className={styles.doctorsHeader}>
        <div>
          <h2 style={{ fontSize: '35px' }}>Messages</h2>
          <p style={{ marginLeft: '10px', marginTop: '7px' }}>Check and manage messages with your patients.</p>
        </div>
        {/* <button className={styles.addDoctorBtn} onClick={openModal}>
          <Add style={{fontSize: '30px', marginTop: '-5px'}} /> New Message
        </button> */}
      </div>

      <div className={styles.messageContainer}>
        <div className={styles.messageSidebar}>
          <div className={styles.sidebarHeader}>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className={styles.sidebarSearch}
            />
          </div>

          {filteredConversations.map((conversation) => (
            <div
              key={conversation.patientId}
              className={styles.messageItem}
              onClick={() => selectPatient(conversation)}
            >
              <div className={styles.messageUser}>
                <AccountCircle style={{ fontSize: '40px' }} />
                <div className={styles.userDetails}>
                  <h4>{conversation.patientName}</h4>
                  <h4 style={{ color: 'gray', fontSize: '0.875rem' }}>
                    {conversation.patientContactNum}
                  </h4>
                  <p>
                    {conversation.lastMessage.length > 10
                      ? `${conversation.lastMessage.substring(0, 10)}...`
                      : conversation.lastMessage}
                  </p>
                </div>
              </div>
              <div className={styles.messageTime}>
                {new Date(conversation.timestamp).toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.messagePanel}>
          {selectedPatient ? (
            <>
              <div className={styles.messageHeader}>
                <AccountCircle style={{ fontSize: '40px', marginTop: '-5px' }} />
                <h3>{selectedPatient.patientName}</h3>
              </div>
              <div className={styles.messageBody}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${styles.messageBubble} ${msg.sender_type === 'patient' ? styles.receivedMessage : styles.sentMessage}`}
                  >
                    <p style={{ color: msg.sender_type === 'patient' ? 'black' : 'inherit' }}>
                      {msg.lastMessage ? msg.lastMessage : msg.content || newMessage}
                    </p>
                    <span className={styles.messageTime}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
              <div ref={messageEndRef}></div>
              <div className={styles.messageInput}>
                <input
                  type="text"
                  placeholder="Your message here..."
                  className={styles.inputBox}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button className={styles.sendButton} onClick={handleReplyMessage}>
                  Send
                </button>
                <button style={{ backgroundColor: '#00C6FF' }} onClick={handleReplySMS} className={styles.sendButton}>
                  Send via SMS
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noConversationSelected}>

            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Select Patient</h3>
            <input
              type="text"
              placeholder="Search Patient"
              value={searchQuery}
              onChange={handleSearch}
              className={styles.searchInput}
            />
            <div className={styles.patientList}>
              {filteredPatients.map((patient) => (
                <div key={patient.id} className={styles.patientItem}>

                  <span>{patient.name} </span>
                  <button className={styles.messageButton} onClick={() => selectPatient(patient)}>
                    Message
                  </button>
                </div>
              ))}
            </div>
            <button className={styles.closeButton} onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
