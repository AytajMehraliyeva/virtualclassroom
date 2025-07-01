import React, { useState } from 'react';
import './Chat.scss';

const Chat = ({ messages, onSend, onDelete, username }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSend(newMessage);
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className="chat-message">
            <div>
              <strong>{msg.username}</strong>: {msg.text}
            </div>
            {msg.username === username && (
              <button
                className="delete-btn"
                onClick={() => onDelete(i)}
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
