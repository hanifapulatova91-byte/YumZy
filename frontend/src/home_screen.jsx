import React, { useState } from "react";
import './home_screen.css';

import userIcon from './assets/user.png';
import barcodeIcon from './assets/barcode.png';
import chatIcon from './assets/chat.png';
import homeIcon from './assets/home.png';
import noteIcon from './assets/note.png';
import insuranceIcon from './assets/insurance.png';
import qrIcon from './assets/qr.png';
import slothHead from './assets/aiMascot.png';
import phoneIcon from './assets/viber.png';

const Dashboard = ({ userName = "Guest", onNext, t }) => {
  const getDisplayName = (name) => {
    if (!name || name === "Guest") return 'Guest';
    
    // If name contains @, it's just an email. Clean the prefix.
    // If it's a real name, take the first name
    if (!name.includes('@')) {
      const firstName = name.split(' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    
    // If name contains @, it's an email. Clean the prefix.
    const part = name.split('@')[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  };
  const [activeTab, setActiveTab] = useState('home');

  const goTo = (tab) => {
    setActiveTab(tab);

    if (tab === 'home') onNext('dashboard');
    if (tab === 'scan') onNext('scan');
    if (tab === 'chat') onNext('chat');
    if (tab === 'profile') onNext('profile');
  };

  return (
    <div className="dashboard_wrapper">
      <header className="main_header">
        <h1 className="user_greeting">{t('greeting')}, {getDisplayName(userName)}!</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="avatar_circle" onClick={() => onNext('profile')}>
            <img src={userIcon} alt="User" />
          </div>
        </div>
      </header>

      <section className="feature_section">
        <div className="card_wide scan_bg" onClick={() => onNext('scan')}>
          <div className="card_icon_box">
            <img src={barcodeIcon} alt="Scan" />
          </div>
          <div className="card_content">
            <h3>{t('scanner')}</h3>
            <p>{t('scan_product')}</p>
          </div>
        </div>

        <div className="card_wide ai_bg" onClick={() => onNext('chat')}>
          <div className="card_content">
            <h3>{t('chat')}</h3>
            <p>{t('recipes')} & Diet</p>
          </div>
          <img src={slothHead} alt="Sloth" className="floating_sloth" />
        </div>
      </section>

      <div className="action_grid">
        <div className="small_card" onClick={() => onNext('recipe')}>
          <div className="small_icon_bg green_light">✨</div>
          <span>{t('recipes')}</span>
        </div>
        <div className="small_card" onClick={() => onNext('notes')}>
          <div className="small_icon_bg yellow_light"><img src={noteIcon} alt="" /></div>
          <span>{t('notes')}</span>
        </div>
        <div className="small_card" onClick={() => onNext('articles')}>
          <div className="small_icon_bg blue_light"><img src={qrIcon} alt="" /></div>
          <span>{t('articles')}</span>
        </div>
      </div>

      <button className="sos_button" onClick={() => onNext('emergency')}>
        <img src={phoneIcon} alt="" style={{ width: '24px' }} /> {t('emergency')}
      </button>

      <nav className="dock_nav">
        <button
          className={`nav_link ${activeTab === 'home' ? 'active' : ''}`}
          data-label="Home"
          onClick={() => goTo('home')}
        >
          <img src={homeIcon} alt="Home" />
        </button>

        <button
          className={`nav_link ${activeTab === 'scan' ? 'active' : ''}`}
          data-label="Scan"
          onClick={() => goTo('scan')}
        >
          <img src={barcodeIcon} alt="Scan" />
        </button>

        <button
          className={`nav_link ${activeTab === 'chat' ? 'active' : ''}`}
          data-label="Chat"
          onClick={() => goTo('chat')}
        >
          <img src={chatIcon} alt="Chat" />
        </button>

        <button
          className={`nav_link ${activeTab === 'profile' ? 'active' : ''}`}
          data-label="Me"
          onClick={() => goTo('profile')}
        >
          <img className="user_icon" src={userIcon} alt="Profile" />
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;