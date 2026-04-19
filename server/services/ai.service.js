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
      const prompt = `You are a precise Allergen Safety Analyzer.

USER ALLERGENS: ${allergenList.join(', ')}

PRODUCT:
- Name: ${product.productName}
- Brand: ${product.productBrand || 'Unknown'}
- Ingredients: ${product.ingredientsText || 'NOT LISTED'}
- Allergen Tags: ${(product.allergensTags || []).join(', ')}

RULES:
1. ONLY flag an ingredient if it matches an item in "USER ALLERGENS" AND is objectively present in the "Ingredients" or "Allergen Tags". 
2. Do NOT flag general allergens (e.g., milk, nuts, soy) if the user did not specifically list them in USER ALLERGENS. Never hallucinate.
3. Translate foreign ingredients to English. Format: "English Name (original word)".
4. Use THREE risk levels:
   - "safe" → No user allergens found, AND ingredients are fully listed/readable.
   - "caution" → Ingredients are completely missing, unreadable, or missing critical data. Do not use caution if an allergen is found.
   - "dangerous" → User allergens are CONFIRMED present anywhere in the ingredients, tags, or as a "may contain" trace warning.
5. If "riskLevel" is "dangerous" or "caution", suggest 2-3 alternatives of the SAME product type.
6. Respond in English only.

JSON OUTPUT:
{
  "riskLevel": "safe" or "caution" or "dangerous",
  "safe": true or false,
  "allergenFlags": ["ONLY matching items from USER ALLERGENS found in ingredients"],
  "safeAlternatives": ["same-category allergen-free products"],
  "summary": "Explain what was found and why this risk level was chosen."
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a factual allergen analyzer. You ONLY report ingredients explicitly listed in the provided data AND that match the USER ALLERGENS list. You NEVER invent or flag unrequested allergens. Use "caution" when data is incomplete. Respond in English JSON only.' },
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
    riskLevel: 'caution',
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

  const systemPrompt = `You are YumZy 🦥, a cheerful AI sloth mascot and expert nutritionist for the YumZy allergen-safety app.

PERSONALITY:
- You're warm, friendly, and a little playful — like a knowledgeable friend, not a doctor.
- You love food puns and use food emojis naturally 🍕🥗🍰
- You keep responses concise (2-4 sentences max unless asked for detail).
- You always respond in ${targetLang}.

USER CONTEXT:
- Their allergens: ${allergenList.length > 0 ? allergenList.join(', ') : 'None specified'}
- Always keep their allergies in mind when suggesting food.

RULES:
1. FOOD & HEALTH topics: Answer helpfully with allergen-safe advice. Be specific and practical.
2. OFF-TOPIC messages (politics, math, coding, etc.): Respond with a SHORT, friendly redirect. Example: "Haha, I'm more of a food expert than a math wizard! 🍕 But ask me anything about recipes, nutrition, or allergen safety and I've got you covered!"
3. GREETINGS: Respond warmly and invite them to ask about food/nutrition.
4. NEVER give medical diagnoses. If asked about serious symptoms, suggest consulting a doctor.
5. If the user mentions a food that conflicts with their allergens, WARN them immediately.`;

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.8,
        max_tokens: 400,
      });
      return { reply: response.choices[0].message.content };
    } catch (error) {
      console.error('DEBUG: OpenAI Chat Error:', error.message);
      // Return a friendly fallback instead of crashing
      return { reply: "Oops! 🦥 My brain took a little nap there. Could you try asking me again? I'm here to help with food, recipes, and allergen safety!" };
    }
  }

  return { reply: "Hey! 🦥 I'm YumZy, your food safety buddy. I'm running in offline mode right now, but I'll be back to full power soon! In the meantime, check out the Recipe Generator for allergen-safe meal ideas." };
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

/**
 * Analyze an ingredient list photo using GPT-4o Vision
 * @param {string} imageBase64 - Base64 encoded image data
 * @param {Array} allergenList - User's allergens
 * @returns {Object} Safety analysis result
 */
const analyzeIngredientImage = async (imageBase64, allergenList = []) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    return {
      riskLevel: 'caution',
      safe: false,
      allergenFlags: [],
      safeAlternatives: [],
      extractedIngredients: 'Could not read — AI service offline.',
      summary: 'AI Vision is not available. Please check ingredients manually.',
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise allergen analyzer. You read ingredient lists from photos and check ONLY for the specific allergens the user requested. Do NOT flag common allergens if the user did not ask for them. Never hallucinate. Respond in English JSON only.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Read the ingredient list from this photo.

USER ALLERGENS: ${allergenList.join(', ')}

TASK:
1. Extract all ingredients you can read from the image.
2. Check if ANY of the user's allergens are present.
3. Translate foreign ingredients to English.
4. Use THREE risk levels:
   - "safe" → No user allergens found, AND ingredients are fully readable.
   - "caution" → Ingredients are unreadable or missing.
   - "dangerous" → User allergens are present in ingredients or as a "may contain" warning.
5. If allergens found, suggest 2-3 same-category safe alternatives.

JSON OUTPUT:
{
  "riskLevel": "safe" or "caution" or "dangerous",
  "safe": true or false,
  "extractedIngredients": "Full ingredient list as read from the photo",
  "allergenFlags": ["ONLY items matching USER ALLERGENS that were found in the photo (English Name - original word)"],
  "safeAlternatives": ["same-category allergen-free products"],
  "summary": "What was found and why this risk level."
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 800,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('DEBUG: Vision Analysis Error:', error.message);
    return {
      riskLevel: 'caution',
      safe: false,
      allergenFlags: [],
      safeAlternatives: [],
      extractedIngredients: 'Could not read ingredients from image.',
      summary: 'Failed to analyze the image. Please try a clearer photo or enter ingredients manually.',
    };
  }
};

module.exports = {
  analyzeProductSafety,
  generateRecipe,
  chatWithAI,
  analyzeSymptoms,
  analyzeIngredientImage,
};
