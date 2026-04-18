import React, { useState } from 'react';
import './checker.css';

const SymptomChecker = ({ onBack, onAddAllergen }) => {
  const [symptoms, setSymptoms] = useState('');
  const [probability, setProbability] = useState(null);

  const checkProb = () => {
    setProbability({ name: "Dairy", percent: "75%", note: "Symptoms often follow lactose intake." });
  };

  return (
    <div className="symptom_container">
      <button onClick={onBack} className="back_btn1">← Back</button>
      <h2 className="symptom_title">Symptom Checker</h2>
      <textarea 
        className="symptom_input" 
        placeholder="Describe your reaction..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />
      <button onClick={checkProb} className="check_btn">Check Probability</button>

      {probability && (
        <div className="result_card">
          <div className="result_header">
            <h3 className="result_name">{probability.name}</h3>
            <span className="result_badge">{probability.percent} Likely</span>
          </div>
          <p className="result_note">{probability.note}</p>
          <button onClick={() => onAddAllergen(probability.name)} className="add_profilebtn">
            Add to Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;