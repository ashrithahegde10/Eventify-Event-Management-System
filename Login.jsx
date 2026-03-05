import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand">Eventify</h1>
        <h2>Welcome to Eventify</h2>
        <p>Your ultimate platform for discovering and managing events.</p>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
          alt="login illustration"
          style={{ width: '80px', marginBottom: '16px' }}
        />

        <form onSubmit={handleSubmit} className="form">
          <label>Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
            />
          </label>

          <label>Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="error">{error}</div>}

          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <button type="submit" style={{ width: '100%' }}>Login</button>
          </div>
        </form>

        <div className="divider">
          <hr /> <span>or</span> <hr />
        </div>

        <Link to="/register" className="secondary-btn">Create New Account</Link>
      </div>
    </div>
  );
}
