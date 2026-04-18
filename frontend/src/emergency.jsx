import React, { useEffect, useState } from 'react';

function Emergency({ onBack, userAllergens = [] }) {
  const [doctorNumber, setDoctorNumber] = useState('');
  const [contact1Name, setContact1Name] = useState('');
  const [contact1Number, setContact1Number] = useState('');
  const [contact2Name, setContact2Name] = useState('');
  const [contact2Number, setContact2Number] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('yumzy_emergency_info');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDoctorNumber(data.doctorNumber || '');
        setContact1Name(data.contact1Name || '');
        setContact1Number(data.contact1Number || '');
        setContact2Name(data.contact2Name || '');
        setContact2Number(data.contact2Number || '');
      } catch {}
    }
  }, []);

  const saveContacts = () => {
    const data = {
      doctorNumber,
      contact1Name,
      contact1Number,
      contact2Name,
      contact2Number,
    };

    localStorage.setItem('yumzy_emergency_info', JSON.stringify(data));
    alert('Emergency contacts saved.');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff5f5',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '430px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ color: '#c0392b', marginBottom: '10px' }}>
          Emergency Help
        </h1>

        <p style={{ color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
          If you are experiencing a severe allergic reaction, seek urgent medical help immediately.
        </p>

        <a
          href="tel:911"
          style={redButton}
        >
          Call 911 Now
        </a>

        {doctorNumber && (
          <a href={`tel:${doctorNumber}`} style={greenButton}>
            Call Doctor ({doctorNumber})
          </a>
        )}

        {contact1Number && (
          <a href={`tel:${contact1Number}`} style={greenButton}>
            Call {contact1Name || 'Close Contact 1'} ({contact1Number})
          </a>
        )}

        {contact2Number && (
          <a href={`tel:${contact2Number}`} style={greenButton}>
            Call {contact2Name || 'Close Contact 2'} ({contact2Number})
          </a>
        )}

        <div style={cardRed}>
          <strong style={{ color: '#c0392b' }}>Watch for severe symptoms</strong>
          <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
            Trouble breathing, swelling of lips or throat, fainting, severe dizziness,
            repeated vomiting, or collapse.
          </p>
        </div>

        <div style={cardYellow}>
          <strong>Immediate steps</strong>
          <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
            1. Stop eating the food.<br />
            2. Use prescribed emergency medicine if available.<br />
            3. Call 911 immediately.<br />
            4. Stay with a trusted person until help arrives.
          </p>
        </div>

        <div style={cardGray}>
          <strong>Your Allergens</strong>
          <div style={{ marginTop: '8px' }}>
            {userAllergens.length > 0
              ? userAllergens.map((a) => a.name || a).join(', ')
              : 'No allergens saved'}
          </div>
        </div>

        <div style={cardGray}>
          <strong>Doctor number</strong>
          <input
            value={doctorNumber}
            onChange={(e) => setDoctorNumber(e.target.value)}
            placeholder="Doctor phone number"
            style={inputStyle}
          />
        </div>

        <div style={cardGray}>
          <strong>Close contact 1</strong>
          <input
            value={contact1Name}
            onChange={(e) => setContact1Name(e.target.value)}
            placeholder="Name"
            style={inputStyle}
          />
          <input
            value={contact1Number}
            onChange={(e) => setContact1Number(e.target.value)}
            placeholder="Phone number"
            style={inputStyle}
          />
        </div>

        <div style={cardGray}>
          <strong>Close contact 2</strong>
          <input
            value={contact2Name}
            onChange={(e) => setContact2Name(e.target.value)}
            placeholder="Name"
            style={inputStyle}
          />
          <input
            value={contact2Number}
            onChange={(e) => setContact2Number(e.target.value)}
            placeholder="Phone number"
            style={inputStyle}
          />
        </div>

        <button onClick={saveContacts} style={saveButton}>
          Save Emergency Contacts
        </button>

        <button onClick={onBack} style={backButton}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

const redButton = {
  display: 'block',
  width: '100%',
  background: '#c0392b',
  color: 'white',
  textDecoration: 'none',
  textAlign: 'center',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const greenButton = {
  display: 'block',
  width: '100%',
  background: '#6b986e',
  color: 'white',
  textDecoration: 'none',
  textAlign: 'center',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const saveButton = {
  width: '100%',
  background: '#6f915f',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginBottom: '12px',
};

const backButton = {
  width: '100%',
  background: '#dff5e8',
  color: '#5a7658',
  border: 'none',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const inputStyle = {
  width: '100%',
  marginTop: '10px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid #ddd',
  boxSizing: 'border-box',
};

const cardRed = {
  background: '#ffeaea',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '16px',
};

const cardYellow = {
  background: '#fff3cd',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '16px',
};

const cardGray = {
  background: '#f9fafb',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '16px',
};

export default Emergency;