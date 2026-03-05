import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import EventForm from './components/EventForm';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import SavedEvents from './components/SavedEvents';
import Notifications from './components/Notifications';
import ArchivedEvents from './components/ArchivedEvents';
import { AuthContext } from './context/AuthContext';

// Protected Route Component for Organizers
function OrganizerRoute({ children }) {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'organizer') {
    alert('Only organizers can access this page');
    return <Navigate to="/events" replace />;
  }
  
  return children;
}

// Protected Route for Authenticated Users
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Protected Events Routes */}
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <EventList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events/:id" 
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/events/new" 
            element={
              <OrganizerRoute>
                <EventForm />
              </OrganizerRoute>
            } 
          />
          <Route 
            path="/events/:id/edit" 
            element={
              <OrganizerRoute>
                <EventForm editMode />
              </OrganizerRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/edit" 
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/saved-events" 
            element={
              <ProtectedRoute>
                <SavedEvents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/archived-events" 
            element={
              <OrganizerRoute>
                <ArchivedEvents />
              </OrganizerRoute>
            } 
          />
        </Routes>
        <footer className="footer">© 2025 Eventify. All rights reserved.</footer>
      </main>
    </div>
  );
}