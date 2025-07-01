import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./Form.scss";

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        navigate('/room');
      } else {
        setMessage(data.error || 'Error logging in');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='form'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          placeholder="Username or Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
