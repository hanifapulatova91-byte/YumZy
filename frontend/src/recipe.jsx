import React, { useState } from 'react';
import { api } from './api';
import './recipe.css';

// Dynamic image helper
const getRecipeImage = (name, index) => {
  return `https://loremflickr.com/800/600/food,${encodeURIComponent(name || 'dish')}?lock=${index}`;
};

const RecipeGenerator = ({ onBack }) => {
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
      const data = await api.recipes.generate(ingredientList, 'en');
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
              <div className="recipe_image_container">
                <img src={getRecipeImage(recipe.name || recipe.recipeName, index)} alt={recipe.name || recipe.recipeName} />
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
