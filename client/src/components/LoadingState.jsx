import { useEffect, useState } from "react";

const messages = ["Checking your fridge...", "Combining ingredients...", "Almost ready...", "Plating your dish..."];

export default function LoadingState({ onCancel }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(function rotateLoadingMessages() {
    function showNextMessage() {
      setMessageIndex(function nextIndex(currentIndex) {
        return (currentIndex + 1) % messages.length;
      });
    }
    const interval = window.setInterval(showNextMessage, 2000);

    return function cleanUpInterval() {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="card state-card loading-card">
      <div className="loading-art" aria-hidden="true"><span className="loading-emoji">🥘</span></div>
      <p className="eyebrow">A LITTLE KITCHEN MAGIC</p>
      <h2>Cooking up your recipe...</h2>
      <p className="rotating-message" role="status" aria-live="polite">{messages[messageIndex]}</p>
      <div className="loading-dots" aria-hidden="true"><span /><span /><span /></div>
      <button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button>
    </section>
  );
}
