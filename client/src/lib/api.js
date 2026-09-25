export const unexpectedResponseMessage = "Recipe generation failed. The AI returned an unexpected response.";
export const connectionErrorMessage = "Could not connect to server. Check your connection.";

export async function requestRecipe(inputs, signal) {
  let response;
  let responseText;

  try {
    response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
      signal,
    });
    responseText = await response.text();
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(connectionErrorMessage);
  }

  if (!response.ok) {
    let serverError;
    try {
      serverError = JSON.parse(responseText);
    } catch {
      throw new Error(connectionErrorMessage);
    }

    if (serverError?.error === "AI request failed") {
      throw new Error("Recipe generation failed. Please try again.");
    }
    if (response.status === 400 || response.status === 413) {
      throw new Error("Please check your ingredients and filters, then try again.");
    }
    throw new Error(connectionErrorMessage);
  }

  return responseText;
}
