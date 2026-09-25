import { useState } from "react";

function formatQuantity(quantity) {
  return new Intl.NumberFormat("en", { maximumSignificantDigits: 3 }).format(quantity);
}

export default function IngredientsList({ ingredients, originalServings, servings, recipeId }) {
  const [openSwaps, setOpenSwaps] = useState([]);

  function toggleSwap(index) {
    if (openSwaps.includes(index)) {
      setOpenSwaps(openSwaps.filter(function keepOpenSwap(item) {
        return item !== index;
      }));
    } else {
      setOpenSwaps([...openSwaps, index]);
    }
  }

  function renderIngredient(ingredient, index) {
    const scaledQuantity = ingredient.quantity * (servings / originalServings);
    const isOpen = openSwaps.includes(index);

    function handleSwap() {
      toggleSwap(index);
    }

    return (
      <li className="recipe-ingredient" key={`${ingredient.name}-${index}`}>
        <div className="ingredient-line">
          <div className="ingredient-detail">
            <span className="ingredient-name">{ingredient.name}</span>
            <span className="ingredient-quantity" key={servings}>{formatQuantity(scaledQuantity)} {ingredient.unit}</span>
          </div>
          {ingredient.swap !== null && (
            <button className={`swap-button ${isOpen ? "is-active" : ""}`} type="button" onClick={handleSwap} aria-expanded={isOpen} aria-controls={`${recipeId}-swap-${index}`}>
              Swap <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
          )}
        </div>
        {ingredient.swap !== null && (
          <div id={`${recipeId}-swap-${index}`} className={`swap-content ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
            <div><p><span aria-hidden="true">↳</span> Try {ingredient.swap}</p></div>
          </div>
        )}
      </li>
    );
  }

  return (
    <section className="card ingredients-card" aria-labelledby={`${recipeId}-ingredients-heading`}>
      <div className="section-title-row">
        <h3 id={`${recipeId}-ingredients-heading`}>Ingredients</h3>
        <span className="small-label">For {servings}</span>
      </div>
      <ul className="recipe-ingredients">{ingredients.map(renderIngredient)}</ul>
      <p className="ingredient-footnote">A swap is a suggestion; quantities may need adjusting.</p>
    </section>
  );
}
