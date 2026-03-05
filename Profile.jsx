import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { Calendar, MapPin, User, Mail, Phone, Edit, Heart, Bell, Archive } from 'lucide-react';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    savedEvents: 0,
  });
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'organizer') {
        fetchMyEvents();
      } else {
        fetchSavedEventsCount();
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyEvents = async () => {
    try {
      const res = await API.get('/events');
      // Filter events created by current user
      const userEvents = res.data.filter(
        (event) => event.creator._id === user.id || event.creator === user.id
      );
      setMyEvents(userEvents);

      // Calculate stats
      const now = new Date();
      const upcoming = userEvents.filter((e) => new Date(e.date) >= now);
      const past = userEvents.filter((e) => new Date(e.date) < now);

      setStats({
        totalEvents: userEvents.length,
        upcomingEvents: upcoming.length,
        pastEvents: past.length,
        savedEvents: user.savedEvents?.length || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedEventsCount = async () => {
    try {
      const res = await API.get('/auth/saved-events');
      setStats({
        totalEvents: 0,
        upcomingEvents: 0,
        pastEvents: 0,
        savedEvents: res.data.savedEvents?.length || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Please login to view your profile</h2>
        <Link to="/login" className="button" style={{ marginTop: '20px', display: 'inline-block' }}>
          Go to Login
        </Link>
      </div>
    );
  }

  // Get user initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Profile Avatar */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: user.role === 'organizer' 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'linear-gradient(135deg, var(--primary), #9b7cff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '700',
              color: 'white',
              flexShrink: 0,
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>
                {user.firstName} {user.lastName}
              </h1>
              {user.role === 'organizer' && (
                <span style={{
                  padding: '4px 12px',
                  background: '#d1fae5',
                  color: '#065f46',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  Organizer
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} /> {user.email}
              </p>
              {user.phone && (
                <p style={{ color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} /> {user.phone}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => nav('/profile/edit')}
                className="button"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit size={16} />
                Edit Account Details
              </button>
              {user.role === 'organizer' && (
                <Link to="/events/new" className="button" style={{ background: '#10b981' }}>
                  Create New Event
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        {/* Saved Events Card */}
        <Link 
          to="/saved-events"
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '24px',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Heart size={32} color="#ef4444" fill="#ef4444" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>
            {stats.savedEvents}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Saved Events</div>
        </Link>

        {/* Notifications Card */}
        <Link 
          to="/notifications"
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '24px',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Bell size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
            Notifications
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Event Reminders</div>
        </Link>

        {/* Organizer Stats */}
        {user.role === 'organizer' && (
          <>
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
                {stats.totalEvents}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Total Events</div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                {stats.upcomingEvents}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Upcoming</div>
            </div>

            <Link 
              to="/archived-events"
              className="card" 
              style={{ 
                textAlign: 'center', 
                padding: '24px',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6b7280';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Archive size={32} color="#6b7280" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6b7280', marginBottom: '8px' }}>
                Archive
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Deleted & Past</div>
            </Link>
          </>
        )}
      </div>

      {/* My Events Section - Only for Organizers */}
      {user.role === 'organizer' && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>My Events</h2>
          {loading ? (
            <p>Loading your events...</p>
          ) : myEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                You haven't created any events yet.
              </p>
              <Link to="/events/new" className="button">
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Event Image */}
                  {event.media?.[0]?.url && (
                    <img
                      src={`http://localhost:5000${event.media[0].url}`}
                      alt={event.title}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* Event Details */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>{event.title}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                      {event.description?.slice(0, 100)}...
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        backgroundColor: new Date(event.date) >= new Date() ? '#d1fae5' : '#f3f4f6',
                        color: new Date(event.date) >= new Date() ? '#065f46' : '#6b7280',
                      }}
                    >
                      {new Date(event.date) >= new Date() ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Role Message */}
      {user.role === 'user' && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3>Welcome, {user.firstName}!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            You're registered as a User. Explore and discover amazing events!
          </p>
          <Link to="/events" className="button">
            Browse Events
          </Link>
        </div>
      )}
    </div>
  );
}