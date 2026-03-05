import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Mail, Phone, Heart } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function EventDetails() {
  const { id } = useParams();
  const { user, updateUser } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (user && event) {
      // Check if event is saved
      const savedEventIds = user.savedEvents || [];
      setIsSaved(savedEventIds.includes(event._id));
    }
  }, [user, event]);

  const fetchEvent = async () => {
    try {
      const res = await API.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    // Check if event has already started
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (eventDate < now) {
      alert("Cannot delete an event that has already started or passed.");
      return;
    }

    if (!window.confirm("Delete this event? Note: It will be removed from the events list but will remain visible to users who saved it.")) return;

    try {
      const res = await API.delete(`/events/${id}`);
      if (res.data.success) {
        alert(res.data.message);
        nav("/profile");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to delete event");
      }
    }
  };

  const handleSaveEvent = async () => {
    if (!user) {
      alert('Please login to save events');
      nav('/login');
      return;
    }

    setSaving(true);
    try {
      const res = await API.post(`/auth/save-event/${id}`);
      
      if (res.data.success) {
        setIsSaved(res.data.saved);
        
        // Update user context with new savedEvents
        const updatedUser = { ...user, savedEvents: res.data.savedEvents };
        updateUser(updatedUser);
        
        alert(res.data.message);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const nextSlide = () => {
    if (event.media && event.media.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % event.media.length);
    }
  };

  const prevSlide = () => {
    if (event.media && event.media.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + event.media.length) % event.media.length);
    }
  };

  if (!event) return <p>Loading...</p>;

  const canEdit = user && (user.id === event.creator._id || user.id === event.creator);
  const isOrganizer = user && user.role === 'organizer';
  const isEventPast = new Date(event.date) < new Date();
  const isEventArchived = event.isArchived;

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Media Slideshow */}
      {event.media && event.media.length > 0 && (
        <div style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '32px',
          backgroundColor: '#000'
        }}>
          {event.media.map((m, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: currentSlide === i ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
              }}
            >
              {m.type?.startsWith("image") ? (
                <img
                  src={`${API_BASE_URL}${m.url}`}
                  alt={`media-${i}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <video
                  src={`${API_BASE_URL}${m.url}`}
                  controls
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain'
                  }}
                />
              )}
            </div>
          ))}

          {event.media.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  zIndex: 2
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              >
                <ChevronLeft size={28} color="white" />
              </button>

              <button
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  zIndex: 2
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              >
                <ChevronRight size={28} color="white" />
              </button>

              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 2
              }}>
                {event.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    style={{
                      width: currentSlide === index ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Event Title with Save Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: '2.5rem' }}>{event.title}</h1>
          {/* Show archived badge if archived */}
          {isEventArchived && (
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              {event.archiveReason === 'deleted_by_organizer' 
                ? '🗑️ Event Deleted by Organizer' 
                : '📅 Event Ended'}
            </span>
          )}
        </div>
        
        {/* Save/Like Button */}
        {!isEventArchived && (
          <button
            onClick={handleSaveEvent}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: isSaved ? '#ef4444' : 'white',
              color: isSaved ? 'white' : '#ef4444',
              border: `2px solid ${isSaved ? '#ef4444' : '#fca5a5'}`,
              borderRadius: 'var(--radius)',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              opacity: saving ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Heart 
              size={20} 
              fill={isSaved ? 'white' : 'none'}
            />
            {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save Event'}
          </button>
        )}
      </div>

      {/* Event Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '16px',
          background: 'var(--bg-light)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Calendar size={20} color="var(--primary)" />
            <strong>Date & Time</strong>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
            <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {new Date(event.date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div style={{
          padding: '16px',
          background: 'var(--bg-light)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin size={20} color="var(--primary)" />
            <strong>Venue</strong>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {event.location || "Not specified"}
          </p>
        </div>
      </div>

      {/* Event Description */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '12px' }}>About This Event</h3>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>{event.description}</p>
      </div>

      {/* Organizer Contact Info */}
      {event.creator && (
        <div style={{
          padding: '20px',
          background: 'var(--bg-light)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Contact Organizer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>Name:</strong> {event.creator.name || `${event.creator.firstName || ''} ${event.creator.lastName || ''}`.trim() || 'Organizer'}
            </p>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--primary)" />
              <a href={`mailto:${event.creator.email}`} style={{ color: 'var(--primary)' }}>
                {event.creator.email}
              </a>
            </p>
            {event.creator.phone && (
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--primary)" />
                <a href={`tel:${event.creator.phone}`} style={{ color: 'var(--primary)' }}>
                  {event.creator.phone}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {canEdit && isOrganizer && !isEventArchived && !isEventPast && (
          <>
            <Link to={`/events/${id}/edit`} className="button">
              Edit Event
            </Link>
            <button onClick={handleDelete} className="danger">
              Delete Event
            </button>
          </>
        )}
        {isEventArchived && canEdit && (
          <div style={{
            padding: '12px 16px',
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: 'var(--radius)',
            color: '#78350f',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            ℹ️ This event is archived and cannot be edited or deleted.
          </div>
        )}
        {!isEventArchived && isEventPast && canEdit && (
          <div style={{
            padding: '12px 16px',
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius)',
            color: '#991b1b',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
             Cannot delete or edit events that have already started or passed.
          </div>
        )}
        <Link to="/events" style={{ marginLeft: canEdit && isOrganizer && !isEventArchived && !isEventPast ? 'auto' : '0' }}>
          ← Back to Events
        </Link>
      </div>
    </div>
  );
}