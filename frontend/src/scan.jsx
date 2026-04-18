import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Html5QrcodeScanner } from 'html5-qrcode';

function Scan({ onNext }) {
  const [loading, setLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  useEffect(() => {
    let scanner = null;

    if (scannerActive) {
      scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 150 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScannerActive(false);
          checkProduct(decodedText);
        },
        (err) => {
          // ignore scan errors (they happen very frequently while looking for a barcode)
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error('Failed to clear scanner', e));
      }
    };
  }, [scannerActive]);

  const checkProduct = async (barcodeToScan) => {
    if (!barcodeToScan) return;
    setLoading(true);
    try {
      const data = await api.scan.processBarcode(barcodeToScan);
      onNext('scan_result', data);
    } catch (error) {
      alert(error.message || 'Error processing barcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #dff5e8 0%, #f5fbf7 100%)',
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
        <h1 style={{ color: '#6b946e', marginBottom: '8px' }}>Scan Product</h1>
        <p style={{ color: '#6b7280', lineHeight: '1.5', marginBottom: '20px' }}>
          Use your camera to scan a barcode, or enter it manually below.
        </p>

        {scannerActive ? (
          <div style={{ marginBottom: '20px' }}>
            <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
            <button onClick={() => setScannerActive(false)} style={{ ...btnSecondary, marginTop: '12px' }}>
              Cancel Camera
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => setScannerActive(true)} style={btnPrimary} disabled={loading}>
              Open Camera
            </button>
            <div style={{ textAlign: 'center', margin: '8px 0', color: '#9ca3af' }}>OR</div>
            <input
              type="text"
              placeholder="Enter Barcode manually"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={() => checkProduct(barcodeInput)}
              style={btnSecondaryLine}
              disabled={loading || !barcodeInput.trim()}
            >
              {loading ? 'Processing...' : 'Submit Manual Code'}
            </button>
          </div>
        )}

        <button
          onClick={() => onNext('dashboard')}
          style={btnSecondary}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

const btnPrimary = {
  width: '100%',
  background: '#5d8a60',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: '700',
  cursor: 'pointer',
};

const btnSecondaryLine = {
  ...btnPrimary,
  background: 'transparent',
  border: '2px solid #5d8a60',
  color: '#5d8a60',
};

const btnSecondary = {
  width: '100%',
  background: '#dff5e8',
  color: '#699664',
  border: 'none',
  borderRadius: '14px',
  padding: '14px',
  fontWeight: '700',
  cursor: 'pointer',
};

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '14px',
  border: '1px solid #d9e3dd',
  fontSize: '15px',
  boxSizing: 'border-box',
};

export default Scan;