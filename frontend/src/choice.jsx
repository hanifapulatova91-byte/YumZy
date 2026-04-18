import React from 'react';
import './choice.css';

const Choice = ({ onNext, onBack }) => {
  return (
    <div className="choice_container">
      <button onClick={onBack} className="back_btn1">← Back</button>
      <h2 className="choice_heading">How can we help?</h2>
      <div className="options_wrapper">
        <button onClick={() => onNext('known')} className="card_btn hover-green">
          <p className="card_title">I know my allergens</p>
          <p className="card_desc">I have a doctor's diagnosis.</p>
        </button>
        <button onClick={() => onNext('suspect')} className="card_btn hover-red">
          <p className="card_title">I'm not sure / Suspect</p>
          <p className="card_desc">I want to check probabilities.</p>
        </button>
      </div>
    </div>
  );
};

export default Choice;