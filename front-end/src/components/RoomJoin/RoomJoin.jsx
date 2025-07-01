import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RoomJoin.scss';
import Header from '../../layouts/Header/Header';

function RoomJoin() {
  const [roomPath, setRoomPath] = useState('');

  const createRoom = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first!');
      return;
    }

    const res = await fetch('http://localhost:3001/api/rooms/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.roomId) {
      setRoomPath(`/video/${data.roomId}`);
    } else {
      alert('Error creating room');
    }
  };

  return (
    
    <div className="room-join-container">
      
      <div className="card">
        <h2>Create a Meeting Room</h2>
        <button className="create-btn" onClick={createRoom}>
          + Create Meeting
        </button>

        {roomPath && (
          <div className="share-link">
            <p>Share this link with others:</p>
            <Link to={roomPath}>{window.location.origin + roomPath}</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomJoin;
