import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ALLERGENS } from '../utils/allergenAnalyzer';

const SEVERITIES = ['None', 'Mild', 'Moderate', 'Severe', 'Life-Threatening'];

export const AllergenTestPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const { saveProfile } = useUserProfile();
  const navigate = useNavigate();

  const handleSelect = (severity) => {
    const allergen = ALLERGENS[currentIndex];
    const score = SEVERITIES.indexOf(severity);
    const newSelections = { ...selections, [allergen]: { severity, score } };
    setSelections(newSelections);

    if (currentIndex < ALLERGENS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      saveProfile(newSelections);
      navigate('/scanner');
    }
  };

  const currentAllergen = ALLERGENS[currentIndex];
  const progress = ((currentIndex) / ALLERGENS.length) * 100;

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: '500px' }}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <h2>Allergen Severity Test</h2>
        <p className="counter">Question {currentIndex+1} of {ALLERGENS.length}</p>
        <h3 className="allergen-name">{currentAllergen}</h3>
        <p>How severe is your reaction?</p>
        <div className="severity-buttons">
          {SEVERITIES.map(sev => (
            <button 
              key={sev}
              onClick={() => handleSelect(sev)}
              className={`severity-btn ${sev.toLowerCase()}`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};