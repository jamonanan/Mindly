const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let modified = false;

    // Inject CSS
    if (!content.includes('href="styles/settings.css"')) {
        content = content.replace('</head>', '    <link rel="stylesheet" href="styles/settings.css">\n</head>');
        modified = true;
    }

    // Inject JS
    if (!content.includes('src="settings.js"')) {
        content = content.replace('</body>', '    <script type="module" src="settings.js"></script>\n</body>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file} (already injected)`);
    }
});
