import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';

// Backend API URL
const API_BASE_URL = "http://localhost:5000";

export default function EventCard({ event }) {
  const imageUrl =
    event.media && event.media.length > 0
      ? `${API_BASE_URL}${event.media[0].url}`
      : "https://via.placeholder.com/400x200?text=No+Image";

  return (
    <article className="event-card">
      <img
        src={imageUrl}
        alt={event.title}
        style={{
          width: "100%",
          borderRadius: "12px",
          objectFit: "cover",
        }}
      />
      <div className="card-body">
        <h3>{event.title}</h3>
        <p className="muted">{event.description?.slice(0, 80)}...</p>

        <div className="event-meta">
          <p>
            <Calendar size={14} />{" "}
            {new Date(event.date).toLocaleDateString()}
          </p>
          <p>
            <MapPin size={14} /> {event.location}
          </p>
          {event.attendees && (
            <p>
              <Users size={14} /> {event.attendees} attendees
            </p>
          )}
        </div>

        <Link to={`/events/${event._id}`} className="card-link">
          View Details →
        </Link>
      </div>
    </article>
  );
}
