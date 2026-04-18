import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Html5Qrcode } from 'html5-qrcode';

function Scan({ onNext, allergens = [], t }) {
  const [loading, setLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  useEffect(() => {
    let html5QrCode = null;

    if (scannerActive) {
      html5QrCode = new Html5Qrcode("reader");
      const config = { fps: 20, qrbox: { width: 280, height: 180 } };

      const startScanner = async () => {
        try {
          // Prefer back camera (environment facing)
          await html5QrCode.start(
            { facingMode: "environment" }, 
            config,
            (decodedText) => {
              html5QrCode.stop().then(() => {
                setScannerActive(false);
                checkProduct(decodedText);
              });
            },
            () => {} // Ignored
          );
        } catch (err) {
          console.error("Camera failed:", err);
          alert("Could not access camera. Please ensure permissions are granted.");
          setScannerActive(false);
        }
      };

      startScanner();
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(e => console.error('Failed to stop scanner', e));
      }
    };
  }, [scannerActive]);

  const checkProduct = async (barcodeToScan) => {
    if (!barcodeToScan) return;
    setLoading(true);
    try {
      const allergenNames = allergens.map(a => typeof a === 'string' ? a : a.name);
      const data = await api.scan.processBarcode(barcodeToScan, allergenNames);
      onNext('scan_result', data);
    } catch (error) {
      alert(error.message || 'Error processing barcode');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const html5QrCode = new Html5Qrcode("reader");
    try {
      const decodedText = await html5QrCode.scanFileV2(file, true);
      checkProduct(decodedText.decodedText);
    } catch (err) {
      console.error("Scanning from file failed:", err);
      alert("Could not find a barcode in this image. Please ensure the barcode is clear and well-lit.");
    } finally {
      setLoading(false);
      // Clean up the instance after file scan
      html5QrCode.clear();
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
        <h1 style={{ color: '#6b946e', marginBottom: '8px' }}>{t('scan_product')}</h1>
        <p style={{ color: '#6b7280', lineHeight: '1.5', marginBottom: '20px' }}>
          {t('scan_desc')}
        </p>

        {scannerActive ? (
          <div style={{ marginBottom: '20px' }}>
            <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
            <button onClick={() => setScannerActive(false)} style={{ ...btnSecondary, marginTop: '12px' }}>
              {t('cancel_cam')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => setScannerActive(true)} style={btnPrimary} disabled={loading}>
              {t('open_cam')}
            </button>
            
            <button 
              onClick={() => document.getElementById('photo-upload').click()} 
              style={btnSecondaryLine} 
              disabled={loading}
            >
              {loading && !scannerActive ? t('processing') : t('upload_photo')}
            </button>
            <input 
              id="photo-upload" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />

            <div style={{ textAlign: 'center', margin: '4px 0', color: '#9ca3af', fontSize: '13px' }}>— OR —</div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder={t('manual_code')}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => checkProduct(barcodeInput)}
                style={{ ...btnPrimary, width: 'auto', padding: '0 20px' }}
                disabled={loading || !barcodeInput.trim()}
              >
                Go
              </button>
            </div>
          </div>
        )}

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