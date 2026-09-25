const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free"];
const cuisineOptions = ["Any", "Indian", "Italian", "Chinese", "Continental", "Mexican"];

export default function FiltersPanel({ dietary, onDietaryChange, cuisine, onCuisineChange, servings, onServingsChange, disabled }) {
  function handleDietaryChange(event) {
    const preference = event.target.value;
    if (event.target.checked) {
      onDietaryChange([...dietary, preference]);
    } else {
      onDietaryChange(dietary.filter(function keepPreference(item) {
        return item !== preference;
      }));
    }
  }

  function handleCuisineChange(event) {
    onCuisineChange(event.target.value);
  }

  function handleServingsChange(event) {
    onServingsChange(event.target.value === "" ? "" : Number(event.target.value));
  }

  function renderPreference(preference) {
    return (
      <label className="dietary-option" key={preference}>
        <input type="checkbox" value={preference} checked={dietary.includes(preference)} onChange={handleDietaryChange} />
        <span>{preference}</span>
      </label>
    );
  }

  function renderCuisine(option) {
    return <option key={option} value={option}>{option}</option>;
  }

  return (
    <fieldset className="filters-panel" disabled={disabled}>
      <legend>Make it your own</legend>
      <div className="dietary-group">
        <span className="field-label" id="dietary-label">Dietary preferences</span>
        <div className="dietary-options" role="group" aria-labelledby="dietary-label">
          {dietaryOptions.map(renderPreference)}
        </div>
      </div>
      <div className="filter-row">
        <div className="form-field cuisine-field">
          <label htmlFor="cuisine">Cuisine</label>
          <select id="cuisine" value={cuisine} onChange={handleCuisineChange}>{cuisineOptions.map(renderCuisine)}</select>
        </div>
        <div className="form-field servings-field">
          <label htmlFor="servings">Servings</label>
          <input id="servings" type="number" min="1" max="10" step="1" value={servings} onChange={handleServingsChange} inputMode="numeric" />
        </div>
      </div>
    </fieldset>
  );
}
