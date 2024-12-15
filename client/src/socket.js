// src/socket.js (or socketConfig.js)

import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true,
  extraHeaders: {
    "Authorization": "Bearer " + localStorage.getItem('token')
  }
});

export default socket;
