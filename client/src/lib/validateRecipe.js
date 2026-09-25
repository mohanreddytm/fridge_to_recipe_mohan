function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonnegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function hasExactKeys(value, keys) {
  if (!isObject(value) || Object.keys(value).length !== keys.length) return false;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) return false;
  }
  return true;
}

export function validateRecipe(recipe) {
  const recipeKeys = ["dish", "description", "difficulty", "prepTime", "cookTime", "totalCalories", "servings", "cuisine", "tips", "ingredients", "steps"];
  if (!hasExactKeys(recipe, recipeKeys)) return false;

  if (!isText(recipe.dish) || !isText(recipe.description) || !isText(recipe.cuisine)) return false;
  if (!["Easy", "Medium", "Hard"].includes(recipe.difficulty)) return false;
  if (!isNonnegativeNumber(recipe.prepTime) || !isNonnegativeNumber(recipe.cookTime)) return false;
  if (!isNonnegativeNumber(recipe.totalCalories)) return false;
  if (!Number.isInteger(recipe.servings) || recipe.servings < 1 || recipe.servings > 10) return false;

  if (!Array.isArray(recipe.tips)) return false;
  for (const tip of recipe.tips) {
    if (!isText(tip)) return false;
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) return false;
  for (const ingredient of recipe.ingredients) {
    if (!hasExactKeys(ingredient, ["name", "quantity", "unit", "swap"])) return false;
    if (!isText(ingredient.name) || !isText(ingredient.unit)) return false;
    if (!isNonnegativeNumber(ingredient.quantity) || ingredient.quantity === 0) return false;
    if (ingredient.swap !== null && !isText(ingredient.swap)) return false;
  }

  if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) return false;
  const usedIds = [];
  for (const step of recipe.steps) {
    if (!hasExactKeys(step, ["id", "instruction", "duration", "done"])) return false;
    if (!Number.isInteger(step.id) || step.id < 1 || usedIds.includes(step.id)) return false;
    if (!isText(step.instruction) || !isNonnegativeNumber(step.duration)) return false;
    if (typeof step.done !== "boolean") return false;
    usedIds.push(step.id);
  }

  return true;
}
