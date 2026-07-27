const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/USER/Downloads/wetransfer_demo-2-0-for-2d_2026-07-19_1402/demo 2.0 for 2d';
const files = ['index.html', 'home.html', 'dashboard.html', 'login.html'];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove or replace emojis
        content = content.replace(/📏/g, '');
        content = content.replace(/📊/g, '');
        content = content.replace(/🔐/g, '');
        content = content.replace(/➕/g, '');
        content = content.replace(/🔄/g, '');
        content = content.replace(/🗑️/g, '');
        content = content.replace(/💡/g, '');

        content = content.replace(/<div class="logo-icon pro-borders">/g, '<div class="logo-icon pro-borders" style="background:var(--wood-brown); color:white; font-family:var(--font-heading); font-size:16px;">BP');
        content = content.replace(/<div class="logo-icon">/g, '<div class="logo-icon" style="background:var(--wood-brown); color:white; font-family:var(--font-heading); font-size:16px;">BP');

        fs.writeFileSync(filePath, content);
    }
});

const jsPath = path.join(dir, 'ytcodedemo2.0.js');
if (fs.existsSync(jsPath)) {
    let jsContent = fs.readFileSync(jsPath, 'utf8');

    // Replace colors
    jsContent = jsContent.replace(/return '#f5e4cc'; \/\/ Light beech/g, "return '#ECECEE'; // Clean CAD");
    jsContent = jsContent.replace(/return '#fbf0e0'; \/\/ Softer beige/g, "return '#F6F6F8'; // Clean CAD");
    jsContent = jsContent.replace(/return '#ebd1a9'; \/\/ Pine wood/g, "return '#DFDFE3'; // Clean CAD");
    jsContent = jsContent.replace(/return '#e4c49d'; \/\/ Muted cherry wood/g, "return '#E8E8EA'; // Clean CAD");

    jsContent = jsContent.replace(/const strokeCol = '#4a4a4a';/g, "const strokeCol = '#1C1C1E';");
    jsContent = jsContent.replace(/setAttribute\('stroke', '#a12c2c'\)/g, "setAttribute('stroke', '#8C6A48')");
    jsContent = jsContent.replace(/setAttribute\('fill', '#9c8163'\)/g, "setAttribute('fill', '#8C6A48')");
    jsContent = jsContent.replace(/shape\.setAttribute\('stroke-width', 1\.5\);/g, "shape.setAttribute('stroke-width', 1);");

    fs.writeFileSync(jsPath, jsContent);
}

console.log('HTML emojis and JS CAD colors updated.');
