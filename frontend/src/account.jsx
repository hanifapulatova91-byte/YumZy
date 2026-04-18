import React from 'react';
import './account.css';
import mascot from './assets/mascot.png';

const AccApp = ({ onNext }) => {
  return (
    <div className="account_container">
      <div className="account_header">
        <h1 className="account_title">
          YumZy <span className="star_icon">*</span>
        </h1>
        <p className="account_subtitle">Smart Food Safety Assistant</p>
      </div>

      <div className="image_wrapper">
        <img src={mascot} alt="YumZy Sloth" className="sloth_img" />
      </div>

      <div className="buttons">
        <button
          className="btn_google"
          onClick={() => onNext('login')}
        >
          <span>Log In</span>
        </button>

        <button
          className="btn_apple"
          onClick={() => onNext('signup')}
        >
          <span>Sign Up</span>
        </button>

        <button onClick={() => onNext('choice')} className="btn_guest">
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default AccApp;
