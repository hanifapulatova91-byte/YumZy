const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Common derivatives for allergens to improve fallback safety logic
 */
const ALLERGEN_DERIVATIVES = {
  dairy: ['milk', 'cheese', 'butter', 'cream', 'whey', 'casein', 'lactose', 'yogurt', 'curd'],
  peanuts: ['peanut', 'groundnut', 'arachis'],
  eggs: ['egg', 'albumin', 'lecithin', 'yolk'],
  nuts: ['walnut', 'almond', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'brazil nut'],
  wheat: ['wheat', 'flour', 'gluten', 'spelt', 'durum', 'semolina'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'miso'],
  seafood: ['fish', 'shrimp', 'crab', 'lobster', 'mussel', 'oyster', 'scallop', 'prawn'],
};

/**
 * Analyze product safety for a user's allergy profile
 * @param {Object} product - Product data from Open Food Facts
 * @param {Object} profile - User's allergy profile
 * @returns {Object} { safe: boolean, allergenFlags: string[], summary: string }
 */
const analyzeProductSafety = async (product, profile) => {
  const allergenList = [...(profile.allergens || []), ...(profile.customAllergens || [])];

  if (allergenList.length === 0) {
    return {
      safe: true,
      allergenFlags: [],
      summary: 'No allergens configured in your profile. Product is considered safe by default.',
    };
  }

  const getMockSafety = () => {
    const textToSearch = `${product.productName} ${product.ingredientsText} ${product.allergensTags?.join(' ')}`.toLowerCase();
    
    let flaggedAllergens = [];
    
    allergenList.forEach(userAllergen => {
      const lowerAllergen = userAllergen.toLowerCase();
      
      // 1. Direct check
      if (textToSearch.includes(lowerAllergen)) {
        flaggedAllergens.push(userAllergen);
        return;
      }
      
      // 2. Derivatives check
      const derivatives = ALLERGEN_DERIVATIVES[lowerAllergen] || [];
      const foundDerivative = derivatives.find(d => textToSearch.includes(d));
      if (foundDerivative) {
        flaggedAllergens.push(`${userAllergen} (${foundDerivative})`);
      }
    });

    const isMockUnsafe = flaggedAllergens.length > 0;

    return {
      safe: !isMockUnsafe,
      allergenFlags: flaggedAllergens,
      summary: isMockUnsafe 
        ? `[SAFETY MODE] Critical: This product contains ${flaggedAllergens.join(' and ')}. Do not consume.` 
        : `[SAFETY MODE] No direct matches for your allergens found. However, please always double-check the label.`
    };
  };

  // MOCK FOR TESTING WITHOUT REAL OPENAI KEY OR ON QUOTA ERROR
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    return getMockSafety();
  }

  const prompt = `You are an expert nutritionist and allergen specialist. Analyze the following product ingredients for potential allergens.

USER'S ALLERGENS: ${allergenList.join(', ')}

PRODUCT NAME: ${product.productName}
PRODUCT BRAND: ${product.productBrand}
INGREDIENTS: ${product.ingredientsText || 'No ingredients listed'}
KNOWN ALLERGEN TAGS: ${product.allergensTags?.join(', ') || 'None'}

IMPORTANT: Be thorough. Check for hidden allergens, derivatives, and cross-contamination risks.

Respond ONLY with valid JSON in this exact format:
{
  "safe": true/false,
  "allergenFlags": ["allergen1", "allergen2"],
  "summary": "Brief explanation in 1-2 sentences about why the product is safe or dangerous for this user."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a food allergen analysis expert. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      safe: result.safe ?? true,
      allergenFlags: result.allergenFlags || [],
      summary: result.summary || '',
    };
  } catch (error) {
    console.error('DEBUG: OpenAI Analysis Error:', error.message);
    if (error.response) console.error('DEBUG: OpenAI Error Response:', error.response.data);
    return getMockSafety(); // Fallback on quota error
  }
};

/**
 * Generate a safe recipe based on available ingredients and user's allergen profile
 * @param {string[]} ingredients - Available ingredients
 * @param {Object} profile - User's allergy profile
 * @param {string} language - Language code ('en', 'ru', 'uz')
 * @returns {Object} Recipe object
 */
const generateRecipe = async (ingredients, profile, language = 'ru') => {
  const allergenList = [...(profile.allergens || []), ...(profile.customAllergens || [])];

  const getMockRecipe = () => {
    return [
      {
        title: "[MOCK] Safe Garden Salad",
        description: "A fresh and safe salad tailored to your profile.",
        ingredients: ["Lettuce", "Tomato", "Cucumber", "Olive Oil"],
        instructions: "Mix all ingredients in a bowl and serve."
      }
    ];
  };

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    return getMockRecipe();
  }

  const langMap = {
    en: 'English',
    ru: 'Russian',
    uz: 'Uzbek',
  };

  const prompt = `Generate 3 safe and delicious recipes using these ingredients: ${ingredients.join(', ')}.
USER ALLERGIES: ${allergenList.join(', ')} (STRICTLY AVOID THESE)
LANGUAGE: ${langMap[language] || 'Russian'}

Respond ONLY with a JSON array of 3 objects in this format:
[
  {
    "title": "Recipe Name",
    "description": "Short description",
    "ingredients": ["ing1", "ing2"],
    "instructions": "Step by step instructions"
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional chef specializing in allergen-safe meals. Always respond with valid JSON arrays.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('DEBUG: OpenAI Recipe Error:', error.message);
    return getMockRecipe(); // Fallback on quota error
  }
};

/**
 * Chat with the AI nutritionist agent
 * @param {string} message - User's message prompt
 * @param {Object} profile - User's allergy profile
 * @returns {Object} { reply: string }
 */
const chatWithAI = async (message, profile) => {
  const allergenList = [...(profile?.allergens || []), ...(profile?.customAllergens || [])];

  const getMockChat = () => {
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return { reply: "[SAFETY MODE] Hello! I'm YumZy. I am currently running on limited brain power, but I am still watching over your safety!" };
    }
    return {
      reply: `[SAFETY MODE] My apologies, but I'm currently in Safety Mode due to high traffic. I am keeping a close eye on your allergies (${allergenList.length > 0 ? allergenList.join(', ') : 'None'}). How else can I help you today?`
    };
  };

  // MOCK FOR TESTING WITHOUT REAL OPENAI KEY
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    return getMockChat();
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are YumZy, a friendly mascot and expert nutritionist. 
          User's Allergens: ${allergenList.join(', ') || 'None'}.
          If asked about recipes, provide 1 easy suggestion. 
          Always be supportive and focused on food safety.` 
        },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return { reply: response.choices[0].message.content };
  } catch (error) {
    console.error('DEBUG: OpenAI Chat Error:', error.message);
    return getMockChat(); // Fallback gracefully!
  }
};

module.exports = {
  analyzeProductSafety,
  generateRecipe,
  chatWithAI,
};
