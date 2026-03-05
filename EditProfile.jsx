
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';

export default function EditProfile() {
  const { user, updateUser } = useContext(AuthContext);
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!user) {
      nav('/login');
      return;
    }

    // Load user data
    fetchUserProfile();
  }, [user, nav]);

  const fetchUserProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      const userData = res.data.user;
      
      setForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        addressLine1: userData.address?.addressLine1 || '',
        addressLine2: userData.address?.addressLine2 || '',
        landmark: userData.address?.landmark || '',
        city: userData.address?.city || '',
        state: userData.address?.state || '',
        pincode: userData.address?.pincode || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.put('/auth/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || null,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        landmark: form.landmark,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });

      if (response.data.success) {
        // Update user in context
        updateUser(response.data.user);
        setSuccess('Profile updated successfully!');
        
        // Show success popup and redirect
        setTimeout(() => {
          alert(' Profile updated successfully!');
          nav('/profile');
        }, 500);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Edit Account Details</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Update your personal information and address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {/* Personal Information Section */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-light)',
            borderRadius: 'var(--radius)',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <User size={20} color="var(--primary)" />
              Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <label>
                First Name *
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter First Name"
                />
              </label>

              <label>
                Last Name *
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter Last Name"
                />
              </label>
            </div>

            <label style={{ marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} />
                Email Address
              </span>
              <input
                type="email"
                value={user.email}
                disabled
                style={{ 
                  background: '#f3f4f6', 
                  cursor: 'not-allowed',
                  color: 'var(--text-muted)'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Email cannot be changed
              </span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} />
                  Phone Number
                </span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                />
              </label>

              <label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} />
                  Date of Birth
                </span>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </label>
            </div>
          </div>

          {/* Address Section */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-light)',
            borderRadius: 'var(--radius)',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MapPin size={20} color="var(--primary)" />
              Address Details
            </h3>

            <label style={{ marginBottom: '16px' }}>
              Address Line 1 *
              <input
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="Enter Address Line 1"
                required
              />
            </label>

            <label style={{ marginBottom: '16px' }}>
              Address Line 2
              <input
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder="Enter Address Line 2"
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <label>
                Landmark
                <input
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                  placeholder="Enter Landmark"
                />
              </label>

              <label>
                Pin Code *
                <input
                  name="pincode"
                  type="text"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="Enter Pin Code"
                  maxLength={6}
                  required
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                City *
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter City"
                  required
                />
              </label>

              <label>
                State *
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter State"
                  required
                />
              </label>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="error" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: 'var(--radius)',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => nav('/profile')}
              style={{ background: '#6b7280', order: 2 }}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1, order: 1 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Terms */}
          <div style={{ 
            marginTop: '24px', 
            textAlign: 'center', 
            fontSize: '0.85rem', 
            color: 'var(--text-muted)' 
          }}>
            By proceeding, I agree to{' '}
            <a href="#" style={{ color: 'var(--primary)' }}>Terms & Conditions</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--primary)' }}>Privacy Policy</a>
          </div>
        </form>
      </div>
    </div>
  );
}