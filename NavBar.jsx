import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Bell } from 'lucide-react';
import API from '../api/axiosConfig';

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      // Check for notifications every 5 minutes
      const interval = setInterval(fetchNotificationCount, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const res = await API.get('/auth/notifications');
      setNotificationCount(res.data.count || 0);
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  const handleLogout = () => {
    logout();
    nav('/');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="brand">
        <Link to="/">Eventify</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        {user ? (
          <>
            {/* Only organizers can add events */}
            {user.role === 'organizer' && (
              <Link to="/events/new">Add Event</Link>
            )}
            
            {/* Notifications Bell */}
            <Link
              to="/notifications"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg-light)',
                border: '1px solid var(--border-color)',
                textDecoration: 'none',
                color: 'var(--text-dark)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-light)';
              }}
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    border: '2px solid white',
                  }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>

            <button className="link-like" onClick={handleLogout}>
              Logout
            </button>
            
            {/* Profile Icon with Name and Role Badge */}
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg-light)',
                border: '1px solid var(--border-color)',
                textDecoration: 'none',
                color: 'var(--text-dark)',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-light)';
              }}
            >
              {/* Avatar Circle */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: user.role === 'organizer' 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : 'linear-gradient(135deg, var(--primary), #9b7cff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'white',
                }}
              >
                {getInitials(user.name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span>{user.name}</span>
                {user.role === 'organizer' && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: '#10b981',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Organizer
                  </span>
                )}
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}