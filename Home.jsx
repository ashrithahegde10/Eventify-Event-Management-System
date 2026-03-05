
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import EventCard from './EventCard';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, MapPin } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [popularEvents, setPopularEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero slides data - conditional based on user role
  const getHeroSlides = () => {
    const baseSlides = [
      {
        title: 'Discover Amazing Events',
        subtitle: 'Find workshops, meetups, and festivals happening near you',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
        cta: 'Explore Events',
        link: '/events',
      },
      {
        title: 'Connect with Your Community',
        subtitle: 'Join local events and make meaningful connections',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        cta: 'Find Nearby',
        link: '/events',
      },
    ];

    // Only add "Create Event" slide for organizers
    if (user && user.role === 'organizer') {
      baseSlides.splice(1, 0, {
        title: 'Create Your Own Events',
        subtitle: 'Share your passion and bring people together',
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200',
        cta: 'Create Event',
        link: '/events/new',
      });
    }

    return baseSlides;
  };

  const heroSlides = getHeroSlides();

  useEffect(() => {
    fetchEvents();
    
    // Auto-slide every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      const now = new Date();
      
      // Filter upcoming events (within next 30 days)
      const upcoming = res.data
        .filter((e) => {
          const eventDate = new Date(e.date);
          const daysDiff = (eventDate - now) / (1000 * 60 * 60 * 24);
          return daysDiff >= 0 && daysDiff <= 30;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6);

      // Popular events (you can sort by attendees or recent)
      const popular = res.data
        .sort((a, b) => (b.attendees || 0) - (a.attendees || 0))
        .slice(0, 6);

      setUpcomingEvents(upcoming);
      setPopularEvents(popular);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <div
        style={{
          position: 'relative',
          height: '500px',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '48px',
        }}
      >
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <h1 style={{ fontSize: '3.5rem', fontWeight: '700', margin: '0 0 16px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              {slide.title}
            </h1>
            <p style={{ fontSize: '1.3rem', margin: '0 0 32px 0', maxWidth: '600px', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              {slide.subtitle}
            </p>
            <Link
              to={slide.link}
              className="button"
              style={{
                padding: '14px 32px',
                fontSize: '1.1rem',
                backgroundColor: 'var(--primary)',
                border: 'none',
              }}
            >
              {slide.cta}
            </Link>
          </div>
        ))}

        {/* Navigation Arrows */}
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
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
        >
          <ChevronRight size={28} color="white" />
        </button>

        {/* Dots Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
          }}
        >
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '32px' : '12px',
                height: '12px',
                borderRadius: '6px',
                background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={28} color="var(--primary)" />
            Upcoming Events
          </h2>
          <Link to="/events" style={{ color: 'var(--primary)', fontWeight: '500' }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : upcomingEvents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No upcoming events in the next 30 days.</p>
          </div>
        ) : (
          <div className="grid">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Events Section */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={28} color="var(--primary)" />
            Popular Events
          </h2>
          <Link to="/events" style={{ color: 'var(--primary)', fontWeight: '500' }}>
            Explore More →
          </Link>
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : popularEvents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No popular events yet.</p>
          </div>
        ) : (
          <div className="grid">
            {popularEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section - Only for Organizers */}
      {user && user.role === 'organizer' && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, var(--primary), #9b7cff)',
            color: 'white',
            textAlign: 'center',
            padding: '60px 40px',
          }}
        >
          <h2 style={{ fontSize: '2rem', margin: '0 0 16px 0' }}>Ready to Create Your Own Event?</h2>
          <p style={{ fontSize: '1.1rem', margin: '0 0 32px 0', opacity: 0.9 }}>
            Share your passion with the community and bring people together
          </p>
          <Link
            to="/events/new"
            className="button"
            style={{ backgroundColor: 'white', color: 'var(--primary)', padding: '14px 32px', fontSize: '1.1rem' }}
          >
            Create Event Now
          </Link>
        </div>
      )}
    </div>
  );
}