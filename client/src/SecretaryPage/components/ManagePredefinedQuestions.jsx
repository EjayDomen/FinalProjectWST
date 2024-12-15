// ManagePredefinedQuestions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Add, Edit, Delete } from '@mui/icons-material';
import styles from '../styles/ManagePredefinedQuestions.module.css';

const ManagePredefinedQuestions = () => {
  const [predefinedQuestions, setPredefinedQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newReply, setNewReply] = useState('');
  const [isEditing, setIsEditing] = useState(null);

  // Fetch predefined questions from server
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/predefined/predefined-questions`);
        setPredefinedQuestions(response.data);
      } catch (error) {
        console.error('Error fetching predefined questions:', error);
      }
    };
    fetchQuestions();
  }, []);

  // Add a new question
  const addQuestion = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/secretary/predefined/predefined-questions`, {
        question: newQuestion,
        reply: newReply,
      });
      setPredefinedQuestions((prev) => [...prev, response.data]);
      setNewQuestion('');
      setNewReply('');
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  // Edit an existing question
  const updateQuestion = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/secretary/predefined/predefined-questions/${id}`, {
        question: newQuestion,
        reply: newReply,
      });
      setPredefinedQuestions((prev) =>
        prev.map((q) => (q.id === id ? { id, question: newQuestion, reply: newReply } : q))
      );
      setNewQuestion('');
      setNewReply('');
      setIsEditing(null);
    } catch (error) {
      console.error('Error editing question:', error);
    }
  };

  // Delete a question
  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/secretary/predefined/predefined-questions/${id}`);
      setPredefinedQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Manage Predefined Questions</h2>
      <div className={styles.cont}>
        <input
          type="text"
          placeholder="Question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <input
          type="text"
          placeholder="Reply"
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
        />
        <button className={styles.button}onClick={isEditing ? () => updateQuestion(isEditing) : addQuestion}>
          {isEditing ? <Edit /> : <Add />} {isEditing ? 'Update' : 'Add'} Question
        </button>
      </div>
      <ul className={styles.questionList}>
        {predefinedQuestions.map((q) => (
          <li key={q.id} className={styles.questionItem}>
            <span>{q.question}</span>
            <span>{q.reply}</span>
            <button onClick={() => {
              setNewQuestion(q.question);
              setNewReply(q.reply);
              setIsEditing(q.id);
            }}>
              <Edit />
            </button>
            <button 
              style={{color:'red'}}
              onClick={() => deleteQuestion(q.id)}>
                <Delete />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagePredefinedQuestions;
