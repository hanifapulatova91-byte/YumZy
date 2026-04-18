import React, { useState } from 'react';
import { api } from './api';
import './account.css';
import mascot from './assets/mascot.png';

function Signup({ onNext, onSignupSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in your name, email, and password.');
      return;
    }

    setLoading(true);
    try {
      // Map email to username for the backend
      const data = await api.auth.register(email.trim(), password.trim());
      
      // Save token
      localStorage.setItem('yumzy_token', data.token);
      localStorage.setItem('yumzy_user', JSON.stringify({ name: name.trim(), ...data }));
      
      onSignupSuccess({ name: name.trim(), ...data });
      onNext('choice');
    } catch (error) {
      alert(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account_container">
      <div className="account_header">
        <h1 className="account_title">
          YumZy <span className="star_icon">*</span>
        </h1>
        <p className="account_subtitle">Create your account</p>
      </div>

      <div className="image_wrapper">
        <img src={mascot} alt="YumZy mascot" className="sloth_img" />
      </div>

      <div className="buttons">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Username or Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button 
          className="btn_guest" 
          onClick={handleSignup} 
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="footer_text">
          Already have an account?{' '}
          <span
            className="link"
            onClick={() => onNext('login')}
            style={{ cursor: 'pointer' }}
          >
            Log In
          </span>
        </p>

        <p className="footer_text">
          <span
            className="link"
            onClick={() => onNext('landing')}
            style={{ cursor: 'pointer' }}
          >
            Back
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '14px',
  border: '1px solid #d9e3dd',
  marginBottom: '12px',
  fontSize: '15px',
  boxSizing: 'border-box',
};

export default Signup;