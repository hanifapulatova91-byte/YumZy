import React, { useState } from 'react';
import { api } from './api';
import './recipe.css';

// Food emoji and gradient based on recipe name keywords
const getRecipeVisual = (name) => {
  const n = (name || '').toLowerCase();
  const map = [
    { keys: ['chicken', 'poultry', 'hen'], emoji: '🍗', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { keys: ['pasta', 'spaghetti', 'noodle', 'macaroni', 'penne'], emoji: '🍝', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { keys: ['salad', 'greens', 'veggie', 'vegetable'], emoji: '🥗', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { keys: ['soup', 'stew', 'broth', 'chowder'], emoji: '🍲', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
    { keys: ['rice', 'risotto', 'pilaf', 'biryani'], emoji: '🍚', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
    { keys: ['fish', 'salmon', 'tuna', 'seafood', 'shrimp'], emoji: '🐟', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
    { keys: ['cake', 'dessert', 'sweet', 'brownie', 'cookie'], emoji: '🍰', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { keys: ['bread', 'toast', 'sandwich', 'wrap'], emoji: '🍞', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { keys: ['pizza'], emoji: '🍕', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { keys: ['egg', 'omelette', 'frittata'], emoji: '🍳', gradient: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)' },
    { keys: ['steak', 'beef', 'meat', 'lamb', 'pork'], emoji: '🥩', gradient: 'linear-gradient(135deg, #f5576c 0%, #ff9a9e 100%)' },
    { keys: ['smoothie', 'shake', 'juice', 'drink'], emoji: '🥤', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { keys: ['taco', 'burrito', 'mexican'], emoji: '🌮', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { keys: ['curry', 'indian', 'masala', 'tikka'], emoji: '🍛', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { keys: ['stir', 'wok', 'asian', 'chinese', 'thai'], emoji: '🥘', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  ];

  for (const item of map) {
    if (item.keys.some(k => n.includes(k))) return item;
  }
  // Default food visual
  return { emoji: '🍽️', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
};

const RecipeGenerator = ({ onBack, allergens = [] }) => {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients.');
      return;
    }
    
    setError('');
    setLoading(true);
    setRecipes([]);
    setExpandedIndex(null);

    try {
      const ingredientList = ingredients.split(',').map(i => i.trim()).filter(i => i);
      const allergenNames = allergens.map(a => typeof a === 'string' ? a : a.name);
      const data = await api.recipes.generate(ingredientList, allergenNames, 'en');
      // Backend now returns { recipes: [...] }
      const recipeList = data.recipes || (Array.isArray(data) ? data : [data]);
      setRecipes(recipeList);
    } catch (err) {
      setError(`Failed to generate recipes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe_container">
      <header className="recipe_header">
        <button className="back_circle_btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1>AI Recipe Generator</h1>
          <p className="recipe_subtitle">Tell us what's in your fridge — we'll cook up ideas!</p>
        </div>
      </header>

      <div className="recipe_input_section">
        <div className="input_icon_row">
          <span className="input_emoji">🧑‍🍳</span>
          <p>Enter your available ingredients (comma separated) and our AI will generate <strong>multiple allergen-safe recipes</strong> just for you.</p>
        </div>
        <textarea 
          placeholder="e.g. Chicken, rice, broccoli, garlic, olive oil, lemon..." 
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={4}
        />
        <button className="generate_btn" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <span className="loading_spinner">
              <span className="spinner"></span> Generating recipes...
            </span>
          ) : (
            '✨ Generate Recipes'
          )}
        </button>
        {error && <div className="error_message">{error}</div>}
      </div>

      {recipes.length > 0 && (
        <div className="recipes_grid">
          <h2 className="results_title">
            🍽️ {recipes.length} Recipe{recipes.length > 1 ? 's' : ''} Generated
          </h2>

          {recipes.map((recipe, index) => (
            <div 
              key={index} 
              className={`recipe_result_card ${expandedIndex === index ? 'expanded' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="recipe_image_container" style={{ background: getRecipeVisual(recipe.name || recipe.recipeName).gradient }}>
                <div style={{ fontSize: '64px', textAlign: 'center', padding: '20px 0' }}>
                  {getRecipeVisual(recipe.name || recipe.recipeName).emoji}
                </div>
                <div className="recipe_time_pill">
                  ⏱ {recipe.cookingTime || '30 mins'} • 🍽 {recipe.servings || 2} servings
                </div>
                <div className="recipe_number">#{index + 1}</div>
              </div>
              
              <div className="recipe_body">
                <h2>{recipe.name || recipe.recipeName}</h2>
                <p className="recipe_desc">{recipe.description}</p>
                
                {recipe.safetyNote && (
                  <div className="safety_alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>{recipe.safetyNote}</span>
                  </div>
                )}

                <button 
                  className="expand_toggle"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  {expandedIndex === index ? 'Hide Details ▲' : 'View Full Recipe ▼'}
                </button>

                {expandedIndex === index && (
                  <div className="recipe_details_expanded">
                    <div className="recipe_section">
                      <h3>🥘 Ingredients</h3>
                      <ul className="ingredient_list">
                        {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                          <li key={i}>
                            {typeof ing === 'string' ? ing : `${ing.amount} ${ing.name}`}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="recipe_section">
                      <h3>📋 Instructions</h3>
                      <ol className="step_list">
                        {(recipe.instructions || recipe.steps) && (recipe.instructions || recipe.steps).map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
