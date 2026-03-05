import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import EventCard from './EventCard';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearby, setNearby] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // Get unique locations from events
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchQuery, dateFilter, locationFilter, sortBy]);

  useEffect(() => {
    // Extract unique cities/locations from events
    const uniqueLocations = [...new Set(
      events
        .map(event => {
          // Try to extract city from location string
          const loc = event.location?.toLowerCase() || '';
          // Remove coordinates if present
          const cleaned = loc.split(',')[0].trim();
          return cleaned;
        })
        .filter(loc => loc && !loc.match(/^\d/) && loc !== 'not specified')
    )].sort();
    
    setLocations(uniqueLocations);
  }, [events]);

  const fetchEvents = async (coords) => {
    setLoading(true);
    try {
      const url = coords ? `/events?lat=${coords.lat}&lng=${coords.lng}` : '/events';
      const res = await API.get(url);
      setEvents(res.data);
      setFilteredEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(event => 
        event.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= nextWeek;
      });
    } else if (dateFilter === 'month') {
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= nextMonth;
      });
    } else if (dateFilter === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.date) >= now);
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredEvents(filtered);
  };

  const findNearby = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearby(true);
        fetchEvents({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => alert('Location permission denied')
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setLocationFilter('');
    setSortBy('date');
    setNearby(false);
    fetchEvents();
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="toolbar">
        <h2>Discover Events</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          
          <button onClick={() => fetchEvents()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-section">
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search events by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="filter-group">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="filter-group">
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map((loc, index) => (
              <option key={index} value={loc}>
                {loc.charAt(0).toUpperCase() + loc.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="filter-group">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        {/* Reset Button */}
        {(searchQuery || dateFilter !== 'all' || locationFilter || sortBy !== 'date' || nearby) && (
          <button onClick={resetFilters} className="secondary-btn" style={{ whiteSpace: 'nowrap' }}>
            Reset Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        {loading ? (
          'Loading events...'
        ) : (
          <>
            Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events
            {nearby && ' near you'}
            {locationFilter && ` in ${locationFilter}`}
          </>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Filter size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 12px 0' }}>No events found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0' }}>
            Try adjusting your filters or search query
          </p>
          <button onClick={resetFilters}>Reset All Filters</button>
        </div>
      ) : (
        <div className="grid">
          {filteredEvents.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
}