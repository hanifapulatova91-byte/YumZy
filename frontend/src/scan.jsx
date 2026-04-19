import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import { Html5Qrcode } from 'html5-qrcode';

function Scan({ onNext, allergens = [], t }) {
  const [loading, setLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerMode, setScannerMode] = useState(null); // 'native' or 'fallback'
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);

  // Check if native BarcodeDetector is available (Chrome Android uses ML Kit)
  const hasNativeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    if (!scannerActive) return;

    let cancelled = false;

    if (hasNativeDetector) {
      // ====== NATIVE BARCODE DETECTOR (ML Kit on Android) ======
      setScannerMode('native');
      
      const startNativeScanner = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }
          });

          if (cancelled) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          streamRef.current = stream;

          // Enable continuous autofocus
          const track = stream.getVideoTracks()[0];
          try {
            const caps = track.getCapabilities?.();
            if (caps?.focusMode?.includes('continuous')) {
              await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
            }
            // Also try to enable torch/flashlight for better scanning in low light
            if (caps?.torch) {
              // Don't auto-enable, but it's available if needed
            }
          } catch (e) {
            console.log('Advanced camera features not available');
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }

          // Create the native barcode detector
          const detector = new BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
          });

          scanningRef.current = true;

          // Continuous detection loop
          const detectLoop = async () => {
            if (!scanningRef.current || cancelled) return;

            try {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const code = barcodes[0].rawValue;
                  console.log('Native BarcodeDetector found:', code);
                  stopNativeScanner();
                  setScannerActive(false);
                  checkProduct(code);
                  return;
                }
              }
            } catch (err) {
              // Detection frame failed, continue
            }

            if (scanningRef.current && !cancelled) {
              requestAnimationFrame(detectLoop);
            }
          };

          detectLoop();
        } catch (err) {
          console.error('Native scanner failed:', err);
          alert('Could not access camera. Please ensure permissions are granted.');
          setScannerActive(false);
        }
      };

      startNativeScanner();
    } else {
      // ====== FALLBACK: html5-qrcode ======
      setScannerMode('fallback');
      
      const html5QrCode = new Html5Qrcode("reader-fallback");
      const config = { 
        fps: 10, 
        qrbox: { width: 300, height: 150 },
        aspectRatio: 1.7778,
      };

      const startFallback = async () => {
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              html5QrCode.stop().then(() => {
                setScannerActive(false);
                checkProduct(decodedText);
              });
            },
            () => {}
          );

          // Try autofocus
          try {
            const videoEl = document.querySelector('#reader-fallback video');
            if (videoEl?.srcObject) {
              const track = videoEl.srcObject.getVideoTracks()[0];
              const caps = track.getCapabilities?.();
              if (caps?.focusMode?.includes('continuous')) {
                await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
              }
            }
          } catch (e) {}
        } catch (err) {
          console.error("Camera failed:", err);
          alert("Could not access camera. Please ensure permissions are granted.");
          setScannerActive(false);
        }
      };

      startFallback();

      return () => {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(e => console.error('Failed to stop scanner', e));
        }
      };
    }

    return () => {
      cancelled = true;
      stopNativeScanner();
    };
  }, [scannerActive]);

  const stopNativeScanner = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

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

    // Try native BarcodeDetector for image files too
    if (hasNativeDetector) {
      try {
        const img = await createImageBitmap(file);
        const detector = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
        });
        const barcodes = await detector.detect(img);
        if (barcodes.length > 0) {
          checkProduct(barcodes[0].rawValue);
          return;
        }
      } catch (e) {
        console.log('Native file scan failed, trying fallback');
      }
    }

    // Fallback to html5-qrcode for file scanning
    const html5QrCode = new Html5Qrcode("reader-fallback");
    try {
      const decodedText = await html5QrCode.scanFileV2(file, true);
      checkProduct(decodedText.decodedText);
    } catch (err) {
      console.error("Scanning from file failed:", err);
      alert("Could not find a barcode in this image. Please ensure the barcode is clear and well-lit.");
      setLoading(false);
    } finally {
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
            {/* Native scanner: raw video element */}
            {scannerMode === 'native' && (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                <video 
                  ref={videoRef} 
                  playsInline 
                  muted
                  style={{ width: '100%', display: 'block', borderRadius: '12px' }} 
                />
                {/* Scan line overlay */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '10%',
                  right: '10%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #5d8a60, transparent)',
                  animation: 'scanPulse 1.5s ease-in-out infinite',
                  transform: 'translateY(-50%)',
                }} />
                {/* Scan area box */}
                <div style={{
                  position: 'absolute',
                  top: '30%',
                  left: '10%',
                  right: '10%',
                  bottom: '30%',
                  border: '2px solid rgba(93, 138, 96, 0.6)',
                  borderRadius: '8px',
                }} />
              </div>
            )}

            {/* Fallback scanner: html5-qrcode container */}
            {scannerMode === 'fallback' && (
              <div id="reader-fallback" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
            )}

            <button 
              onClick={() => {
                stopNativeScanner();
                setScannerActive(false);
              }} 
              style={{ ...btnSecondary, marginTop: '12px' }}
            >
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

      <style>{`
        @keyframes scanPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
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