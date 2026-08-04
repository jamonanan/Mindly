import { auth, db } from './firebaseAuth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, doc, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { updateDailyMetric } from './metrics.js';

document.addEventListener('DOMContentLoaded', () => {
    // Views
    const listView = document.getElementById("list-view");
    const quizView = document.getElementById("quiz-view");
    const resultsView = document.getElementById("results-view");

    // List UI Elements
    const quizzesContainer = document.getElementById("quizzes-container");

    // Quiz UI Elements
    const currentQNumEl = document.getElementById("current-q-num");
    const totalQNumEl = document.getElementById("total-q-num");
    const progressBar = document.getElementById("progress-bar");
    const questionTextEl = document.getElementById("question-text");
    const optionsGrid = document.getElementById("options-grid");
    const explanationCard = document.getElementById("explanation-card");
    const explanationText = document.getElementById("explanation-text");
    const nextBtn = document.getElementById("next-btn");

    // Results UI Elements
    const finalScoreEl = document.getElementById("final-score");
    const finalTotalEl = document.getElementById("final-total");
    const restartBtn = document.getElementById("restart-btn");

    // State
    let currentUser = null;
    let quizData = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let hasAnsweredCurrent = false;
    let currentQuizId = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadQuizzes();
        } else {
            console.warn("Please log in to use the Quizzes feature.");
            window.location.href = "login.html";
            return;
        }
    });

    async function loadQuizzes() {
        if (!currentUser) return;
        quizzesContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">Loading quizzes...</p>';
        
        try {
            const quizzesRef = collection(db, "users", currentUser.uid, "quizzes");
            const querySnapshot = await getDocs(quizzesRef);
            
            quizzesContainer.innerHTML = "";
            
            if (querySnapshot.empty) {
                quizzesContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">You have no quizzes yet. Generate some from the dashboard!</p>';
                return;
            }

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                renderQuizCard(docSnap.id, data);
            });
        } catch (error) {
            console.error("Error loading quizzes:", error);
            quizzesContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load quizzes.</p>';
        }
    }

    function renderQuizCard(quizId, data) {
        const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown Date';
        const numQuestions = data.quizData ? data.quizData.length : 0;
        const statusText = data.status === 'completed' ? '<span style="color: green; font-weight: bold; font-size: 0.85em; padding: 2px 6px; background: #e6ffe6; border-radius: 4px; margin-left: 8px; vertical-align: middle;">Finished</span>' : '';

        const card = document.createElement("div");
        card.className = "plan-card";

        card.innerHTML = `
            <div class="plan-info">
                <h3 class="plan-title" style="display: flex; align-items: center;">${data.title || 'Untitled Quiz'} ${statusText}</h3>
                <p class="plan-meta">Created: ${dateStr} • ${numQuestions} Questions</p>
            </div>
            <button class="delete-plan-btn delete-btn" title="Delete Quiz"></button>
        `;

        card.addEventListener("click", () => {
            if (numQuestions > 0) {
                currentQuizId = quizId;
                quizData = data.quizData;
                startQuiz();
            } else {
                console.warn("This quiz has no questions.");
                return;
            }
        });

        const deleteBtn = card.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${data.title || 'this quiz'}"?`)) {
                card.remove();
                if (quizzesContainer.children.length === 0) {
                    quizzesContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">You have no quizzes yet. Generate some from the dashboard!</p>';
                }
                await deleteQuiz(quizId);
            }
        });

        quizzesContainer.appendChild(card);
    }

    async function deleteQuiz(quizId) {
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "quizzes", quizId));
        } catch (error) {
            console.error("Error deleting quiz:", error);
            console.error("Failed to delete quiz.");
            await loadQuizzes(); // Reload if failed
        }
    }

    function switchView(view) {
        listView.style.display = "none";
        quizView.style.display = "none";
        resultsView.style.display = "none";
        view.style.display = "block";
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        totalQNumEl.textContent = quizData.length;
        finalTotalEl.textContent = quizData.length;
        switchView(quizView);
        renderQuestion();
    }

    function renderQuestion() {
        hasAnsweredCurrent = false;
        const q = quizData[currentQuestionIndex];
        
        currentQNumEl.textContent = currentQuestionIndex + 1;
        const progressPercent = ((currentQuestionIndex) / quizData.length) * 100;
        progressBar.style.width = `${progressPercent}%`;

        questionTextEl.textContent = q.question;
        optionsGrid.innerHTML = "";
        
        explanationCard.classList.remove("show");
        nextBtn.classList.remove("show");

        const options = [...q.options].sort(() => Math.random() - 0.5);

        options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = opt;
            btn.addEventListener("click", () => handleAnswer(btn, opt, q.correctAnswer, q.explanation));
            optionsGrid.appendChild(btn);
        });

        if (currentQuestionIndex === quizData.length - 1) {
            nextBtn.textContent = "See Results ";
        } else {
            nextBtn.textContent = "Next Question →";
        }

        if (window.isBionicActive && window.isBionicActive()) {
            window.applyBionicReading(questionTextEl);
            optionsGrid.querySelectorAll(".option-btn").forEach(btn => {
                window.applyBionicReading(btn);
            });
        }
    }

    function handleAnswer(selectedBtn, selectedOpt, correctOpt, explanation) {
        if (hasAnsweredCurrent) return;
        hasAnsweredCurrent = true;

        const allBtns = optionsGrid.querySelectorAll(".option-btn");
        
        allBtns.forEach(btn => btn.disabled = true);

        const isCorrect = selectedOpt === correctOpt;

        if (isCorrect) {
            selectedBtn.classList.add("correct");
            score++;
        } else {
            selectedBtn.classList.add("incorrect");
            // Highlight the correct one
            allBtns.forEach(btn => {
                if (btn.textContent === correctOpt) {
                    btn.classList.add("correct");
                }
            });
        }

        explanationText.textContent = explanation;
        explanationCard.classList.add("show");
        nextBtn.classList.add("show");

        if (window.isBionicActive && window.isBionicActive()) {
            window.applyBionicReading(explanationText);
        }
    }

    nextBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            renderQuestion();
        } else {
            showResults();
        }
    });

    async function showResults() {
        progressBar.style.width = "100%";
        finalScoreEl.textContent = score;
        switchView(resultsView);
        
        try {
            await updateDailyMetric('quizQuestionsTotal', Number(quizData.length));
            await updateDailyMetric('quizQuestionsCorrect', Number(score));
            
            if (currentQuizId) {
                const quizRef = doc(db, "users", currentUser.uid, "quizzes", currentQuizId);
                await updateDoc(quizRef, { status: 'completed' });
            }
        } catch (error) {
            console.error("Error updating quiz metrics:", error);
        }
    }

    restartBtn.addEventListener("click", () => {
        switchView(listView);
        currentQuizId = null;
        loadQuizzes(); // Refresh list to show Finished status
    });
});
