import React, { useState } from 'react';
import { api } from './api';
import './allergen_manage.css';
import Dashboard from './home_screen';

const AllergenManager = ({ allergens, setAllergens, onBack, onFinish, t }) => {
  const [inputValue, setInputValue] = useState('');
  const commonSuggestions = ["Peanuts", "Soy", "Seafood", "Dairy", "Fish", "Gluten"];

  // Logic remains the same...
  const addAllergen = (name) => {
    if (!name) return;
    if (!allergens.find(a => a.name.toLowerCase() === name.toLowerCase())) {
      setAllergens([...allergens, { name, severity: 'MODERATE' }]);
    }
    setInputValue('');
  };

  const updateSeverity = (index, level) => {
    const updated = [...allergens];
    updated[index].severity = level;
    setAllergens(updated);
  };

  const removeAllergen = (index) => {
    setAllergens(allergens.filter((_, idx) => idx !== index));
  };

  const [isExploding, setIsExploding] = useState(false);

  const handleFinishClick = async () => {
    setIsExploding(true);
    try {
      await api.profile.saveQuiz({ 
        quizAnswers: {}, 
        allergens: allergens.map(a => a.name)
      });
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
    setTimeout(() => {
      onFinish(); 
    }, 350);
  };

  return (
    <div className={`manager_cont ${isExploding ? 'page-exit' : ''}`}>
      <button onClick={onBack} className="back_btn1">← {t('back')}</button>
      
      <h2 className="manager_title">{t('manager_title')}</h2>
      
      <div className="input_group">
        <input 
          className="text_input" 
          placeholder={t('add_new')} 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={() => addAllergen(inputValue)} className="add_btn">+</button>
      </div>

      <div className="sug_sec">
        <p className="sec_label">{t('common_suspects')}</p>
        <div className="pill_cont">
          {commonSuggestions.map((item) => (
            <button 
              key={item}
              onClick={() => addAllergen(item)}
              className="sug_pill"
            >
              + {item}
            </button>
          ))}
        </div>
      </div>

      <div className="alle_list">
        {allergens.map((a, i) => (
          <div key={i} className="alle_card">
            <div className="card_header">
              <span className="alle_name">{a.name}</span>
              <button onClick={() => removeAllergen(i)} className="delete_btn">✕</button>
            </div>
            <div className="severity_toggle">
              {['MODERATE', 'MEDIUM', 'SEVERE'].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => updateSeverity(i, lvl)}
                  className={`sev_btn ${a.severity === lvl ? 'active' : ''}`}
                >
                  {t(lvl.toLowerCase())}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allergens.length > 0 && (
        <button onClick={handleFinishClick} className={`finish_btn ${isExploding ? 'exploding' : ''}`}> 
          {t('save_finish')}
        </button>
      )}
    </div>
  );
};

export default AllergenManager;