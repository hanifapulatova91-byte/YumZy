const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Common derivatives for allergens to improve fallback safety logic
 */
const ALLERGEN_DERIVATIVES = {
  dairy: ['milk', 'cheese', 'butter', 'cream', 'whey', 'casein', 'lactose', 'yogurt', 'curd', 'skimmed milk powder', 'milkfat', 'lactalbumin'],
  peanuts: ['peanut', 'peanuts', 'groundnut', 'arachis'],
  eggs: ['egg', 'eggs', 'albumin', 'lecithin', 'yolk'],
  nuts: ['nut', 'nuts', 'walnut', 'almond', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'brazil nut'],
  wheat: ['wheat', 'flour', 'gluten', 'spelt', 'durum', 'semolina', 'triticeae'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'miso', 'lecithin', 'soybean'],
  seafood: ['fish', 'shrimp', 'crab', 'lobster', 'mussel', 'oyster', 'scallop', 'prawn', 'salmon', 'tuna'],
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
const analyzeProductSafety = async (product, profile, language = 'en', guestAllergens = []) => {
  const allergenList = profile?.userId 
    ? [...(profile.allergens || []), ...(profile.customAllergens || [])]
    : guestAllergens;
    
  const targetLang = LANG_MAP[language] || 'English';

  if (!allergenList || allergenList.length === 0) {
    return {
      safe: true,
      allergenFlags: [],
      summary: language === 'uz' ? 'Profilingizda allergenlar ko\'rsatilmagan.' : 'No allergens configured.',
    };
  }

  const getMockSafety = (allergens) => {
    if (!allergens || allergens.length === 0) return { safe: true, allergenFlags: [], summary: 'No allergens to check.' };
    
    // Combine all text for searching
    const textToSearch = [
      product.productName,
      product.ingredientsText,
      ...(product.allergensTags || [])
    ].join(' ').toLowerCase();

    let flaggedAllergens = [];
    
    allergens.forEach(userAllergen => {
      const lowerAllergen = userAllergen.toLowerCase();
      
      // 1. Direct Keyword Check
      if (textToSearch.includes(lowerAllergen)) {
        flaggedAllergens.push(userAllergen);
        return;
      }

      // 2. Exact word boundary check for better accuracy
      const regex = new RegExp(`\\b${lowerAllergen}\\b`, 'i');
      if (regex.test(textToSearch)) {
        flaggedAllergens.push(userAllergen);
        return;
      }

      // 3. Derivative check
      const derivatives = ALLERGEN_DERIVATIVES[lowerAllergen] || [];
      const foundDerivative = derivatives.find(d => {
        const derRegex = new RegExp(`\\b${d}\\b`, 'i');
        return derRegex.test(textToSearch) || textToSearch.includes(d);
      });
      
      if (foundDerivative) {
        flaggedAllergens.push(`${userAllergen} (${foundDerivative})`);
      }
    });

    const isMockUnsafe = flaggedAllergens.length > 0;
    return {
      safe: !isMockUnsafe,
      allergenFlags: [...new Set(flaggedAllergens)],
      summary: isMockUnsafe 
        ? `[SAFETY MODE] DANGER: This product contains the following allergens: ${flaggedAllergens.join(', ')}.` 
        : `[SAFETY MODE] This product seems safe based on your profile.`
    };
  };

  // Perform local check first as a safety layer
  const localCheck = getMockSafety(allergenList);

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    try {
      const prompt = `You are an ELITE allergen safety expert. Analyze ingredients with 100% strictness.
LANGUAGE: ${targetLang}.

USER ALLERGENS: ${allergenList.join(', ')}
PRODUCT: ${product.productName}
INGREDIENTS: ${product.ingredientsText || 'None'}

RULES:
1. If ANY ingredient is derived from or IS one of the user's allergens, "safe" MUST be false.
2. Even if it "might contain" traces, mark it as unsafe.

Respond in JSON ONLY:
{
  "safe": false,
  "allergenFlags": ["flagged_item"],
  "summary": "Clear safety warning."
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are an allergen expert. Respond with valid JSON only. Safety is the top priority.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 400,
      });

      const aiResult = JSON.parse(response.choices[0].message.content);
      
      // Merge: If either local check or AI finds a problem, mark as unsafe
      if (!localCheck.safe) {
        return {
          ...aiResult,
          safe: false,
          allergenFlags: [...new Set([...localCheck.allergenFlags, ...(aiResult.allergenFlags || [])])]
        };
      }
      return aiResult;
    } catch (error) {
      console.error('DEBUG: OpenAI Analysis Error:', error.message);
    }
  }

  return localCheck;
};

/**
 * Generate a safe recipe
 */
const generateRecipe = async (ingredients, profile, language = 'en', guestAllergens = []) => {
  const allergenList = profile?.userId 
    ? [...(profile.allergens || []), ...(profile.customAllergens || [])]
    : guestAllergens;
    
  const targetLang = LANG_MAP[language] || 'English';

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    try {
      const prompt = `You are a world-class chef and nutritionist. Generate 3 healthy recipes using ONLY these ingredients: ${ingredients.join(', ')}.
      
HARD CONSTRAINT: THE RECIPES MUST BE 100% FREE FROM THESE ALLERGENS: ${allergenList.length > 0 ? allergenList.join(', ') : 'None'}.
CRITICAL: Do not suggest substitutes that contain these allergens. Safety is absolute.

LANGUAGE: ${targetLang}.

RESPOND WITH VALID JSON ONLY:
{
  "recipes": [
    {
      "recipeName": "Title",
      "description": "Appetizing summary",
      "cookingTime": "25 mins",
      "servings": 2,
      "safetyNote": "Detailed explanation of why this recipe is safe for the specified allergies.",
      "ingredients": [
        { "amount": "1 cup", "name": "Safe Ingredient" }
      ],
      "steps": ["Step 1", "Step 2"]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are an allergen-safe cooking expert. Your goal is 100% safety for the user.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1500,
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('DEBUG: OpenAI Recipe Error:', error.message);
    }
  }

  // Fallback / Mock
  return { 
    recipes: [
      { 
        recipeName: "Chef's Garden Plate", 
        description: "A simple, fresh, and naturally safe vegetable medley.", 
        cookingTime: "10 mins",
        servings: 1,
        safetyNote: "Naturally free from all common allergens. Uses only raw vegetables and olive oil.",
        ingredients: [{ amount: "2 cups", name: "Mixed Fresh Veggies" }],
        steps: ["Wash and slice vegetables.", "Toss with a light dressing.", "Serve."]
      }
    ] 
  };
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
