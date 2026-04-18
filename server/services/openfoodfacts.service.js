const axios = require('axios');

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2/product';

/**
 * Fetch product data from Open Food Facts by barcode
 * @param {string} barcode - Product barcode (EAN-13, UPC-A, etc.)
 * @returns {Object|null} Product data or null if not found
 */
const getProductByBarcode = async (barcode) => {
  try {
    const url = `${OFF_API_BASE}/${barcode}?fields=product_name,brands,image_url,ingredients_text,allergens_tags,nutriments`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'YumZy App/1.0 (contact@yumzy.app)',
      },
      timeout: 10000,
    });

    if (response.data.status === 0 || !response.data.product) {
      return null;
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
    console.error('Open Food Facts API Error:', error.message);
    return null;
  }
};

module.exports = { getProductByBarcode };
