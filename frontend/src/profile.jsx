import React from 'react';

function Profile({ user, allergens = [], onNext, t }) {
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
        <h1 style={{ color: '#5b8b53', marginBottom: '8px' }}>{t('profile_title')}</h1>
        <p style={{ color: '#a3a583', marginBottom: '18px' }}>
          {t('profile_desc')}
        </p>

        <div style={boxStyle}>
          <strong>{t('name_label')}</strong>
          <div style={{ marginTop: '8px' }}>{user?.name || t('not_set')}</div>
        </div>

        <div style={boxStyle}>
          <strong>{t('email_label')}</strong>
          <div style={{ marginTop: '8px' }}>{user?.email || user?.username || t('not_set')}</div>
        </div>

        <div style={boxStyle}>
          <strong>{t('allergens_label')}</strong>
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {allergens.length > 0
              ? allergens.map((a, i) => (
                  <span key={i} style={allergenPillStyle}>
                    {a.name || a} {a.severity ? `(${t(a.severity.toLowerCase())})` : ''}
                  </span>
                ))
              : t('no_allergens_saved')}
          </div>
        </div>

        <button
          onClick={() => onNext('known')}
          style={btnPrimary}
        >
          {t('edit_allergens')}
        </button>

        <button
          onClick={() => onNext('dashboard')}
          style={btnSecondary}
        >
          {t('back_home')}
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