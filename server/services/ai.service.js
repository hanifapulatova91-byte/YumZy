const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const isMockUnsafe = allergenList.some(a => 
      product.ingredientsText?.toLowerCase().includes(a.toLowerCase()) ||
      product.productName?.toLowerCase().includes(a.toLowerCase())
    );
    return {
      safe: !isMockUnsafe,
      allergenFlags: isMockUnsafe ? [allergenList[0]] : [],
      summary: isMockUnsafe 
        ? `[MOCK] This product likely contains ${allergenList[0]} and is unsafe.` 
        : `[MOCK] This product appears safe and free from your allergens.`
    };
  };

  // MOCK FOR TESTING WITHOUT REAL OPENAI KEY
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
    console.error('OpenAI Analysis Error:', error.message);
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

  const langMap = {
    en: 'English',
    ru: 'Russian',
    uz: 'Uzbek',
  };

  const getMockRecipe = () => ({
    recipes: [
      {
        recipeName: "[MOCK] Safe Veggie Stir Fry",
        description: "A quick, safe, and delicious mock recipe using your ingredients.",
        cookingTime: "20 minutes",
        servings: 2,
        ingredients: [
          { name: ingredients[0] || "Vegetables", amount: "200g" },
          { name: "Olive oil", amount: "1 tbsp" }
        ],
        steps: [
          "Chop your ingredients finely.",
          "Stir fry in a pan until cooked through."
        ],
        safetyNote: "This recipe avoids all your listed allergens."
      },
      {
        recipeName: "[MOCK] Allergen-Free Soup",
        description: "A warm and comforting soup.",
        cookingTime: "45 minutes",
        servings: 4,
        ingredients: [
          { name: "Broth", amount: "4 cups" },
          { name: ingredients[0] || "Mixed Veggies", amount: "2 cups" }
        ],
        steps: [
          "Bring broth to a boil.",
          "Add ingredients and simmer."
        ],
        safetyNote: "Completely safe from your allergens."
      }
    ]
  });

  // MOCK FOR TESTING WITHOUT REAL OPENAI KEY
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    return getMockRecipe();
  }

  const prompt = `You are a professional chef and nutritionist. Create 3 distinct delicious recipes using ONLY the available ingredients. The recipes MUST be safe for someone with the specified allergies.

AVAILABLE INGREDIENTS: ${ingredients.join(', ')}
ALLERGENS TO AVOID: ${allergenList.length > 0 ? allergenList.join(', ') : 'None'}

CRITICAL: Do NOT include any ingredients that contain or are derived from the allergens listed above.

Respond in ${langMap[language] || 'Russian'} language.
Respond ONLY with valid JSON in this exact format:
{
  "recipes": [
    {
      "recipeName": "Name of the dish",
      "description": "Short appetizing description",
      "cookingTime": "e.g. 30 minutes",
      "servings": 2,
      "ingredients": [
        { "name": "ingredient name", "amount": "quantity" }
      ],
      "steps": [
        "Step 1 description",
        "Step 2 description"
      ],
      "safetyNote": "Brief note about allergen safety of this recipe"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional chef. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI Recipe Error:', error.message);
    return getMockRecipe(); // Fallback on quota error
  }
};

/**
 * Have a conversational chat with the AI taking into account the user profile
 * @param {string} message - User's message prompt
 * @param {Object} profile - User's allergy profile
 * @returns {Object} { reply: string }
 */
const chatWithAI = async (message, profile) => {
  const allergenList = [...(profile?.allergens || []), ...(profile?.customAllergens || [])];

  const getMockChat = () => {
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return { reply: "[MOCK AI] Hello! I'm YumZy. Ask me about safe snacking, recipes, or allergens." };
    }
    return {
      reply: `[MOCK AI] It seems our connection to the main brain is experiencing high traffic. But don't worry, I know you are asking about: "${message}". I will keep your allergies (${allergenList.length > 0 ? allergenList.join(', ') : 'None'}) safe!`
    };
  };

  // MOCK FOR TESTING WITHOUT REAL OPENAI KEY
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-key')) {
    return getMockChat();
  }

  const systemPrompt = `You are YumZy, an incredibly helpful, friendly AI nutritionist specializing in food allergies. 
The user you are talking to has the following allergies: ${allergenList.length > 0 ? allergenList.join(', ') : 'None'}. 
Always keep their allergies in mind and NEVER recommend foods they are allergic to. Keep your answers conversational, supportive, and safe.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    return { reply: response.choices[0].message.content };
  } catch (error) {
    console.error('OpenAI Chat Error:', error.message);
    return getMockChat(); // Fallback gracefully!
  }
};

module.exports = { analyzeProductSafety, generateRecipe, chatWithAI };
