import React, { useState } from 'react';
import { api } from './api';

function ScanResult({ scanData, onNext, allergens = [], t }) {
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);

  if (!scanData) {
    return (
      <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
        <h2>{t('no_scan_result')}</h2>
        <button onClick={() => onNext('scan')}>{t('go_back')}</button>
      </div>
    );
  }

  const { found, product, analysis, message } = scanData;

  const handleIngredientPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const allergenNames = allergens.map(a => typeof a === 'string' ? a : a.name);
      const result = await api.scan.analyzeImage(base64, allergenNames, scanData.barcode || '');
      
      // Navigate to scan_result with the new analysis data
      onNext('scan_result', result);
    } catch (err) {
      alert(err.message || 'Failed to analyze image');
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  if (!found) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #dff5e8 0%, #f5fbf7 100%)',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{
          maxWidth: '430px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
          <h2 style={{ color: '#e67e22', marginBottom: '8px' }}>{t('not_found')}</h2>
          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '24px' }}>
            {message || t('product_not_loaded')}
          </p>

          <div style={{
            background: '#f0fdf4',
            border: '2px dashed #5d8a60',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
            <p style={{ color: '#5d8a60', fontWeight: '600', marginBottom: '12px' }}>
              Take a photo of the ingredient list!
            </p>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
              Our AI will read the ingredients and check for allergens
            </p>
            <button
              onClick={() => document.getElementById('ingredient-photo').click()}
              style={{
                ...btnPrimary,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              disabled={analyzingPhoto}
            >
              {analyzingPhoto ? (
                <span>🔍 Analyzing ingredients...</span>
              ) : (
                <span>📷 Upload Ingredient Photo</span>
              )}
            </button>
            <input
              id="ingredient-photo"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleIngredientPhoto}
            />
          </div>

          <button onClick={() => onNext('scan')} style={btnSecondary}>
            ← {t('go_back')}
          </button>
        </div>
      </div>
    );
  }

  // Smart risk level: if AI says unsafe but found NO specific allergens, it's "caution" not "dangerous"
  const getRiskLevel = () => {
    if (analysis.riskLevel) return analysis.riskLevel;
    if (analysis.safe) return 'safe';
    // No specific allergens flagged = incomplete data = caution, not dangerous
    const hasRealFlags = analysis.allergenFlags?.length > 0 && 
      !analysis.allergenFlags.includes('System Error') &&
      analysis.allergenFlags[0] !== 'None';
    return hasRealFlags ? 'dangerous' : 'caution';
  };
  const riskLevel = getRiskLevel();
  const colorMap = { safe: '#638d63', caution: '#e67e22', dangerous: '#c0392b' };
  const labelMap = { safe: t('safe'), caution: t('caution'), dangerous: t('dangerous') };
  const emojiMap = { safe: '✅', caution: '⚠️', dangerous: '🚫' };
  const color = colorMap[riskLevel] || '#c0392b';
  const label = `${emojiMap[riskLevel] || ''} ${labelMap[riskLevel] || t('dangerous')}`;

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
        style={{
          maxWidth: '430px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ color: '#6f8f62' }}>{t('scan_result_title')}</h1>

        <div
          style={{
            border: `3px solid ${color}`,
            borderRadius: '18px',
            padding: '18px',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ color, fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
            {product.name}
          </div>
          {product.brand && <div style={{ fontSize: '14px', marginBottom: '8px' }}>{product.brand}</div>}
          <div style={{ color: '#a5a98f', lineHeight: '1.5' }}>
            {analysis.summary || (analysis.safe ? t('no_matched_allergens') : t('product_contains_allergens'))}
          </div>
        </div>

        {product.image && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img src={product.image} alt={product.name} style={{ maxWidth: '100px', borderRadius: '12px' }} />
          </div>
        )}

        <div style={boxStyle}>
          <strong>{t('ingredients')}:</strong>
          <div style={{ fontSize: '14px', marginTop: '6px' }}>{product.ingredients || t('not_listed')}</div>
        </div>

        <div style={boxStyle}>
          <strong>{t('allergen_flags')}:</strong>
          <div style={{ color: !analysis.safe ? '#c0392b' : 'inherit', fontWeight: !analysis.safe ? 'bold' : 'normal', marginTop: '6px' }}>
            {analysis.allergenFlags?.length > 0 ? analysis.allergenFlags.join(', ') : t('none')}
          </div>
        </div>

        {riskLevel !== 'safe' && analysis.safeAlternatives?.length > 0 && (
          <div style={{ ...boxStyle, border: '1px solid #689767', background: '#f5fbf7' }}>
            <strong style={{ color: '#5b7856' }}>🥗 {t('safe_alternatives')}:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {analysis.safeAlternatives.map((alt, idx) => (
                <span key={idx} style={{ background: '#dff5e8', color: '#5b7856', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                  {alt}
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => onNext('scan')} style={btnPrimary}>
          {t('scan_another')}
        </button>

        <button onClick={() => onNext('dashboard')} style={btnSecondary}>
          {t('back_home')}
        </button>
      </div>
    </div>
  );
}

const boxStyle = {
  background: '#f9fafb',
  borderRadius: '16px',
  padding: '14px',
  marginBottom: '12px',
};

const btnPrimary = {
  width: '100%',
  background: '#689767',
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
  color: '#5b7856',
  border: 'none',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: '700',
  cursor: 'pointer',
};

export default ScanResult;