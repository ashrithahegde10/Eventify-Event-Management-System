import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { Bell, Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/auth/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilEvent = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `in ${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return <div className="card"><p>Loading notifications...</p></div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={32} color="var(--primary)" />
            Notifications
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Upcoming events from your saved list
          </p>
        </div>
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={18} />
          Back to Profile
        </Link>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Bell size={64} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 12px 0' }}>No upcoming events</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0' }}>
            You don't have any saved events happening in the next 24 hours.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" className="button">
              Browse Events
            </Link>
            <Link to="/saved-events" className="button" style={{ background: '#6b7280' }}>
              View Saved Events
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Info Banner */}
          <div style={{
            padding: '16px 20px',
            background: '#dbeafe',
            border: '1px solid #3b82f6',
            borderRadius: 'var(--radius)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Bell size={20} color="#3b82f6" />
            <p style={{ margin: 0, color: '#1e40af', fontWeight: '500' }}>
              You have {notifications.length} event{notifications.length !== 1 ? 's' : ''} happening within the next 24 hours
            </p>
          </div>

          {/* Notifications Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.map((event) => (
              <div 
                key={event._id}
                className="card"
                style={{
                  padding: '20px',
                  border: '2px solid #fbbf24',
                  background: 'linear-gradient(to right, #fef3c7 0%, white 100%)',
                  position: 'relative'
                }}
              >
                {/* Urgency Badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '6px 12px',
                  background: '#fbbf24',
                  color: '#78350f',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Bell size={12} />
                  Starting Soon!
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  {/* Event Image */}
                  {event.media && event.media[0] && (
                    <Link to={`/events/${event._id}`}>
                      <img
                        src={`${API_BASE_URL}${event.media[0].url}`}
                        alt={event.title}
                        style={{
                          width: '180px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius)',
                          flexShrink: 0,
                          border: '3px solid #fbbf24'
                        }}
                      />
                    </Link>
                  )}

                  {/* Event Details */}
                  <div style={{ flex: 1 }}>
                    <Link 
                      to={`/events/${event._id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', paddingRight: '120px' }}>
                        {event.title}
                      </h3>
                    </Link>

                    <p style={{ 
                      color: 'var(--text-muted)', 
                      margin: '0 0 16px 0',
                      lineHeight: '1.5'
                    }}>
                      {event.description?.length > 120 
                        ? `${event.description.slice(0, 120)}...` 
                        : event.description}
                    </p>

                    {/* Time Until Event */}
                    <div style={{
                      padding: '12px 16px',
                      background: 'white',
                      borderRadius: 'var(--radius)',
                      marginBottom: '12px',
                      border: '2px solid #fbbf24'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#78350f',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}>
                        <Clock size={20} color="#fbbf24" />
                        Starting {getTimeUntilEvent(event.date)}
                      </div>
                    </div>

                    {/* Event Meta */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '20px',
                      flexWrap: 'wrap',
                      marginBottom: '12px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                      }}>
                        <Calendar size={16} color="var(--primary)" />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {' at '}
                        {new Date(event.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                      }}>
                        <MapPin size={16} color="var(--primary)" />
                        {event.location}
                      </div>
                    </div>

                    {/* Organizer Info */}
                    {event.creator && (
                      <div style={{ 
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        display: 'inline-block'
                      }}>
                        Organized by <strong>{event.creator.name}</strong>
                        {event.creator.phone && (
                          <span> • {event.creator.phone}</span>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <div style={{ marginTop: '16px' }}>
                      <Link 
                        to={`/events/${event._id}`} 
                        className="button"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        View Event Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Tip */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--bg-light)',
            borderRadius: 'var(--radius)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            💡 Tip: We'll notify you about saved events happening within the next 24 hours
          </div>
        </>
      )}
    </div>
  );
}