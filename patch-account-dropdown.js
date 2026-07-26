const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = ['dashboard.html', 'study-plan.html', 'reading-buddy.html', 'quizzes.html', 'mental-health.html', 'lessons.html', 'focus-timer.html'];

const newHtml = `
                <div class="account-dropdown-wrapper" style="position: relative; display: inline-block;">
                    <button class="btn btn-secondary account-dropdown-btn" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0.8rem; border-radius: 50px; border: none; cursor: pointer; font-family: inherit; font-size: inherit; background: var(--gray-light, #F3F4F6); color: inherit;">
                        <img src="" class="user-profile-pic" alt="Profile" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; background: #e0e0e0;">
                        <span>Account</span>
                    </button>
                    <div class="account-dropdown-menu" style="display: none; position: absolute; right: 0; top: 110%; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 160px; z-index: 1000; overflow: hidden;">
                        <a href="account.html" style="display: block; padding: 0.75rem 1rem; color: #374151; text-decoration: none; border-bottom: 1px solid #e5e7eb; font-size: 0.95rem; font-weight: 500;"> Account Settings</a>
                        <button id="globalLogoutBtn" style="display: block; width: 100%; text-align: left; padding: 0.75rem 1rem; color: #ef4444; background: none; border: none; cursor: pointer; font-size: 0.95rem; font-weight: 500; font-family: inherit;"> Logout</button>
                    </div>
                </div>`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the old anchor tag block with the new wrapper
    // We'll use a regex that matches the <a href="account.html"...>...</a>
    const regex = /<a href="account\.html"[^>]*class="btn btn-secondary"[^>]*>\s*<img src="" class="user-profile-pic"[^>]*>\s*<span>Account<\/span>\s*<\/a>/;

    if (regex.test(content)) {
        content = content.replace(regex, newHtml.trim());
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated dropdown in ${file}`);
    } else {
        console.log(`Could not find target in ${file}`);
    }
});

