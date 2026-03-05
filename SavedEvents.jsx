import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Heart, Calendar, MapPin, ArrowLeft } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000";

export default function SavedEvents() {
  const { user } = useContext(AuthContext);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const fetchSavedEvents = async () => {
    try {
      const res = await API.get('/auth/saved-events');
      setSavedEvents(res.data.savedEvents || []);
    } catch (err) {
      console.error('Error fetching saved events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (eventId) => {
    if (!window.confirm('Remove this event from saved?')) return;

    try {
      await API.post(`/auth/save-event/${eventId}`);
      // Remove from local state
      setSavedEvents(savedEvents.filter(event => event._id !== eventId));
      alert('Event removed from saved');
    } catch (err) {
      console.error('Error removing event:', err);
      alert('Failed to remove event');
    }
  };

  if (loading) {
    return <div className="card"><p>Loading saved events...</p></div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Heart size={32} color="#ef4444" fill="#ef4444" />
            Saved Events
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {savedEvents.length} event{savedEvents.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={18} />
          Back to Profile
        </Link>
      </div>

      {/* Saved Events List */}
      {savedEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Heart size={64} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 12px 0' }}>No saved events yet</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0' }}>
            Start exploring and save events you're interested in!
          </p>
          <Link to="/events" className="button">
            Browse Events
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {savedEvents.map((event) => (
            <div 
              key={event._id}
              className="card"
              style={{ 
                display: 'flex',
                gap: '20px',
                padding: '20px',
                position: 'relative'
              }}
            >
              {/* Event Image */}
              {event.media && event.media[0] && (
                <Link to={`/events/${event._id}`}>
                  <img
                    src={`${API_BASE_URL}${event.media[0].url}`}
                    alt={event.title}
                    style={{
                      width: '200px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius)',
                      flexShrink: 0,
                    }}
                  />
                </Link>
              )}

              {/* Event Details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link 
                  to={`/events/${event._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>
                    {event.title}
                  </h3>
                </Link>

                <p style={{ 
                  color: 'var(--text-muted)', 
                  margin: '0 0 16px 0',
                  lineHeight: '1.6'
                }}>
                  {event.description?.length > 150 
                    ? `${event.description.slice(0, 150)}...` 
                    : event.description}
                </p>

                {/* Event Meta */}
                <div style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  marginTop: 'auto',
                  flexWrap: 'wrap'
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
                      month: 'short',
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
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'white',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}>
                    Organized by <strong>{event.creator.name || `${event.creator.firstName} ${event.creator.lastName}`}</strong>
                  </div>
                )}

                {/* Archived Notice */}
                {event.isArchived && (
                  <div style={{ 
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem',
                    color: '#78350f',
                    fontWeight: '500'
                  }}>
                    ℹ️ {event.archiveReason === 'deleted_by_organizer' 
                      ? 'This event was deleted by the organizer' 
                      : 'This event has ended and is now archived'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                justifyContent: 'center'
              }}>
                <Link 
                  to={`/events/${event._id}`} 
                  className="button"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleUnsave(event._id)}
                  style={{
                    padding: '10px 16px',
                    background: 'white',
                    color: '#ef4444',
                    border: '2px solid #ef4444',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Heart size={16} fill="#ef4444" />
                  Unsave
                </button>
              </div>

              {/* Event Status Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                backgroundColor: event.isArchived 
                  ? '#fee2e2' 
                  : (new Date(event.date) >= new Date() ? '#d1fae5' : '#f3f4f6'),
                color: event.isArchived 
                  ? '#991b1b' 
                  : (new Date(event.date) >= new Date() ? '#065f46' : '#6b7280'),
              }}>
                {event.isArchived 
                  ? (event.archiveReason === 'deleted_by_organizer' ? 'Deleted' : 'Ended')
                  : (new Date(event.date) >= new Date() ? 'Upcoming' : 'Past')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}