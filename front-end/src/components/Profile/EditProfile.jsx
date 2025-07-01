import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditProfile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://virtualclassroom-sb1c.onrender.com/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsername(res.data.username);
        setEmail(res.data.email);
        setProfilePicture(res.data.profilePicture);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', username);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await axios.post(
        'https://virtualclassroom-sb1c.onrender.com',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Profile updated!');
      setProfilePicture(res.data.user.profilePicture);

    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    }
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label>Profile Picture:</label><br/>
          {profilePicture && (
            <img 
              src={`https://virtualclassroom-sb1c.onrender.com${profilePicture}`} 
              alt="Profile" 
              width="100" 
            />
          )}
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
          />
        </div>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default EditProfile;
