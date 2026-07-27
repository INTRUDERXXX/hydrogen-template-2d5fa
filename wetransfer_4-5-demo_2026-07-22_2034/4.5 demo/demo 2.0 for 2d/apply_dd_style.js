const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/USER/Downloads/wetransfer_demo-2-0-for-2d_2026-07-19_1402/demo 2.0 for 2d';
const cssPath = path.join(dir, 'style.css');

if (fs.existsSync(cssPath)) {
    let content = fs.readFileSync(cssPath, 'utf8');

    // 1. Change font imports to use Playfair Display and Montserrat
    content = content.replace(
        /@import url\('https:\/\/fonts.googleapis.com\/css2\?family=Inter[^\)]+'\);/,
        "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');"
    );

    // 2. Change root variables
    content = content.replace(/--font-heading: 'Outfit', sans-serif;/g, "--font-heading: 'Playfair Display', serif;");
    content = content.replace(/--font-sans-alt/g, "--font-sans");
    content = content.replace(/--font-sans: 'Inter', sans-serif;/g, "--font-sans: 'Montserrat', sans-serif;");

    // Colors
    content = content.replace(/--surface-dark: #1E1E20;/g, "--surface-dark: #FFFFFF;"); // Convert to purely light theme
    content = content.replace(/--surface-light: #fafafa;/g, "--surface-light: #F9F9F9;");
    content = content.replace(/--dark-charcoal: #1C1C1E;/g, "--dark-charcoal: #2A2A2A;");
    content = content.replace(/--wood-brown: #8C6A48;/g, "--wood-brown: #7A4727;"); // Match logo.svg mahogany
    content = content.replace(/--accent-gold: #B4855D;/g, "--accent-gold: #D7B78A;"); // Match logo.svg gold
    content = content.replace(/--marker-red: #C58A59;/g, "--marker-red: #D7B78A;");
    content = content.replace(/--sheet-cream: #F5F5F7;/g, "--sheet-cream: #FDFDFD;");
    content = content.replace(/--sheet-yellow: #E9E9EB;/g, "--sheet-yellow: #F4F0EB;");
    content = content.replace(/--grid-blue: #D0D0D5;/g, "--grid-blue: #E8E5DF;");
    content = content.replace(/--border-color: rgba\(28, 28, 30, 0\.10\);/g, "--border-color: rgba(42, 42, 42, 0.08);");

    // Adjust body styling to remove dark gradients
    content = content.replace(
        /radial-gradient\(ellipse at 50% 0%, rgba\(255, 255, 255, 0\.04\) 0%, rgba\(0, 0, 0, 0\.6\) 100%\), linear-gradient\(180deg, #1C1C1E 0%, #0A0A0B 100%\)/g,
        'linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 100%)'
    );

    // Header gradient
    content = content.replace(
        /linear-gradient\(135deg, #1C1C1E, #121214\)/g,
        'linear-gradient(135deg, #FFFFFF, #F8F8F8)'
    );

    // Header Links (need to be dark on white bg)
    content = content.replace(
        /\.nav-link\s*{[\s\S]*?color:\s*#fff;\s*}/g,
        '.nav-link { color: var(--dark-charcoal); }'
    );
    // Instead of replacing blindly, we can append a strong override at the bottom of the file
    content += `\n/* D&D Theme Overrides */
    .app-header { box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
    .nav-link { color: var(--dark-charcoal) !important; background: transparent; border: none; }
    .nav-link:hover { background: rgba(0,0,0,0.02); }
    .nav-link.active { background: transparent; border-bottom: 2px solid var(--accent-gold); color: var(--dark-charcoal); box-shadow: none; font-weight: 600; border-radius: 0; }
    .logo-texts h1, .logo-texts p { color: var(--dark-charcoal); }
    .logo-texts p { letter-spacing: 0.2em; font-size: 9px; margin-top: 4px; }
    `;

    fs.writeFileSync(cssPath, content);
}

const htmlFiles = ['index.html', 'home.html', 'dashboard.html', 'login.html'];
htmlFiles.forEach(file => {
    const p = path.join(dir, file);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    // Remove the custom block we put in for the icon
    content = content.replace(/<div class="logo-icon[\s\S]*?BP<\/div>/g, '<img src="./Screenshot_20230828-162649_Gallery.jpg" alt="Best fit Carpenters" class="logo-svg" style="height: 44px; display: block;">');

    // We already have `<img src="./Screenshot_20230828-162649_Gallery.jpg" ...>` inside `<div class="logo-texts">` in the old html.
    // Wait, let's just clean out the logo-section completely.
    content = content.replace(/<div class="logo-section">[\s\S]*?<\/div>\s*<\/div>/g,
        `<div class="logo-section">
            <a href="home.html" style="text-decoration:none;"><img src="./Screenshot_20230828-162649_Gallery.jpg" alt="Best fit Carpenters Front Logo" style="height: 48px; display: block;"></a>
        </div>`);

    fs.writeFileSync(p, content);
});

const jsPath = path.join(dir, 'ytcodedemo2.0.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

// Update colors in JS
jsContent = jsContent.replace(/'#ECECEE';/g, "'#FDFDFD';"); // Clean white
jsContent = jsContent.replace(/'#F6F6F8';/g, "'#F9F9F9';"); // Near white
jsContent = jsContent.replace(/'#DFDFE3';/g, "'#F0F0F0';");
jsContent = jsContent.replace(/'#E8E8EA';/g, "'#F4F4F4';");
jsContent = jsContent.replace(/const strokeCol = '#1C1C1E';/g, "const strokeCol = '#2A2A2A';"); // Darker drafting logic
jsContent = jsContent.replace(/setAttribute\('stroke', '#8C6A48'\)/g, "setAttribute('stroke', '#D7B78A')"); // Switch to gold accent 
jsContent = jsContent.replace(/setAttribute\('fill', '#8C6A48'\)/g, "setAttribute('fill', '#D7B78A')");
jsContent = jsContent.replace(/shape\.setAttribute\('stroke', 'var\(--dark-charcoal\)'\);/g, "shape.setAttribute('stroke', 'var(--dark-charcoal)'); shape.setAttribute('stroke-opacity', '0.6');");

fs.writeFileSync(jsPath, jsContent);
console.log('D&D styling applied successfully');
