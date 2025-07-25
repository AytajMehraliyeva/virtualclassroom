import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [username, setUsername] = useState('User' + Math.floor(Math.random() * 1000));

  useEffect(() => {
    const newSocket = io('https://virtualclassroom-sb1c.onrender.com');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const createRoom = async () => {
    const res = await fetch('https://virtualclassroom-sb1c.onrender.com/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
    });
    const data = await res.json();
    setRoomId(data.roomId);
    return data.roomId;
  };

  const joinRoom = (id) => {
    setRoomId(id);
  };

  return (
    <AppContext.Provider value={{
      socket,
      roomId,
      setRoomId,
      username,
      createRoom,
      joinRoom
    }}>
      {children}
    </AppContext.Provider>
  );
};
