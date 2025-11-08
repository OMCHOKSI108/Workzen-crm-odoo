import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/http';

export default function SignUp() {
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState(null);
  const [generatedLoginId, setGeneratedLoginId] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const generateLoginId = (firstName, lastName) => {
    if (!firstName || !lastName) return '';
    
    const currentYear = new Date().getFullYear();
    
    // Get first 2 letters from first name and last name
    const firstInitials = firstName.substring(0, 2).toUpperCase();
    const lastInitials = lastName.substring(0, 2).toUpperCase();
    
    // Generate random 4-digit serial number
    const serial = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    // Format: OI + initials + year + serial
    return `OI${firstInitials}${lastInitials}${currentYear}${serial}`;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Auto-generate Login ID when first or last name changes
    if (name === 'firstName' || name === 'lastName') {
      const firstName = name === 'firstName' ? value : formData.firstName;
      const lastName = name === 'lastName' ? value : formData.lastName;
      if (firstName && lastName) {
        setGeneratedLoginId(generateLoginId(firstName, lastName));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Call backend API
      const response = await api.post('/auth/register', {
        companyName: formData.companyName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        loginId: generatedLoginId,
        role: 'admin' // First user is admin
      });
      
      if (response.data.success) {
        alert(
          `Account created successfully!\n\n` +
          `Login ID: ${response.data.data.loginId}\n` +
          `Email: ${formData.email}\n\n` +
          `You can now login with these credentials.`
        );
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
      alert(errorMessage);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: '100%',
          padding: '2.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
            Create Your Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            Register your company with WorkZen HRMS
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Company Logo Upload */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <label
              htmlFor="logo-upload"
              style={{
                display: 'inline-block',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  border: '2px dashed var(--gray-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: logoPreview ? 'transparent' : 'var(--gray-50)',
                  backgroundImage: logoPreview ? `url(${logoPreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  margin: '0 auto',
                  transition: 'all 0.3s ease',
                }}
              >
                {!logoPreview && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Upload Logo</div>
                  </div>
                )}
              </div>
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
              Click to upload company logo (optional)
            </p>
          </div>

          {/* Company Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., WorkZen India Pvt Ltd"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.companyName ? '2px solid var(--danger-color)' : '1px solid var(--gray-300)',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            />
            {errors.companyName && (
              <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                {errors.companyName}
              </p>
            )}
          </div>

          {/* Name Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Rajesh"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.firstName ? '2px solid var(--danger-color)' : '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
              {errors.firstName && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Kumar"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.lastName ? '2px solid var(--danger-color)' : '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
              {errors.lastName && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Auto-generated Login ID Display */}
          {generatedLoginId && (
            <div
              style={{
                backgroundColor: '#10b98110',
                border: '2px solid var(--success-color)',
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                Your Auto-Generated Login ID
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success-color)' }}>
                {generatedLoginId}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                This ID will be sent to your email after registration
              </p>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="rajesh.kumar@company.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.email ? '2px solid var(--danger-color)' : '1px solid var(--gray-300)',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            />
            {errors.email && (
              <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.phone ? '2px solid var(--danger-color)' : '1px solid var(--gray-300)',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            />
            {errors.phone && (
              <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.password ? '2px solid var(--danger-color)' : '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
              {errors.password && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.confirmPassword ? '2px solid var(--danger-color)' : '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
              {errors.confirmPassword && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            Create Account
          </button>

          {/* Login Link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            Already have an account?{' '}
            <a
              href="/login"
              style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
