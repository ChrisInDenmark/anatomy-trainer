# Anatomy Trainer V0.1

A mobile-friendly anatomy flashcard/quiz web app.

## Run locally
Because the app loads `muscles.json`, serve the folder with a small web server:
`python -m http.server 8000`
Then open `http://localhost:8000`.

## GitHub Pages
1. Create a GitHub repository (for example `anatomy-trainer`).
2. Upload the contents of this folder to the repository root.
3. In GitHub: Settings → Pages → Deploy from a branch → `main` / root.
4. GitHub will provide the public web-app link.

## Images
V0.1 deliberately uses a simple body diagram rather than copyrighted anatomy art.
School images can later be added in an `images/` folder and associated with each
muscle in `muscles.json`. The study data and saved progress model do not need to change.

## Current deck
20 shoulder, scapular, chest/back and upper-arm muscles. Data includes origin,
insertion, main action and innervation.
