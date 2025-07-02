import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Form.scss"
import { Link } from 'react-router-dom'

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const res = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, email, password }),
});

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/room');  
      } else {
        setMessage(data.error || 'Error registering');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error');
    }
  };

  return (
    <div className='form'>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Register</button>
        <p>Have already an Account? <Link to={"/login"}>Login</Link></p>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
