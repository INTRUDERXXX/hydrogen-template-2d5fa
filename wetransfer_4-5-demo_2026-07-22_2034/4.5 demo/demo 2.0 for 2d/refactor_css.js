const fs = require('fs');
const path = require('path');

const cssPath = 'c:/Users/USER/Downloads/wetransfer_demo-2-0-for-2d_2026-07-19_1402/demo 2.0 for 2d/style.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Replace font variables
content = content.replace(/--font-hand/g, '--font-heading');
content = content.replace(/--font-mono/g, '--font-sans-alt');

// Colors replacement for a "wood-charcoal" architectural look
content = content.replace(/--sheet-cream: #FAF6F0;/g, '--sheet-cream: #F5F5F7;'); // cleaner, slightly sharper light background
content = content.replace(/--grid-blue: #ebd1a9;/g, '--grid-blue: #D0D0D5;');
content = content.replace(/--pencil-gray: #5e4737;/g, '--pencil-gray: #6F6F76;');
content = content.replace(/--dark-charcoal: #251810;/g, '--dark-charcoal: #1C1C1E;');
content = content.replace(/--marker-red: #a73a24;/g, '--marker-red: #C58A59;'); // Wood tone substituted for red
content = content.replace(/--sheet-yellow: #f8e5cc;/g, '--sheet-yellow: #E9E9EB;');
content = content.replace(/--tape-color: rgba\(122, 71, 39, 0.08\);/g, '--tape-color: rgba(28, 28, 30, 0.05);');
content = content.replace(/--wood-brown: #8a532d;/g, '--wood-brown: #8C6A48;');
content = content.replace(/--wood-dark: #3a2213;/g, '--wood-dark: #121214;');
content = content.replace(/--wood-light: #ebd0ad;/g, '--wood-light: #D5B99F;');
content = content.replace(/--accent-gold: #c38446;/g, '--accent-gold: #B4855D;');
content = content.replace(/--border-color: rgba\(37, 24, 16, 0.12\);/g, '--border-color: rgba(28, 28, 30, 0.10);');

// Body gradient
content = content.replace(
    /radial-gradient\(ellipse at 50% 10%, rgba\(250, 246, 240, 0.03\) 0%, rgba\(0, 0, 0, 0.5\) 100%\),\s*linear-gradient\(180deg, #2b1a0e 0%, #150b05 100%\)/g,
    'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0.6) 100%), linear-gradient(180deg, #1C1C1E 0%, #0A0A0B 100%)'
);

// App header gradient
content = content.replace(
    /linear-gradient\(135deg, #2A1A0F, #1F120A\)/g,
    'linear-gradient(135deg, #1C1C1E, #121214)'
);

// Fonts for .heading-font and .body-font
content = content.replace(
    /\.heading-font \{\s*font-family: var\(--font-heading\);\s*font-weight: 600;/g,
    '.heading-font {\n    font-family: var(--font-heading);\n    font-weight: 700;'
);
content = content.replace(
    /\.body-font \{\s*font-family: var\(--font-sans-alt\);/g,
    '.body-font {\n    font-family: var(--font-sans);'
);

// Decrease border-radius on buttons/boxes for modern look
content = content.replace(/border-radius: 8px;/g, 'border-radius: 4px;');
content = content.replace(/border-radius: 6px;/g, 'border-radius: 4px;');
content = content.replace(/border-radius: 12px;/g, 'border-radius: 6px;');

// Tab active and input focus colors check
// Box shadows for sketch-borders mapping
content = content.replace(
    /box-shadow: 0 4px 12px rgba\(37, 24, 16, 0.04\), 0 1px 4px rgba\(0, 0, 0, 0.02\);/g,
    'box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02);'
);

fs.writeFileSync(cssPath, content);
console.log('CSS Styles successfully updated');
