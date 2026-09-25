import { useState } from "react";
import RecipeCard from "./RecipeCard";

export default function SavedRecipes({ recipes, onDelete, onGenerate }) {
  const [expandedId, setExpandedId] = useState(null);

  function renderSavedRecipe(entry) {
    const isExpanded = expandedId === entry.id;
    const recipe = entry.recipe;

    function toggleRecipe() {
      setExpandedId(isExpanded ? null : entry.id);
    }

    function deleteRecipe() {
      const deleted = onDelete(entry.id);
      if (deleted && isExpanded) setExpandedId(null);
    }

    return (
      <article className={`saved-card ${isExpanded ? "is-expanded" : ""}`} key={entry.id}>
        <div className="saved-card-bar">
          <button type="button" className="saved-card-toggle" onClick={toggleRecipe} aria-expanded={isExpanded} aria-controls={`saved-${entry.id}`}>
            <span className="saved-dish-icon" aria-hidden="true">🍽️</span>
            <span className="saved-card-copy"><strong>{recipe.dish}</strong><span className="saved-meta"><span className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span><span>{recipe.prepTime + recipe.cookTime} min</span><span>{entry.servings} servings</span></span></span>
            <span className="expand-symbol" aria-hidden="true">{isExpanded ? "−" : "+"}</span>
          </button>
          <button type="button" className="delete-button" onClick={deleteRecipe} aria-label={`Delete ${recipe.dish}`}>Delete</button>
        </div>
        {isExpanded && <div className="saved-recipe-detail" id={`saved-${entry.id}`}><RecipeCard recipe={recipe} initialServings={entry.servings} savedView recipeId={entry.id} /></div>}
      </article>
    );
  }

  return (
    <section className="saved-recipes">
      <div className="saved-section-heading"><div><p className="eyebrow">YOUR PERSONAL COOKBOOK</p><h1>Recipes worth keeping.</h1></div><span className="recipe-count">{recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}</span></div>
      {recipes.length === 0 ? (
        <div className="card state-card saved-empty">
          <span className="saved-empty-icon" aria-hidden="true">📖</span>
          <h2>Your cookbook starts here.</h2>
          <p>Save a recipe you love and find it here next time.</p>
          <button type="button" className="button button-primary" onClick={onGenerate}>Create your first recipe</button>
        </div>
      ) : <div className="saved-list">{recipes.map(renderSavedRecipe)}</div>}
    </section>
  );
}
