import React from 'react';
import './account.css';
import mascot from './assets/mascot.png';

const AccApp = ({ onNext, onGuest, t, lang, toggleLanguage }) => {
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
        <p className="account_subtitle">{t('smart_assistant')}</p>
      </div>

      <div className="image_wrapper">
        <img src={mascot} alt="YumZy Sloth" className="sloth_img" />
      </div>

      <div className="buttons">
        <button
          className="btn_google"
          onClick={() => onNext('login')}
        >
          <span>{t('log_in')}</span>
        </button>

        <button
          className="btn_apple"
          onClick={() => onNext('signup')}
        >
          <span>{t('sign_up')}</span>
        </button>

        <button onClick={onGuest} className="btn_guest">
          {t('continue_guest')}
        </button>
      </div>
    </div>
  );
};

export default AccApp;
