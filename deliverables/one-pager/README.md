# Key Decisions One-Pager

Evaluator-facing decision brief: architecture as implemented, five principal decisions
with tradeoffs, and the bottom-line build-vs-buy implication.

## Files

- `key-decisions.md` — Markdown source (content of record)
- `key-decisions.html` — print-ready HTML (US Letter, print CSS, one physical page)
- `key-decisions.pdf` — generated PDF (validated: exactly 1 page)
- `render-one-pager.mjs` — renders the HTML to PDF via headless Chromium (Playwright,
  reused from `../video/node_modules`) and validates: file exists, non-zero, page count
  == 1, no browser console errors during rendering.

## Regenerate

```bash
# prerequisite: npm install has been run in ../video (provides Playwright)
node render-one-pager.mjs
```

Page format: US Letter (chosen over A4 for a US-market evaluation; set in `@page` and
the Playwright `format` option).
