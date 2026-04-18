const fs = require('fs');
let css = fs.readFileSync('frontend/app/globals.css', 'utf-8');

// 1. Update html.dark variables
css = css.replace(/html\.dark\s*\{[^}]+\}/, `html.dark {
  --background: #1c1612;
  --foreground: #ead4b2;
  --panel: rgba(35, 26, 18, 0.88);
  --panel-border: rgba(180, 148, 110, 0.15);
}`);

// 2. Update html.dark ::selection
css = css.replace(/html\.dark\s*::selection\s*\{[^}]+\}/, `html.dark ::selection {
  background: rgba(169, 138, 105, 0.28);
  color: #ead4b2;
}`);

// 3. Update html.dark ::-webkit-scrollbar-track
css = css.replace(/html\.dark\s*::-webkit-scrollbar-track\s*\{[^}]+\}/, `html.dark ::-webkit-scrollbar-track {
  background: rgba(80, 60, 40, 0.15);
}`);

// 4. Update html.dark ::-webkit-scrollbar-thumb
css = css.replace(/html\.dark\s*::-webkit-scrollbar-thumb\s*\{[^}]+\}/, `html.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #7a5f44, #5e4833);
  border-radius: 4px;
}`);

// 5. Update html.dark ::-webkit-scrollbar-thumb:hover
css = css.replace(/html\.dark\s*::-webkit-scrollbar-thumb:hover\s*\{[^}]+\}/, `html.dark ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #8f7055, #7a5f44);
}`);

// 6. Add inline theme variables
const themeInlineContent = `  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-panel: var(--panel);
  --color-panel-border: var(--panel-border);
  --font-reading: "Literata", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Baskerville", "Times New Roman", serif;
  --font-sans: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", ui-monospace, monospace;

  /* Warm Espresso System */
  --color-espresso-950: #1c1612;
  --color-espresso-900: #231a12;
  --color-espresso-800: #2b2016;
  --color-espresso-700: #33261a;
  --color-espresso-600: #3d2e1f;
  --color-espresso-500: #4a3c2e;
  --color-espresso-400: #5c4a38;
  --color-espresso-300: #6b5a4a;
  --color-espresso-200: #947f66;
  --color-espresso-100: #b89e80;
  --color-espresso-50: #d4b990;
  --color-cream: #ead4b2;`;

css = css.replace(/@theme\s*inline\s*\{[^}]+\}/, `@theme inline {\n${themeInlineContent}\n}`);

fs.writeFileSync('frontend/app/globals.css', css);
console.log('globals.css updated');
