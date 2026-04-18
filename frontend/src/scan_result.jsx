import React from 'react';

function ScanResult({ scanData, onNext }) {
  if (!scanData) {
    return (
      <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
        <h2>No scan result found.</h2>
        <button onClick={() => onNext('scan')}>Go Back</button>
      </div>
    );
  }

  const { found, product, analysis, message } = scanData;

  if (!found) {
    return (
      <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ color: '#c0392b' }}>Not Found</h2>
        <p>{message || "Product couldn't be loaded."}</p>
        <button onClick={() => onNext('scan')}>Go Back</button>
      </div>
    );
  }

  const color = analysis.safe ? '#638d63' : '#c0392b';
  const label = analysis.safe ? 'SAFE' : 'DANGEROUS';

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
        <h1 style={{ color: '#6f8f62' }}>Scan Result</h1>

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
            {analysis.summary || (analysis.safe ? 'No matched allergens were detected.' : 'This product contains allergens.')}
          </div>
        </div>

        {product.image && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img src={product.image} alt={product.name} style={{ maxWidth: '100px', borderRadius: '12px' }} />
          </div>
        )}

        <div style={boxStyle}>
          <strong>Ingredients:</strong>
          <div style={{ fontSize: '14px', marginTop: '6px' }}>{product.ingredients || 'Not listed'}</div>
        </div>

        <div style={boxStyle}>
          <strong>Allergen Flags:</strong>
          <div style={{ color: !analysis.safe ? '#c0392b' : 'inherit', fontWeight: !analysis.safe ? 'bold' : 'normal', marginTop: '6px' }}>
            {analysis.allergenFlags?.length > 0 ? analysis.allergenFlags.join(', ') : 'None'}
          </div>
        </div>

        <button onClick={() => onNext('scan')} style={btnPrimary}>
          Scan Another Product
        </button>

        <button onClick={() => onNext('dashboard')} style={btnSecondary}>
          Back to Home
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