# IAPR Project Demo

Static, demo-first project page for **Identity-Aware Prototype Regularization for Text-Based Person Search**.

## Files

- `index.html` — page content and semantic structure
- `tokens.css` — design tokens / typography / colors
- `styles.css` — components, layout, responsive rules
- `script.js` — IAPR walkthrough, retrieval-example switcher, citation copy, reveal motion
- `assets/examples/` — curated qualitative strips cropped from the uploaded supplementary material
- `documents/` — uploaded paper and supplementary PDF

## Local preview

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Before public release

1. Replace the disabled **Code · coming soon** button with the public repository URL.
2. Replace anonymous citation metadata after de-anonymization.
3. Re-check the venue's review/public-sharing policy before deploying. The uploaded manuscript currently identifies itself as an anonymized submission and includes a no-public-sharing notice.
4. If raw qualitative retrieval images become available, replace the current cropped supplementary strips in `assets/examples/` with native-resolution assets. No HTML/JS restructuring is required.

## Design intent

This page is intentionally **not** a web replica of the paper. It keeps only the demo narrative:

1. identity confusion in TBPS,
2. a four-step interactive IAPR walkthrough,
3. a compact result snapshot,
4. three qualitative retrieval comparisons,
5. links to the paper/supplementary material for details.
