import { useState } from "react";

export default function StepsList({ recipeSteps, recipeId }) {
  const [steps, setSteps] = useState(recipeSteps);

  const completedCount = steps.filter(function isCompleted(step) {
    return step.done;
  }).length;
  const progress = (completedCount / steps.length) * 100;

  function toggleStep(stepId) {
    setSteps(steps.map(function updateStep(step) {
      return step.id === stepId ? { ...step, done: !step.done } : step;
    }));
  }

  function renderStep(step, index) {
    function handleToggle() {
      toggleStep(step.id);
    }

    return (
      <li className={`recipe-step ${step.done ? "is-complete" : ""}`} key={step.id}>
        <label>
          <input type="checkbox" checked={step.done} onChange={handleToggle} aria-label={`Step ${index + 1}: ${step.instruction}`} />
          <span className="step-content">
            <span className="step-topline"><span>Step {index + 1}</span><span className="step-duration">◷ {step.duration} min</span></span>
            <span className="step-instruction">{step.instruction}</span>
          </span>
        </label>
      </li>
    );
  }

  return (
    <section className="card steps-card" aria-labelledby={`${recipeId}-steps-heading`}>
      <h3 id={`${recipeId}-steps-heading`}>Let's get cooking</h3>
      <p className="progress-label" aria-live="polite">{completedCount} of {steps.length} steps done{completedCount === steps.length ? " · Bon appétit!" : ""}</p>
      <div className="progress-track" role="progressbar" aria-label="Recipe completion" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completedCount} aria-valuetext={`${completedCount} of ${steps.length} steps done`}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <ol className="recipe-steps">{steps.map(renderStep)}</ol>
    </section>
  );
}
