import { useEffect, useRef, useState } from "react";
import IngredientInput from "./components/IngredientInput";
import FiltersPanel from "./components/FiltersPanel";
import RecipeCard from "./components/RecipeCard";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import SavedRecipes from "./components/SavedRecipes";
import { requestRecipe, unexpectedResponseMessage } from "./lib/api";
import { validateRecipe } from "./lib/validateRecipe";

const storageKey = "fridge-to-recipe.saved.v1";

function loadSavedRecipes() {
  try {
    const storedText = window.localStorage.getItem(storageKey);
    if (!storedText) return { recipes: [], error: "" };
    const entries = JSON.parse(storedText);
    if (!Array.isArray(entries)) throw new Error("Invalid saved list");

    const recipes = [];
    const usedIds = [];
    for (const entry of entries) {
      if (!entry || typeof entry.id !== "string" || !entry.id || usedIds.includes(entry.id)) continue;
      if (!validateRecipe(entry.recipe)) continue;
      if (!Number.isInteger(entry.servings) || entry.servings < 1 || entry.servings > 10) continue;
      recipes.push(entry);
      usedIds.push(entry.id);
    }
    return {
      recipes,
      error: recipes.length === entries.length ? "" : "Some saved recipes could not be read. Your valid recipes are still available.",
    };
  } catch {
    return { recipes: [], error: "Saved recipes could not be loaded from this browser. You can still generate a recipe." };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("generate");
  const [ingredients, setIngredients] = useState([]);
  const [draft, setDraft] = useState("");
  const [dietary, setDietary] = useState([]);
  const [cuisine, setCuisine] = useState("Any");
  const [servings, setServings] = useState(2);
  const [formError, setFormError] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [recipeVersion, setRecipeVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [error, setError] = useState("");
  const [savedData, setSavedData] = useState(loadSavedRecipes);
  const [toast, setToast] = useState(null);

  const requestId = useRef(0);
  const controllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastInputs = useRef(null);

  useEffect(function manageRequestCleanup() {
    return function cleanUpRequest() {
      requestId.current += 1;
      controllerRef.current?.abort();
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(function manageToast() {
    if (!toast) return;
    function hideToast() {
      setToast(null);
    }
    const timer = window.setTimeout(hideToast, 3000);
    return function cleanUpToast() {
      window.clearTimeout(timer);
    };
  }, [toast]);

  async function generateRecipe(inputs) {
    const thisId = ++requestId.current;
    controllerRef.current?.abort();
    window.clearTimeout(timeoutRef.current);

    const controller = new AbortController();
    controllerRef.current = controller;
    lastInputs.current = inputs;
    setLoading(true);
    setHasTimedOut(false);
    setError("");
    setFormError("");

    function showSlowRequestMessage() {
      if (thisId === requestId.current) setHasTimedOut(true);
    }
    timeoutRef.current = window.setTimeout(showSlowRequestMessage, 15000);

    try {
      const rawText = await requestRecipe(inputs, controller.signal);
      if (thisId !== requestId.current) return;

      let result;
      try {
        if (!rawText.trim()) throw new Error("Empty response");
        result = JSON.parse(rawText);
      } catch {
        throw new Error(unexpectedResponseMessage);
      }
      if (!validateRecipe(result)) throw new Error(unexpectedResponseMessage);

      setRecipe(result);
      setRecipeVersion(thisId); 
    } catch (requestError) {
      if (thisId !== requestId.current || requestError.name === "AbortError") return;
      setError(requestError.message || "Recipe generation failed. Please try again.");
    } finally {
      if (thisId === requestId.current) {
        window.clearTimeout(timeoutRef.current);
        controllerRef.current = null;
        setLoading(false);
        setHasTimedOut(false);
      }
    }
  }

  function handleGenerate(event) {
    event.preventDefault();
    const nextIngredients = [...ingredients];
    const pendingIngredient = draft.trim();
    const alreadyAdded = nextIngredients.some(function matchesPendingIngredient(item) {
      return item.toLowerCase() === pendingIngredient.toLowerCase();
    });
    if (pendingIngredient && !alreadyAdded) nextIngredients.push(pendingIngredient);

    if (!nextIngredients.length) {
      setFormError("Add at least one ingredient to get cooking.");
      return;
    }
    if (nextIngredients.length > 30 || pendingIngredient.length > 80) {
      setFormError("Use up to 30 ingredients, with no more than 80 characters each.");
      return;
    }
    if (!Number.isInteger(servings) || servings < 1 || servings > 10) {
      setFormError("Choose a whole number of servings from 1 to 10.");
      return;
    }

    setIngredients(nextIngredients);
    setDraft("");
    generateRecipe({ ingredients: nextIngredients, dietary: [...dietary], cuisine, servings });
  }

  function retryRecipe() {
    if (lastInputs.current) generateRecipe(lastInputs.current);
  }

  function cancelGeneration() {
    requestId.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    window.clearTimeout(timeoutRef.current);
    setLoading(false);
    setHasTimedOut(false);
    setError("");
  }

  function persistRecipes(nextRecipes) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextRecipes));
      setSavedData({ recipes: nextRecipes, error: "" });
      return true;
    } catch {
      setSavedData({ ...savedData, error: "Could not update saved recipes. Browser storage may be full or disabled." });
      return false;
    }
  }

  function saveRecipe(recipeToSave, selectedServings) {
    const recipeText = JSON.stringify(recipeToSave);
    const existing = savedData.recipes.find(function matchesSavedRecipe(entry) {
      return JSON.stringify(entry.recipe) === recipeText;
    });
    const entry = {
      id: existing ? existing.id : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      recipe: recipeToSave,
      servings: selectedServings,
    };
    const otherRecipes = savedData.recipes.filter(function keepOtherRecipe(item) {
      return item.id !== entry.id;
    });
    if (persistRecipes([entry, ...otherRecipes])) setToast({ message: "Saved!" });
  }

  function deleteRecipe(id) {
    const nextRecipes = savedData.recipes.filter(function keepRecipe(entry) {
      return entry.id !== id;
    });
    return persistRecipes(nextRecipes);
  }

  function showGenerateTab() {
    setActiveTab("generate");
  }

  function showSavedTab() {
    setActiveTab("saved");
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to recipes</a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#main-content" onClick={showGenerateTab}><span className="brand-mark" aria-hidden="true">🥬</span><span>fridge<span className="brand-to"> to </span>recipe<span className="brand-period">.</span></span></a>
          <span className="header-note">A little less waste. A lot more taste.</span>
        </div>
      </header>

      <main id="main-content" className="main-content">
        <nav className="view-tabs" aria-label="Recipe views">
          <button type="button" className={activeTab === "generate" ? "is-active" : ""} aria-pressed={activeTab === "generate"} onClick={showGenerateTab}>Generate</button>
          <button type="button" className={activeTab === "saved" ? "is-active" : ""} aria-pressed={activeTab === "saved"} onClick={showSavedTab}>Saved Recipes <span className="tab-count">{savedData.recipes.length}</span></button>
        </nav>

        {savedData.error && <div className="storage-warning" role="alert">{savedData.error}</div>}

        <div hidden={activeTab !== "generate"}>
          <div className="page-intro"><p className="eyebrow">FROM WHAT YOU HAVE, TO WHAT YOU LOVE</p><h1>Make something <span>delicious.</span></h1><p>Your ingredients. A fresh idea. Dinner, sorted.</p></div>
          <div className="generate-workspace">
            <form className="card generator-form" onSubmit={handleGenerate} noValidate>
              <div className="form-title"><span className="form-title-icon" aria-hidden="true">＋</span><div><h2>What's in your fridge?</h2><p>Start with whatever you have.</p></div></div>
              <IngredientInput ingredients={ingredients} onChange={setIngredients} draft={draft} onDraftChange={setDraft} disabled={loading} />
              <FiltersPanel dietary={dietary} onDietaryChange={setDietary} cuisine={cuisine} onCuisineChange={setCuisine} servings={servings} onServingsChange={setServings} disabled={loading} />
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button type="submit" className="button button-primary generate-button" disabled={loading}>{loading ? "Cooking up your recipe..." : "✨ Generate Recipe"}</button>
              <p className="form-bottom-note">A fresh recipe, made around you.</p>
            </form>

            <div className="recipe-region" aria-label="Recipe result">
              {loading ? (
                hasTimedOut ? <ErrorState isTimeout onCancel={cancelGeneration} onRetry={retryRecipe} /> : <LoadingState onCancel={cancelGeneration} />
              ) : error ? (
                <ErrorState message={error} onRetry={retryRecipe} />
              ) : recipe ? (
                <RecipeCard key={recipeVersion} recipe={recipe} onTryAnother={retryRecipe} onSave={saveRecipe} />
              ) : (
                <section className="card state-card welcome-card">
                  <div className="fridge-art" aria-hidden="true"><span className="floating-food tomato">🍅</span><span className="floating-food carrot">🥕</span><div className="fridge"><div className="freezer-door"><span /></div><div className="fridge-door"><span className="door-handle" /><span className="fridge-magnet">♥</span><span className="fridge-note">let's<br />cook!</span></div></div><span className="floating-food broccoli">🥦</span><span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span></div>
                  <p className="eyebrow">GOOD THINGS ARE COOKING</p>
                  <h2>A fridge full of possibilities.</h2>
                  <p>Tell us what's in your fridge and we'll whip up a recipe!</p>
                  <div className="welcome-bottom"><span aria-hidden="true">🥚</span><span aria-hidden="true">＋</span><span aria-hidden="true">🍅</span><span aria-hidden="true">＋</span><span aria-hidden="true">🥬</span><span className="welcome-equals" aria-hidden="true">=</span><span>your next favourite</span></div>
                </section>
              )}
            </div>
          </div>
        </div>

        {activeTab === "saved" && <SavedRecipes recipes={savedData.recipes} onDelete={deleteRecipe} onGenerate={showGenerateTab} />}
        <p className="sr-only" role="status">{!loading && !error && recipe ? `Recipe ready: ${recipe.dish}` : ""}</p>
      </main>
      <footer className="site-footer"><span>Made for your everyday kitchen.</span><span>Good food. Less waste.</span></footer>
      {toast && <div className="toast" role="status"><span aria-hidden="true">✓</span> {toast.message}</div>}
    </div>
  );
}
