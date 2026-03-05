import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ 
    firstName: '',
    lastName: '',
    email: '', 
    password: '', 
    role: 'user',
    phone: '' 
  });
  const { register } = useContext(AuthContext);
  const nav = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      nav('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '450px', width: '100%' }}>
        <h1 className="brand">Eventify</h1>
        <h2>Create Account</h2>
        <p>Join Eventify and start discovering amazing events.</p>

        <form onSubmit={handleSubmit} className="form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>First Name
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </label>

            <label>Last Name
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </label>
          </div>

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

          <label>Phone Number (Optional)
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 1234567890"
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
              minLength={6}
            />
          </label>

          <label style={{ marginTop: '8px' }}>
            Account Type
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '8px',
              padding: '12px',
              background: 'var(--bg-light)',
              borderRadius: 'var(--radius)'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                flex: 1,
                padding: '12px',
                background: form.role === 'user' ? 'white' : 'transparent',
                border: form.role === 'user' ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: 'var(--radius)',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={form.role === 'user'}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>User</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    View and discover events
                  </div>
                </div>
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                flex: 1,
                padding: '12px',
                background: form.role === 'organizer' ? 'white' : 'transparent',
                border: form.role === 'organizer' ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: 'var(--radius)',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="organizer"
                  checked={form.role === 'organizer'}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>Organizer</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Create and manage events
                  </div>
                </div>
              </label>
            </div>
          </label>

          {error && <div className="error">{error}</div>}

          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <button type="submit" style={{ width: '100%' }}>Create Account</button>
          </div>
        </form>

        <div className="divider">
          <hr /> <span>or</span> <hr />
        </div>

        <Link to="/login" className="secondary-btn">Back to Login</Link>
      </div>
    </div>
  );
}