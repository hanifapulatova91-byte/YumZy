import React from 'react';
import './account.css';
import mascot from './assets/mascot.png';

const AccApp = ({ onNext, onGuest, user, t, lang, toggleLanguage }) => {
  const getDisplayName = (name) => {
    if (!name || name === "Guest") return 'Guest';
    if (!name.includes('@')) return name.split(' ')[0];
    return name.split('@')[0];
  };

  return (
    <div className="account_container">
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <button 
          onClick={toggleLanguage}
          style={{ 
            background: '#f0f9f1', 
            border: '1px solid #d9e3dd', 
            borderRadius: '8px', 
            padding: '6px 12px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4a6b4c',
            cursor: 'pointer'
          }}
        >
          {lang === 'en' ? 'O\'ZB' : 'ENG'}
        </button>
      </div>
      <div className="account_header">
        <h1 className="account_title">
          YumZy <span className="star_icon">*</span>
        </h1>
        <p className="account_subtitle">{t('smart_assistant') || 'Your Allergy Safe Assistant'}</p>
      </div>

      <div className="image_wrapper">
        <img src={mascot} alt="YumZy Sloth" className="sloth_img" />
      </div>

      <div className="buttons">
        {user && user.username ? (
          <>
            <button
              className="btn_google"
              style={{ background: '#6fa166', color: '#fff' }}
              onClick={() => onNext('dashboard')}
            >
              <span>Continue as {getDisplayName(user.name || user.username)}</span>
            </button>
            <button
              className="btn_apple"
              onClick={onGuest} 
            >
              <span>Switch Account</span>
            </button>
          </>
        ) : (
          <>
            <button
              className="btn_google"
              onClick={() => onNext('login')}
            >
              <span>{t('log_in') || 'Log In'}</span>
            </button>

            <button
              className="btn_apple"
              onClick={() => onNext('signup')}
            >
              <span>{t('sign_up') || 'Sign Up'}</span>
            </button>

            <button onClick={onGuest} className="btn_guest">
              {t('continue_guest') || 'Continue as Guest'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AccApp;
