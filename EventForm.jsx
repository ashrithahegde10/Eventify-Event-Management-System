import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";

export default function EventForm({ editMode = false }) {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  const [form, setForm] = useState({
    title: "",
    date: "",
    description: "",
    location: "",
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if user is organizer
  useEffect(() => {
    if (user && user.role !== "organizer") {
      alert("Only organizers can create or edit events");
      nav("/events");
    }
  }, [user, nav]);

  // Load existing event for edit mode
  useEffect(() => {
    if (editMode && id) loadEvent();
  }, [editMode, id]);

  const loadEvent = async () => {
    try {
      const res = await API.get(`/events/${id}`);
      const eventData = res.data;

      // Check if user is the creator
      if (eventData.creator._id !== user.id && eventData.creator !== user.id) {
        alert("You can only edit your own events");
        nav("/events");
        return;
      }

      setForm({
        title: eventData.title || "",
        date: eventData.date
          ? new Date(eventData.date).toISOString().slice(0, 16)
          : "",
        description: eventData.description || "",
        location: eventData.location || "",
      });
    } catch (err) {
      console.error("Error loading event:", err);
      alert("Failed to load event");
      nav("/events");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => setMediaFiles([...e.target.files]);

  const fillLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation unsupported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          location: `${pos.coords.latitude.toFixed(
            5
          )}, ${pos.coords.longitude.toFixed(5)}`,
        }));
      },
      () => alert("Permission denied")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("date", form.date);
      payload.append("description", form.description);
      payload.append("location", form.location);

      mediaFiles.forEach((file) => payload.append("media", file));

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`, // IMPORTANT
        },
      };

      if (editMode) {
        await API.put(`/events/${id}`, payload, config);
        alert("Event updated successfully!");
        nav(`/events/${id}`);
      } else {
        const response = await API.post("/events", payload, config);
        alert("Event created successfully!");
        nav(`/events/${response.data.event._id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save event.");
    }

    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>{editMode ? "Edit Event" : "Create New Event"}</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Event Title *
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g., Tech Conference 2025"
          />
        </label>

        <label>
          Date & Time *
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Location / Venue *
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Mumbai Convention Center or coordinates"
            required
          />
        </label>

        <button
          type="button"
          onClick={fillLocation}
          style={{ alignSelf: "flex-start" }}
        >
          📍 Use My Current Location
        </button>

        <label>
          Event Description *
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={6}
            placeholder="Describe your event in detail..."
          />
        </label>

        <label>
          Upload Media (Images / Videos)
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFiles}
          />
          {mediaFiles.length > 0 && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                margin: "8px 0 0 0",
              }}
            >
              {mediaFiles.length} file(s) selected
            </p>
          )}
        </label>

        <div className="form-actions">
          <button
            type="submit"
            className="button"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Saving..." : editMode ? "Update Event" : "Create Event"}
          </button>
          <button
            type="button"
            onClick={() => nav(editMode ? `/events/${id}` : "/events")}
            style={{ background: "#6b7280" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
