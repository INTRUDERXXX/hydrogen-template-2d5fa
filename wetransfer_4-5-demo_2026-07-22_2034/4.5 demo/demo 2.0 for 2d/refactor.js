const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/USER/Downloads/wetransfer_demo-2-0-for-2d_2026-07-19_1402/demo 2.0 for 2d';

const files = ['index.html', 'home.html', 'dashboard.html', 'login.html', 'style.css'];

const replacements = {
    'student-notebook-theme': 'modern-architect-theme',
    'sketch-borders-right': 'pro-borders-right',
    'sketch-borers-right': 'pro-borders-right',
    'sketch-borders': 'pro-borders',
    'marker-font': 'heading-font',
    'mono-font': 'body-font',
    'sketchy-table': 'data-table',
    'sketchy-form': 'pro-form'
};

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        for (const [oldClass, newClass] of Object.entries(replacements)) {
            content = content.replace(new RegExp(oldClass, 'g'), newClass);
        }
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
