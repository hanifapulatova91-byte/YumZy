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
    // If no allergens are provided, we technically can't find matches, but we'll return 'Safe' 
    // because there's nothing to be unsafe against.
    if (!allergens || allergens.length === 0) {
      return { 
        safe: true, 
        allergenFlags: [], 
        summary: language === 'uz' ? 'Profilingizda allergenlar ko\'rsatilmagan.' : 'No allergens configured.' 
      };
    }
    
    // Combine all available text for searching
    const name = product.productName || '';
    const ingredients = product.ingredientsText || '';
    const tags = (product.allergensTags || []).join(' ');
    
    const textToSearch = `${name} ${ingredients} ${tags}`.toLowerCase();

    let flaggedAllergens = [];
    
    allergens.forEach(userAllergen => {
      if (!userAllergen) return;
      
      const lowerAllergen = typeof userAllergen === 'string' ? userAllergen.toLowerCase() : userAllergen.name?.toLowerCase();
      if (!lowerAllergen) return;

      // 1. Precise Keyword Check (looks for the exact word or substring)
      if (textToSearch.includes(lowerAllergen)) {
        flaggedAllergens.push(userAllergen.name || userAllergen);
        return;
      }

      // 2. Derivative & Hidden Name Check
      // We check if any of the common derivatives from our safety list are present
      const derivatives = ALLERGEN_DERIVATIVES[lowerAllergen] || [];
      const foundDerivative = derivatives.find(d => textToSearch.includes(d));
      
      if (foundDerivative) {
        flaggedAllergens.push(`${userAllergen.name || userAllergen} (${foundDerivative})`);
      }
    });

    const isMockUnsafe = flaggedAllergens.length > 0;
    return {
      safe: !isMockUnsafe,
      allergenFlags: [...new Set(flaggedAllergens)],
      summary: isMockUnsafe 
        ? `[SAFETY MODE] DANGER: This product contains: ${flaggedAllergens.join(', ')}.` 
        : `[SAFETY MODE] This product is safe based on your selected allergens.`
    };
  };

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    try {
      const prompt = `Act as an UNCOMPROMISING Allergen Safety Engine. 

USER DATA:
- Allergens to block: ${allergenList.join(', ')}
- Goal: 100% User Safety.

PRODUCT CONTEXT:
- Name: ${product.productName}
- Brand: ${product.productBrand || 'Unknown'}
- Ingredients: ${product.ingredientsText || 'NOT LISTED'}
- Tags: ${(product.allergensTags || []).join(', ')}

TASK:
1. Identify ingredients that match or are derived from the user's allergens.
2. IMPORTANT: Ingredients may be in ANY language (French, Dutch, German, etc.). You MUST translate them to English. For example: "soja" → "Soy", "lait" → "Milk", "blé" → "Wheat", "œufs" → "Eggs".
3. In "allergenFlags", list the ENGLISH name of each offending allergen, followed by the original word in parentheses. Example: "Soy (soja)", "Milk (lait écrémé)".
4. SAFE ALTERNATIVES RULES (very important):
   - First, identify the PRODUCT CATEGORY (e.g., cookies, milk, chocolate bar, pasta, bread, yogurt, cereal, etc.).
   - Then suggest 2-3 alternatives that are the SAME TYPE of product but FREE of the user's allergens.
   - Example: If the product is "Chocolate Cookies" and the user is allergic to Dairy → suggest "Dairy-free chocolate cookies", "Oreo Thins (dairy-free varieties)", "Enjoy Life double chocolate cookies".
   - Example: If the product is "Milk" and the user is allergic to Dairy → suggest "Oat milk", "Almond milk", "Coconut milk".
   - NEVER suggest random ingredients like "coconut oil" or "rice flour". Always suggest COMPLETE, buyable food products of the same category.
5. ALL output fields MUST be in English.

OUTPUT JSON ONLY:
{
  "safe": false,
  "allergenFlags": ["Soy (soja)", "Milk (lait écrémé)"],
  "safeAlternatives": ["Allergen-free version of same product type 1", "Allergen-free version 2"],
  "summary": "Clear safety report in English explaining which allergens were found."
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a zero-tolerance allergen engine. You respond in English JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('DEBUG: AI Analysis Error:', error.message);
    }
  }

  // Final emergency fallback if AI fails:
  return { 
    safe: false, 
    allergenFlags: ["System Error"], 
    summary: "Safety engine is currently offline. Please do not consume this product if you have allergies." 
  };
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
