# Fridge to Recipe

Type what's in your fridge, get an AI-generated recipe, 
and cook through it interactively.

Built for Flam's frontend internship assignment.

## Tech Stack
- React + Vite (frontend)
- Node.js + Express (backend proxy)
- Groq API for AI recipe generation

## Features
- Tag-style ingredient input
- Dietary filters (Vegetarian, Vegan, Gluten-Free) and cuisine selector
- Servings scaler — adjusts ingredient quantities in real time
- Step checklist with progress bar
- Ingredient swap suggestions
- Save recipes to browser storage
- Print recipe

## Demo
https://drive.google.com/file/d/1R1aQEyX7_qIOEHEHgsYCkaoAYzskgOLe/view?usp=sharing

## Known Limitations
- Groq's original model (llama3-8b-8192) is retired. 
  Using openai/gpt-oss-20b via the .env setting instead.
- Saved recipes are browser-only, no cross-device sync.
- Servings scaling updates quantities but not numbers 
  inside step instructions.
- Calories and times are AI estimates, not precise.

## Time Spent
~8 hours total (setup, building, testing, understanding the code)