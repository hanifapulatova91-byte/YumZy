import React, { useState } from 'react';
import { api } from './api';
import './checker.css';

const SymptomChecker = ({ onBack, onAddAllergen, t }) => {
  const [symptoms, setSymptoms] = useState('');
  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkProb = async () => {
    if (!symptoms.trim()) {
      alert(t('please_describe_symptoms'));
      return;
    }
    setLoading(true);
    try {
      const result = await api.checker.analyze(symptoms);
      setProbability(result);
    } catch (error) {
      alert(error.message || 'Error analyzing symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="symptom_container">
      <button onClick={onBack} className="back_btn1">← {t('back')}</button>
      <h2 className="symptom_title">{t('checker_title')}</h2>
      <textarea 
        className="symptom_input" 
        placeholder={t('checker_desc')}
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />
      <button onClick={checkProb} className="check_btn" disabled={loading}>
        {loading ? t('analyzing') : t('check_prob')}
      </button>

      {probability && (
        <div className="result_card">
          <div className="result_header">
            <h3 className="result_name">{probability.name}</h3>
            <span className="result_badge">{probability.percent} {t('likely')}</span>
          </div>
          <p className="result_note">{probability.note}</p>
          <button onClick={() => onAddAllergen(probability.name)} className="add_profilebtn">
            {t('add_profile')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;