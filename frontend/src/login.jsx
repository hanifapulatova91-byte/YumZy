import React, { useState } from 'react';
import { api } from './api';
import './account.css';
import mascot from './assets/mascot.png';

function Login({ onNext, onLoginSuccess, t }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert(t('fill_fields'));
      return;
    }

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    setLoading(true);

    try {
      // We map 'email' to 'username' as the backend expects 'username'
      const data = await api.auth.login(cleanEmail, cleanPassword);
      
      // Save token to localStorage for authenticated requests
      localStorage.setItem('yumzy_token', data.token);
      localStorage.setItem('yumzy_user', JSON.stringify({ name: data.username, ...data }));
      
      onLoginSuccess({ name: data.username, ...data });
      onNext('choice'); // or whatever view comes next
    } catch (error) {
      alert(error.message || t('incorrect_credentials'));
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
        <p className="account_subtitle">Log in to continue</p>
      </div>

      <div className="image_wrapper">
        <img src={mascot} alt="YumZy mascot" className="sloth_img" />
      </div>

      <div className="buttons">
        <input
          type="email"
          placeholder={t('email_label')}
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
          onClick={handleLogin}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>

        <p className="footer_text">
          Don’t have an account?{' '}
          <span
            className="link"
            onClick={() => onNext('signup')}
            style={{ cursor: 'pointer' }}
          >
            Sign Up
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

export default Login;