# Online Safety Hub (static demo)

This repository contains a small, static demo site showing online safety tips in a searchable, filterable, and sortable table.

Files added
- `index.html` — main page and UI (editing disabled)
- `css/styles.css` — styles and responsive layout
- `js/script.js` — client-side behavior: loads `/data/tips.json`, filter/sort; edit UI removed for safety
- `data/tips.json` — sample content

Run locally

1. From the repository root run a simple HTTP server (Python 3):

```bash
python3 -m http.server 8000 --directory /workspaces/wh3ax.github.io
```

2. Open http://localhost:8000 in your browser.

Notes
- The site loads initial tips from `/data/tips.json`. Editing and adding via the UI have been removed so visitors cannot modify tips from the site. Use the Export JSON button to download the dataset if you'd like to edit it offline and re-upload.

Next ideas
- Persist edits using a tiny server endpoint (POST) or GitHub Actions to commit changes.
- Add pagination for large datasets and highlighting of matched text.
