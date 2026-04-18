import React, { useState } from 'react';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { ResultModal } from '../components/ResultModal';
import { fetchProductByBarcode } from '../services/openFoodFacts';
import { analyzeIngredients } from '../utils/allergenAnalyzer';
import { useUserProfile } from '../contexts/UserProfileContext';

export const ScannerPage = () => {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { profile } = useUserProfile();

  const handleScanSuccess = async (barcode) => {
    setScanning(false);
    setLoading(true);
    const product = await fetchProductByBarcode(barcode);
    if (!product) {
      alert('Product not found in database');
      setLoading(false);
      setScanning(true);
      return;
    }
    setCurrentProduct(product);
    const analysis = analyzeIngredients(
      product.ingredients_text || '',
      product.allergens_tags || [],
      profile
    );
    setResult(analysis);
    setLoading(false);
  };

  const handleScanError = (err) => {
    console.warn(err);
  };

  const closeModal = () => {
    setResult(null);
    setCurrentProduct(null);
    setScanning(true);
  };

  return (
    <div className="scanner-page">
      <h1>Allergen Scanner</h1>
      {scanning ? (
        <BarcodeScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
      ) : (
        <div className="scanning-placeholder">
          {loading && <p>Analyzing product...</p>}
          {!loading && !result && <button onClick={() => setScanning(true)}>Scan Again</button>}
        </div>
      )}
      {result && currentProduct && (
        <ResultModal 
          result={result} 
          product={currentProduct} 
          onClose={closeModal}
          userProfile={profile}
        />
      )}
    </div>
  );
};