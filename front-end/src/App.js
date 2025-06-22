import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// ⛔ localhost yox, Render backend URL
const socket = io('https://classroom-yu6i.onrender.com');

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');

  const joinRoom = async () => {
    if (!username || !room) return alert('Adınızı və otaq ID-ni daxil edin!');
    socket.emit('join_room', room);

    try {
      const res = await axios.get(`https://classroom-yu6i.onrender.com/messages/${room}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Mesajlar yüklənmədi:', err);
    }

    setJoined(true);
  };

  const sendMessage = () => {
    if (msg.trim() === '') return;
    socket.emit('send_message', {
      room,
      username,
      message: msg,
    });
    setMsg('');
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  if (!joined) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Virtual Classroom - Qoşul</h2>
        <input
          placeholder="Adınız"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Otaq ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Qoşul</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Otaq: {room} - İstifadəçi: {username}</h2>
      <div
        style={{
          height: 300,
          border: '1px solid #ccc',
          padding: 10,
          overflowY: 'scroll',
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.username}:</strong> {m.message}
          </div>
        ))}
      </div>
      <input
        style={{ width: '80%', padding: 5 }}
        placeholder="Mesaj yazın..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage} style={{ padding: '5px 10px' }}>
        Göndər
      </button>
    </div>
  );
}

export default App;
