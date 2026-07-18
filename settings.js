import { auth, db } from './firebaseAuth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Modal HTML
const modalHtml = `
<div id="globalSettingsModal" class="settings-modal">
    <div class="settings-modal-content">
        <span class="settings-close-btn">&times;</span>
        <h2>Accessibility Settings</h2>
        <div class="settings-option">
            <label for="globalDyslexicToggle">Dyslexic Font</label>
            <label class="settings-switch">
                <input type="checkbox" id="globalDyslexicToggle">
                <span class="settings-slider"></span>
            </label>
        </div>
        <div class="settings-option" id="globalBionicContainer" style="margin-top: 1rem;">
            <label for="globalBionicToggle">Bionic Reading</label>
            <label class="settings-switch">
                <input type="checkbox" id="globalBionicToggle">
                <span class="settings-slider"></span>
            </label>
        </div>
        <p id="settingsStatus" style="font-size: 0.85rem; color: #6b7280; margin-top: 1.5rem;"></p>
    </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHtml);

const modal = document.getElementById('globalSettingsModal');
const closeBtn = document.querySelector('.settings-close-btn');
const dyslexicToggle = document.getElementById('globalDyslexicToggle');
const bionicToggle = document.getElementById('globalBionicToggle');
const statusText = document.getElementById('settingsStatus');
const bionicContainer = document.getElementById('globalBionicContainer');

// Hide bionic option on reading buddy page
if (window.location.pathname.includes('reading-buddy.html') && bionicContainer) {
    bionicContainer.style.display = 'none';
}

let currentUser = null;
let bionicApplied = false;

// Open modal logic
document.body.addEventListener('click', (e) => {
    // Check if clicked element is a settings button
    const btn = e.target.closest('.settings-btn') || 
        (e.target.textContent && (e.target.textContent.includes('⚙️ Settings') || e.target.textContent.includes('👁️ Accessibility')) ? (e.target.closest('button') || e.target) : null);
    
    if (btn && !modal.contains(e.target)) {
        const rect = btn.getBoundingClientRect();
        // Position the bubble below the button and align right edges
        modal.style.top = (rect.bottom + window.scrollY + 10) + 'px';
        
        // Ensure it doesn't go off the left side of the screen
        let leftPos = (rect.right + window.scrollX - 280);
        if (leftPos < 10) leftPos = 10;
        
        modal.style.left = leftPos + 'px';
        
        modal.classList.add('show');
        e.stopPropagation();
    }
});

closeBtn.onclick = () => modal.classList.remove('show');
window.addEventListener('click', (e) => {
    if (modal.classList.contains('show') && !modal.contains(e.target)) {
        modal.classList.remove('show');
    }
});

// Auth state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        statusText.textContent = "Preferences saved to your account.";
        // Fetch preferences
        const docRef = doc(db, 'users', user.uid);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.settings) {
                    if (data.settings.dyslexicFont) {
                        dyslexicToggle.checked = true;
                        document.body.classList.add('dyslexic-mode');
                    }
                    if (data.settings.bionicReading && !bionicApplied) {
                        if (bionicToggle) bionicToggle.checked = true;
                        if (!window.location.pathname.includes('reading-buddy.html')) {
                            applyBionicReading(document.body);
                            bionicApplied = true;
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        }
    } else {
        currentUser = null;
        statusText.textContent = "Log in to save your preferences permanently.";
    }
});

async function updateFirebaseSettings() {
    if (!currentUser) return;
    try {
        const docRef = doc(db, 'users', currentUser.uid);
        await setDoc(docRef, {
            settings: {
                dyslexicFont: dyslexicToggle.checked,
                bionicReading: bionicToggle.checked
            }
        }, { merge: true });
    } catch (err) {
        console.error("Error updating settings:", err);
    }
}

// Toggle logic
dyslexicToggle.addEventListener('change', async (e) => {
    if (e.target.checked) {
        document.body.classList.add('dyslexic-mode');
    } else {
        document.body.classList.remove('dyslexic-mode');
    }
    await updateFirebaseSettings();
});

bionicToggle.addEventListener('change', async (e) => {
    await updateFirebaseSettings();
    if (e.target.checked) {
        if (!bionicApplied) {
            applyBionicReading(document.body);
            bionicApplied = true;
        }
    } else {
        removeBionicReading();
        bionicApplied = false;
    }
});

function removeBionicReading() {
    const bionicNodes = document.querySelectorAll('b.bionic-bold');
    bionicNodes.forEach(bNode => {
        if (bNode.parentNode) {
            const textNode = document.createTextNode(bNode.textContent);
            bNode.parentNode.replaceChild(textNode, bNode);
        }
    });
    document.body.normalize();
}

function applyBionicReading(node) {
    // Avoid modifying script, style, and settings modal
    if (node.id === 'globalSettingsModal') return;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG'].includes(node.tagName)) return;
    // Skip buttons unless they are quiz options
    if (node.tagName === 'BUTTON' && !node.classList.contains('option-btn')) return;
    
    // Convert childNodes to array to avoid mutation iteration issues
    const children = Array.from(node.childNodes);

    children.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            const text = child.nodeValue;
            if (text.trim().length > 0) {
                const words = text.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                
                let modified = false;
                words.forEach(word => {
                    if (word.trim().length > 0) {
                        modified = true;
                        const boldLength = Math.ceil(word.length / 2);
                        const b = document.createElement('b');
                        b.className = 'bionic-bold';
                        b.textContent = word.slice(0, boldLength);
                        fragment.appendChild(b);
                        const rest = document.createTextNode(word.slice(boldLength));
                        fragment.appendChild(rest);
                    } else {
                        fragment.appendChild(document.createTextNode(word));
                    }
                });
                if (modified) {
                    node.replaceChild(fragment, child);
                }
            }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            applyBionicReading(child);
        }
    });
}

// Expose globally for dynamic content (like quizzes or lessons)
window.applyBionicReading = applyBionicReading;
window.isBionicActive = () => bionicApplied;
