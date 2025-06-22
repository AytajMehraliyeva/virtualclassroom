import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3001');

function App() {
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const joinRoom = async () => {
    if (room && username) {
      socket.emit('join_room', room);
      setJoined(true);
      const res = await axios.get(`http://localhost:3001/messages/${room}`);
      setChat(res.data);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', {
        room,
        username,
        message
      });
      setMessage('');
    }
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setChat((prev) => [...prev, data]);
    });
    return () => socket.off('receive_message');
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {!joined ? (
        <div>
          <h2>Otağa Qoşul</h2>
          <input placeholder="Adın" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Otaq ID" value={room} onChange={(e) => setRoom(e.target.value)} />
          <button onClick={joinRoom}>Qoşul</button>
        </div>
      ) : (
        <div>
          <h2>{room} Otağı</h2>
          <div style={{ border: '1px solid #aaa', height: 300, overflowY: 'scroll', marginBottom: 10, padding: 10 }}>
            {chat.map((msg, i) => (
              <div key={i}>
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mesaj yaz..." />
          <button onClick={sendMessage}>Göndər</button>
        </div>
      )}
    </div>
  );
}

export default App;
