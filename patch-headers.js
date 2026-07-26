const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = ['dashboard.html', 'study-plan.html', 'reading-buddy.html', 'quizzes.html', 'mental-health.html', 'lessons.html', 'focus-timer.html'];

const accountBtnHtml = `
                <a href="account.html" class="btn btn-secondary" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0.8rem; border-radius: 50px; text-decoration: none; color: inherit;">
                    <img src="" class="user-profile-pic" alt="Profile" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; background: #e0e0e0;">
                    <span>Account</span>
                </a>`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // In dashboard.html, replace "→ Logout" with Account button
    if (file === 'dashboard.html') {
        if (content.includes('→ Logout')) {
            content = content.replace(/<a href="login\.html" class="btn btn-secondary".*?>\s*→ Logout\s*<\/a>/s, accountBtnHtml.trim());
            modified = true;
        }
    } else {
        // In other files, insert account button after settings button if not already there
        if (!content.includes('href="account.html"')) {
            // Find settings button closing tag
            const regex = /(<button[^>]*>\s* Settings\s*<\/button>)/s;
            if (regex.test(content)) {
                content = content.replace(regex, `$1\n${accountBtnHtml}`);
                modified = true;
            }
        }
    }

    // Rename settings to accessibility across all files
    if (content.includes(' Settings')) {
        content = content.replace(/ Settings/g, ' Accessibility');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated headers in ${file}`);
    }
});

