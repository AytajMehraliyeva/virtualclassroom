import React, { useState } from 'react';

const ProfileUpload = () => {
  const [selected, setSelected] = useState(null);
  const [uploaded, setUploaded] = useState('');

  const handleUpload = async () => {
    if (!selected) return alert('Select a file first!');
    const formData = new FormData();
    formData.append('avatar', selected);

    try {
      const res = await fetch('http://localhost:3001/api/upload/profile', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setUploaded(data.imageUrl);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Upload Profile Photo</h2>
      <input type="file" onChange={(e) => setSelected(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      {uploaded && <img src={`http://localhost:3001${uploaded}`} alt="Profile" width={100} />}
    </div>
  );
};

export default ProfileUpload;
