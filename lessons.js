import { auth, db } from './firebaseAuth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, doc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { updateDailyMetric } from './metrics.js';

document.addEventListener('DOMContentLoaded', () => {
    const listView = document.getElementById('list-view');
    const resultsSection = document.getElementById('resultsSection');
    const lessonsContainer = document.getElementById('lessons-container');
    const lessonContent = document.getElementById('lessonContent');
    const lessonDetailTitle = document.getElementById('lesson-detail-title');
    const backBtn = document.getElementById('back-from-detail-btn');
    const finishBtn = document.getElementById('finishBtn');

    let currentUser = null;
    let currentLessonId = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadLessons();
        } else {
            console.warn("Please log in to use the AI Lessons feature.");
            window.location.href = "login.html";
        }
    });

    async function loadLessons() {
        if (!currentUser) return;
        lessonsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">Loading lessons...</p>';
        
        try {
            const lessonsRef = collection(db, "users", currentUser.uid, "lessons");
            const querySnapshot = await getDocs(lessonsRef);
            
            lessonsContainer.innerHTML = "";
            
            if (querySnapshot.empty) {
                lessonsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">You have no lessons yet. Generate some from the dashboard!</p>';
                return;
            }

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                renderLessonCard(docSnap.id, data);
            });
        } catch (error) {
            console.error("Error loading lessons:", error);
            lessonsContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load lessons.</p>';
        }
    }

    function renderLessonCard(lessonId, data) {
        const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown Date';

        const card = document.createElement("div");
        card.className = "plan-card";

        card.innerHTML = `
            <div class="plan-info">
                <h3 class="plan-title">${data.title || 'Untitled Lesson'}</h3>
                <p class="plan-meta">Created: ${dateStr}</p>
            </div>
            <button class="delete-plan-btn delete-btn" title="Delete Lesson"></button>
        `;

        card.addEventListener("click", () => {
            openLesson(lessonId, data);
        });

        const deleteBtn = card.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${data.title || 'this lesson'}"?`)) {
                card.remove();
                if (lessonsContainer.children.length === 0) {
                    lessonsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">You have no lessons yet. Generate some from the dashboard!</p>';
                }
                await deleteLesson(lessonId);
            }
        });

        lessonsContainer.appendChild(card);
    }

    async function deleteLesson(lessonId) {
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "lessons", lessonId));
        } catch (error) {
            console.error("Error deleting lesson:", error);
            console.error("Failed to delete lesson.");
        }
    }

    function openLesson(lessonId, data) {
        currentLessonId = lessonId;
        lessonDetailTitle.textContent = data.title || "Lesson Details";
        
        // Render Markdown securely using marked.js
        if (typeof marked !== 'undefined') {
            lessonContent.innerHTML = marked.parse(data.content || "");
        } else {
            lessonContent.innerHTML = "<p>Error: Markdown parser not loaded.</p>";
        }

        if (window.isBionicActive && window.isBionicActive()) {
            window.applyBionicReading(lessonContent);
        }

        listView.style.display = "none";
        resultsSection.style.display = "block";
    }

    backBtn.addEventListener('click', () => {
        resultsSection.style.display = "none";
        listView.style.display = "block";
        currentLessonId = null;
    });

    finishBtn.addEventListener('click', async () => {
        try {
            await updateDailyMetric('lessonsDone', 1);
            console.log("Lesson finished! Great job.");
        } catch (error) {
            console.error("Error updating lesson metric:", error);
        }
        resultsSection.style.display = "none";
        listView.style.display = "block";
        currentLessonId = null;
    });
});

