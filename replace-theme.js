const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('/home/raven/echo-read/frontend/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Mapping based on the examples and maintaining contrast
  // dark:bg-espresso-900, dark:text-cream, dark:border-espresso-400
  // dark:slate-500 -> dark:espresso-400 (deduced from example)
  const replacements = [
    [/dark:([a-z]+)-slate-950/g, 'dark:$1-espresso-950'],
    [/dark:([a-z]+)-slate-900/g, 'dark:$1-espresso-900'],
    [/dark:([a-z]+)-slate-800/g, 'dark:$1-espresso-800'],
    [/dark:([a-z]+)-slate-700/g, 'dark:$1-espresso-700'],
    [/dark:([a-z]+)-slate-600/g, 'dark:$1-espresso-600'],
    [/dark:([a-z]+)-slate-500/g, 'dark:$1-espresso-400'],
    [/dark:([a-z]+)-slate-400/g, 'dark:$1-espresso-300'],
    [/dark:([a-z]+)-slate-300/g, 'dark:$1-espresso-200'],
    [/dark:([a-z]+)-slate-200/g, 'dark:$1-espresso-100'],
    [/dark:([a-z]+)-slate-100/g, 'dark:$1-cream'],
    [/dark:([a-z]+)-slate-50/g, 'dark:$1-cream'],
    
    // Also handle hover:text-slate, hover:bg-slate, etc., if they have dark: prefix
    [/dark:hover:([a-z]+)-slate-950/g, 'dark:hover:$1-espresso-950'],
    [/dark:hover:([a-z]+)-slate-900/g, 'dark:hover:$1-espresso-900'],
    [/dark:hover:([a-z]+)-slate-800/g, 'dark:hover:$1-espresso-800'],
    [/dark:hover:([a-z]+)-slate-700/g, 'dark:hover:$1-espresso-700'],
    [/dark:hover:([a-z]+)-slate-600/g, 'dark:hover:$1-espresso-600'],
    [/dark:hover:([a-z]+)-slate-500/g, 'dark:hover:$1-espresso-400'],
    [/dark:hover:([a-z]+)-slate-400/g, 'dark:hover:$1-espresso-300'],
    [/dark:hover:([a-z]+)-slate-300/g, 'dark:hover:$1-espresso-200'],
    [/dark:hover:([a-z]+)-slate-200/g, 'dark:hover:$1-espresso-100'],
    [/dark:hover:([a-z]+)-slate-100/g, 'dark:hover:$1-cream'],
    [/dark:hover:([a-z]+)-slate-50/g, 'dark:hover:$1-cream'],
    
    [/dark:placeholder:([a-z]+)-slate-500/g, 'dark:placeholder:$1-espresso-400'],
    [/dark:focus:([a-z]+)-slate-500/g, 'dark:focus:$1-espresso-400'],
    
    // Some classes might just be slate- without bg- or text-
    // Let's capture the ones that match exact slate-* in dark mode context
  ];

  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  // Warm up the dark mode shadows a bit (optional, but requested "Make sure to apply the specified dark shadows as well")
  // The dark shadows are typically rgba(0,0,0,0.22) or (0,0,0,0.28).
  // Let's change them to #1c1612 (espresso-950) with similar opacity -> rgba(28,22,18,0.22)
  content = content.replace(/dark:shadow-\[0_12px_30px_rgba\(0,0,0,0\.22\)\]/g, 'dark:shadow-[0_12px_30px_rgba(28,22,18,0.35)]');
  content = content.replace(/dark:shadow-\[0_18px_44px_rgba\(0,0,0,0\.28\)\]/g, 'dark:shadow-[0_18px_44px_rgba(28,22,18,0.4)]');
  content = content.replace(/dark:shadow-\[0_14px_36px_rgba\(0,0,0,0\.22\)\]/g, 'dark:shadow-[0_14px_36px_rgba(28,22,18,0.35)]');
  content = content.replace(/dark:shadow-\[0_18px_44px_rgba\(0,0,0,0\.26\)\]/g, 'dark:shadow-[0_18px_44px_rgba(28,22,18,0.4)]');
  // Inset shadow
  content = content.replace(/dark:shadow-\[inset_0_1px_0_rgba\(255,255,255,0\.02\)\]/g, 'dark:shadow-[inset_0_1px_0_rgba(234,212,178,0.04)]'); // cream with low opacity

  // What about "dark:bg-red-950/40"? Keep it as is since it's not slate.

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
