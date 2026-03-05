import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Archive, Calendar, MapPin, ArrowLeft, Clock } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000";

export default function ArchivedEvents() {
  const { user } = useContext(AuthContext);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'organizer') {
      fetchArchivedEvents();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchArchivedEvents = async () => {
    try {
      const res = await API.get('/events/archived/my-events');
      setArchivedEvents(res.data.archivedEvents || []);
    } catch (err) {
      console.error('Error fetching archived events:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'organizer') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Only organizers can view archived events.
        </p>
        <Link to="/profile" className="button">
          Back to Profile
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="card"><p>Loading archived events...</p></div>;
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
            <Archive size={32} color="#6b7280" />
            Archived Events
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {archivedEvents.length} archived event{archivedEvents.length !== 1 ? 's' : ''} (deleted or past events)
          </p>
        </div>
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={18} />
          Back to Profile
        </Link>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '16px 20px',
        background: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: 'var(--radius)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'start',
        gap: '12px'
      }}>
        <Archive size={20} color="#78350f" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <p style={{ margin: '0 0 6px 0', color: '#78350f', fontWeight: '600' }}>
            About Archived Events
          </p>
          <p style={{ margin: 0, color: '#78350f', fontSize: '0.9rem' }}>
            Events are archived when you delete them or automatically after they end. 
            Archived events remain visible to users who saved them but won't appear in the main events list.
          </p>
        </div>
      </div>

      {/* Archived Events List */}
      {archivedEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Archive size={64} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 12px 0' }}>No archived events</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0' }}>
            Your deleted or past events will appear here.
          </p>
          <Link to="/events" className="button">
            Browse Events
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {archivedEvents.map((event) => (
            <div 
              key={event._id}
              className="card"
              style={{ 
                display: 'flex',
                gap: '20px',
                padding: '20px',
                position: 'relative',
                opacity: 0.85,
                border: '2px solid #e5e7eb'
              }}
            >
              {/* Archive Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '6px 12px',
                background: event.archiveReason === 'deleted_by_organizer' ? '#fee2e2' : '#f3f4f6',
                color: event.archiveReason === 'deleted_by_organizer' ? '#991b1b' : '#6b7280',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Archive size={12} />
                {event.archiveReason === 'deleted_by_organizer' ? 'Deleted' : 'Ended'}
              </div>

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
                      filter: 'grayscale(50%)'
                    }}
                  />
                </Link>
              )}

              {/* Event Details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingRight: '120px' }}>
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
                  marginBottom: '12px',
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

                  {event.archivedAt && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem'
                    }}>
                      <Clock size={16} color="#6b7280" />
                      Archived {new Date(event.archivedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Archive Reason */}
                <div style={{
                  padding: '10px 12px',
                  background: event.archiveReason === 'deleted_by_organizer' ? '#fef3c7' : '#f3f4f6',
                  border: `1px solid ${event.archiveReason === 'deleted_by_organizer' ? '#fbbf24' : '#d1d5db'}`,
                  borderRadius: 'var(--radius)',
                  fontSize: '0.85rem',
                  color: event.archiveReason === 'deleted_by_organizer' ? '#78350f' : '#6b7280',
                  fontWeight: '500',
                  marginTop: 'auto'
                }}>
                  {event.archiveReason === 'deleted_by_organizer' 
                    ? ' You deleted this event before it started' 
                    : ' This event ended and was automatically archived'}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <Link 
                  to={`/events/${event._id}`} 
                  className="button"
                  style={{ 
                    whiteSpace: 'nowrap',
                    background: '#6b7280'
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Note */}
      {archivedEvents.length > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--bg-light)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
           Note: Archived events are still visible to users who saved them, maintaining their event history.
        </div>
      )}
    </div>
  );
}