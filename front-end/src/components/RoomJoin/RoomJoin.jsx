import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
    <div>
      <button onClick={createRoom}>Create Meeting</button>
      {roomPath && (
        <div>
          <p>Share this link:</p>
          <Link to={roomPath}>{window.location.origin + roomPath}</Link>
        </div>
      )}
    </div>
  );
}

export default RoomJoin;
