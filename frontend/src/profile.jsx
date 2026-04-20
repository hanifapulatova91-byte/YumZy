import React, { useState } from 'react';
import { api } from './api';

function Profile({ user, setUser, allergens = [], onNext, onLogout, t }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      const updatedUser = await api.auth.updateName(editName);
      
      // Update local storage and app state
      const existingData = JSON.parse(localStorage.getItem('yumzy_user') || '{}');
      const newData = { ...existingData, ...updatedUser };
      localStorage.setItem('yumzy_user', JSON.stringify(newData));
      if (setUser) setUser(newData);
      
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5fbf7',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px',
        }}
      >
        <h1 style={{ color: '#5b8b53', marginBottom: '8px' }}>{t('profile_title') || 'My Profile'}</h1>
        <p style={{ color: '#a3a583', marginBottom: '18px' }}>
          {t('profile_desc') || 'Manage your account'}
        </p>

        <div style={boxStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{t('name_label') || 'Name'}</strong>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                style={{ background: 'none', border: 'none', color: '#6fa166', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Edit
              </button>
            ) : (
              <div>
                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginRight: '8px' }}>Cancel</button>
                <button onClick={handleSaveName} disabled={loading} style={{ background: '#6fa166', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <input 
              value={editName}
              onChange={e => setEditName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          ) : (
            <div style={{ marginTop: '8px' }}>{user?.name || t('not_set') || 'Not set'}</div>
          )}
        </div>

        <div style={boxStyle}>
          <strong>{t('email_label') || 'Email'}</strong>
          <div style={{ marginTop: '8px' }}>{user?.email || user?.username || t('not_set') || 'Not set'}</div>
        </div>

        <div style={boxStyle}>
          <strong>{t('allergens_label') || 'Allergens'}</strong>
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {allergens.length > 0
              ? allergens.map((a, i) => (
                  <span key={i} style={allergenPillStyle}>
                    {a.name || a} {a.severity ? `(${t(a.severity.toLowerCase())})` : ''}
                  </span>
                ))
              : t('no_allergens_saved') || 'No allergens'}
          </div>
        </div>

        <button
          onClick={() => onNext('known')}
          style={btnPrimary}
        >
          {t('edit_allergens') || 'Edit Allergens'}
        </button>

        <button
          onClick={() => onNext('dashboard')}
          style={btnSecondary}
        >
          {t('back_home') || 'Back'}
        </button>

        <button
          onClick={onLogout}
          style={{ ...btnSecondary, background: '#fee2e2', color: '#ef4444', marginTop: '12px' }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

const boxStyle = {
  background: '#f9fafb',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '14px',
};

const btnPrimary = {
  width: '100%',
  background: '#6fa166',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: '700',
  cursor: 'pointer',
  marginBottom: '12px',
};

const btnSecondary = {
  width: '100%',
  background: '#dff5e8',
  color: 'hsl(109, 25%, 46%)',
  border: 'none',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: '700',
  cursor: 'pointer',
};

const allergenPillStyle = {
  background: '#eef7ee',
  color: '#5b8b53',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  border: '1px solid #d4ebd4'
};

export default Profile;