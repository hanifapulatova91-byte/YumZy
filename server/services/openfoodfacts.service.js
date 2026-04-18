const axios = require('axios');

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v0/product';

/**
 * Fetch product data from Open Food Facts by barcode
 * @param {string} barcode - Product barcode (EAN-13, UPC-A, etc.)
 * @returns {Object|null} Product data or null if not found
 */
const getProductByBarcode = async (barcode) => {
  // We try the .net mirror which is often less restricted for cloud servers
  const mirrors = [
    `https://world.openfoodfacts.net/api/v0/product/${barcode}.json`,
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  ];

  for (const url of mirrors) {
    try {
      console.log('DEBUG: Attempting barcode fetch from:', url);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'YumZy - Web Platform - Version 1.0 (contact@yumzy.app)',
        },
        timeout: 8000,
      });

      if (response.data.status === 0 || !response.data.product) {
        console.log('DEBUG: Product not found in this mirror:', url);
        continue; // Try next mirror if 404
      }

      const product = response.data.product;

      return {
        productName: product.product_name || 'Unknown Product',
        productBrand: product.brands || '',
        productImage: product.image_url || '',
        ingredientsText: product.ingredients_text || '',
        allergensTags: product.allergens_tags || [],
      };
    } catch (error) {
      console.error(`DEBUG: Open Food Facts API Error on ${url}:`, error.message);
      if (error.response) {
        console.error('DEBUG: OFF Error Details:', error.response.status);
      }
      // Loop continues to next mirror
    }
  }

  return null; // Both mirrors failed
};

module.exports = { getProductByBarcode };
