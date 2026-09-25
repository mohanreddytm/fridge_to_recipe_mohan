import { useState } from "react";
import IngredientsList from "./IngredientsList";
import StepsList from "./StepsList";

export default function RecipeCard({ recipe, initialServings = recipe.servings, onTryAnother, onSave, savedView = false, recipeId = "generated" }) {
  const [servings, setServings] = useState(initialServings);
  const totalTime = recipe.prepTime + recipe.cookTime;
  const totalCalories = Math.round(recipe.totalCalories * (servings / recipe.servings));

  function decreaseServings() {
    setServings(Math.max(1, servings - 1));
  }

  function increaseServings() {
    setServings(Math.min(10, servings + 1));
  }

  function handleSave() {
    onSave(recipe, servings);
  }

  function printRecipe() {
    window.print();
  }

  function renderTip(tip, index) {
    return <li key={index}>{tip}</li>;
  }

  return (
    <article className="recipe-display">
      <section className="card recipe-header">
        <p className="eyebrow">YOUR RECIPE</p>
        <h2>{recipe.dish}</h2>
        <p className="recipe-description">{recipe.description}</p>
        <dl className="recipe-badges">
          <div><dt>Difficulty</dt><dd><span className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span></dd></div>
          <div><dt>Total time</dt><dd>{totalTime} <span>min</span></dd></div>
          <div><dt>Calories · total</dt><dd>{totalCalories} <span>kcal</span></dd></div>
          <div><dt>Cuisine</dt><dd className="cuisine-value">{recipe.cuisine}</dd></div>
        </dl>
        <p className="recipe-time-note">{recipe.prepTime} min prep <span aria-hidden="true">·</span> {recipe.cookTime} min cook</p>
      </section>

      <section className="card servings-bar" aria-label="Scale recipe servings">
        <div><h3>At your table</h3><p>Ingredient quantities adjust with you.</p></div>
        <div className="servings-controls">
          <button type="button" onClick={decreaseServings} disabled={servings === 1} aria-label="Decrease servings">−</button>
          <span className="servings-value" aria-live="polite"><strong>{servings}</strong> {servings === 1 ? "serving" : "servings"}</span>
          <button type="button" onClick={increaseServings} disabled={servings === 10} aria-label="Increase servings">+</button>
        </div>
      </section>

      <div className="recipe-grid">
        <IngredientsList ingredients={recipe.ingredients} originalServings={recipe.servings} servings={servings} recipeId={recipeId} />
        <StepsList recipeSteps={recipe.steps} recipeId={recipeId} />
      </div>

      <section className="card tips-card" aria-labelledby={`${recipeId}-tips-heading`}>
        <h3 id={`${recipeId}-tips-heading`}><span aria-hidden="true">💡</span> Pro tips</h3>
        {recipe.tips.length > 0 ? <ul>{recipe.tips.map(renderTip)}</ul> : <p>No extra tips for this recipe.</p>}
      </section>

      <div className="recipe-actions">
        {!savedView && <button type="button" className="button button-secondary" onClick={onTryAnother}>🔄 Try Another Recipe</button>}
        {!savedView && <button type="button" className="button button-primary" onClick={handleSave}>💾 Save Recipe</button>}
        <button type="button" className="button button-quiet" onClick={printRecipe}>🖨️ Print Recipe</button>
      </div>
    </article>
  );
}
