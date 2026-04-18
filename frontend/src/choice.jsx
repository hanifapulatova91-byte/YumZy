import React from 'react';
import './choice.css';

const Choice = ({ onNext, onBack, t }) => {
  return (
    <div className="choice_container">
      <button onClick={onBack} className="back_btn1">← {t('back')}</button>
      <h2 className="choice_heading">{t('how_help')}</h2>
      <div className="options_wrapper">
        <button onClick={() => onNext('known')} className="card_btn hover-green">
          <p className="card_title">{t('know_allergens')}</p>
          <p className="card_desc">{t('know_desc')}</p>
        </button>
        <button onClick={() => onNext('suspect')} className="card_btn hover-red">
          <p className="card_title">{t('not_sure')}</p>
          <p className="card_desc">{t('not_sure_desc')}</p>
        </button>
      </div>
    </div>
  );
};

export default Choice;