const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Common derivatives for allergens to improve fallback safety logic
 */
const ALLERGEN_DERIVATIVES = {
  dairy: ['milk', 'cheese', 'butter', 'cream', 'whey', 'casein', 'lactose', 'yogurt', 'curd', 'skimmed milk powder'],
  peanuts: ['peanut', 'groundnut', 'arachis'],
  eggs: ['egg', 'albumin', 'lecithin', 'yolk'],
  nuts: ['walnut', 'almond', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'brazil nut'],
  wheat: ['wheat', 'flour', 'gluten', 'spelt', 'durum', 'semolina'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'miso', 'lecithin'],
  seafood: ['fish', 'shrimp', 'crab', 'lobster', 'mussel', 'oyster', 'scallop', 'prawn'],
};

/**
 * Map language codes to full names for AI prompts
 */
const LANG_MAP = {
  en: 'English',
  uz: 'Uzbek (Cyrillic or Latin as appropriate, usually Latin for modern mobile users)',
};

/**
 * Analyze product safety for a user's allergy profile
 */
const analyzeProductSafety = async (product, profile, language = 'en') => {
  const allergenList = [...(profile.allergens || []), ...(profile.customAllergens || [])];
  const targetLang = LANG_MAP[language] || 'English';

  if (allergenList.length === 0) {
    return {
      safe: true,
      allergenFlags: [],
      summary: language === 'uz' ? 'Profilingizda allergenlar ko\'rsatilmagan.' : 'No allergens configured in your profile.',
    };
  }

  const getMockSafety = () => {
    const textToSearch = `${product.productName} ${product.ingredientsText} ${product.allergensTags?.join(' ')}`.toLowerCase();
    let flaggedAllergens = [];
    
    allergenList.forEach(userAllergen => {
      const lowerAllergen = userAllergen.toLowerCase();
      if (textToSearch.includes(lowerAllergen)) {
        flaggedAllergens.push(userAllergen);
        return;
      }
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
        ? `[SAFETY MODE] Critical: This product contains ${flaggedAllergens.join(' and ')}.` 
        : `[SAFETY MODE] No direct matches for your allergens found.`
    };
  };

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    try {
      const prompt = `You are an expert nutritionist. Analyze ingredients for potential allergens.
LANGUAGE: Respond in ${targetLang}.

USER ALLERGENS: ${allergenList.join(', ')}
PRODUCT: ${product.productName}
INGREDIENTS: ${product.ingredientsText || 'None'}

Respond in JSON ONLY:
{
  "safe": true/false,
  "allergenFlags": ["allergen1"],
  "summary": "Brief explanation in the target language."
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are an allergen expert. Respond with valid JSON only.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 300,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('DEBUG: OpenAI Analysis Error:', error.message);
    }
  }

  return getMockSafety();
};

/**
 * Generate a safe recipe
 */
const generateRecipe = async (ingredients, profile, language = 'en') => {
  const allergenList = [...(profile.allergens || []), ...(profile.customAllergens || [])];
  const targetLang = LANG_MAP[language] || 'English';

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    try {
      const prompt = `Generate 3 safe recipes using: ${ingredients.join(', ')}. Allergies: ${allergenList.join(', ')}.
LANGUAGE: Respond in ${targetLang}.

Respond in JSON format with a "recipes" array.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('DEBUG: OpenAI Recipe Error:', error.message);
    }
  }

  return { recipes: [{ title: "Garden Salad", description: "Healthy and safe.", instructions: "Mix veggies." }] };
};

/**
 * Chat with the AI nutritionist agent
 */
const chatWithAI = async (message, profile, language = 'en') => {
  const allergenList = [...(profile?.allergens || []), ...(profile?.customAllergens || [])];
  const targetLang = LANG_MAP[language] || 'English';

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are YumZy, a friendly mascot. Always respond in ${targetLang}. User Allergens: ${allergenList.join(', ')}.` },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
      return { reply: response.choices[0].message.content };
    } catch (error) {
      console.error('DEBUG: OpenAI Chat Error:', error.message);
    }
  }

  return { reply: language === 'uz' ? "[SAFETY MODE] Men hozircha cheklangan rejimda ishlayapman." : "[SAFETY MODE] I am running on limited capacity." };
};

/**
 * Analyze symptoms
 */
const analyzeSymptoms = async (symptoms, language = 'en') => {
  const targetLang = LANG_MAP[language] || 'English';

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    try {
      const prompt = `Analyze symptoms: ${symptoms}. Identify likely allergen.
LANGUAGE: Respond in ${targetLang}.

Respond in JSON:
{
  "name": "Allergen",
  "percent": "%",
  "note": "Explanation in ${targetLang}"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('DEBUG: Symptom Analysis Error:', error.message);
    }
  }

  return { name: 'Dairy', percent: 'Unknown', note: 'Please see a doctor.' };
};

module.exports = {
  analyzeProductSafety,
  generateRecipe,
  chatWithAI,
  analyzeSymptoms,
};
