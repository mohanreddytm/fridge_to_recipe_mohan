import { useState } from "react";

export default function IngredientInput({ ingredients, onChange, draft, onDraftChange, disabled }) {
  const [message, setMessage] = useState("");

  function addIngredients(text) {
    const nextIngredients = [...ingredients];
    let nextMessage = "";

    for (const part of text.split(/[,\n]/)) {
      const ingredient = part.trim();
      if (!ingredient) continue;
      const alreadyAdded = nextIngredients.some(function matchesIngredient(existing) {
        return existing.toLowerCase() === ingredient.toLowerCase();
      });
      if (alreadyAdded) continue;
      if (ingredient.length > 80) {
        nextMessage = "Please keep each ingredient under 81 characters.";
        continue;
      }
      if (nextIngredients.length >= 30) {
        nextMessage = "You can add up to 30 ingredients.";
        break;
      }
      nextIngredients.push(ingredient);
    }

    onChange(nextIngredients);
    setMessage(nextMessage);
  }

  function handleKeyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addIngredients(draft);
      onDraftChange("");
    }
  }

  function handleChange(event) {
    const value = event.target.value;
    setMessage("");
    if (value.includes(",")) {
      const parts = value.split(",");
      const unfinishedText = parts.pop();
      addIngredients(parts.join(","));
      onDraftChange(unfinishedText);
    } else {
      onDraftChange(value);
    }
  }

  function handlePaste(event) {
    const text = event.clipboardData.getData("text");
    if (!/[,\n]/.test(text)) return;
    event.preventDefault();
    addIngredients([draft, text].filter(Boolean).join(","));
    onDraftChange("");
  }

  function renderIngredient(ingredient) {
    function removeIngredient() {
      onChange(ingredients.filter(function keepIngredient(item) {
        return item !== ingredient;
      }));
    }

    return (
      <li className="ingredient-chip" key={ingredient}>
        <span>{ingredient}</span>
        <button type="button" onClick={removeIngredient} disabled={disabled} aria-label={`Remove ${ingredient}`}>
          ×
        </button>
      </li>
    );
  }

  return (
    <div className="ingredient-input-section">
      <div className="field-heading">
        <label htmlFor="ingredient-input">Your ingredients</label>
        <span className="count-label">{ingredients.length} / 30</span>
      </div>
      <div className={`tag-input ${disabled ? "is-disabled" : ""}`}>
        {ingredients.length > 0 && <ul className="chip-list">{ingredients.map(renderIngredient)}</ul>}
        <input
          id="ingredient-input"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          maxLength={80}
          autoComplete="off"
          placeholder="Type an ingredient and press Enter..."
          aria-describedby="ingredient-help ingredient-message"
        />
      </div>
      <p id="ingredient-help" className="field-help">Press Enter or comma to add. Think eggs, tomatoes, rice…</p>
      <p id="ingredient-message" className="field-error" role="status">{message}</p>
    </div>
  );
}
