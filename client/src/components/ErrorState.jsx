export default function ErrorState({ message, onRetry, onCancel, isTimeout = false }) {
  return (
    <section className={`card state-card error-card ${isTimeout ? "timeout-card" : ""}`} role="alert">
      <span className="error-icon" aria-hidden="true">{isTimeout ? "⏳" : "🥄"}</span>
      <p className="eyebrow">{isTimeout ? "STILL IN THE KITCHEN" : "LET'S GIVE THAT ANOTHER TRY"}</p>
      <h2>{isTimeout ? "This is taking longer than expected..." : "A small kitchen hiccup"}</h2>
      <p className="error-message">{isTimeout ? "You can keep waiting, cancel, or start a fresh request." : message}</p>
      <div className="state-actions">
        {isTimeout && <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>}
        <button type="button" className="button button-primary" onClick={onRetry}>Retry</button>
      </div>
    </section>
  );
}
