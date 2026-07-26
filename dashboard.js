import { auth, db } from './firebaseAuth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeDailyMetrics, updateDailyMetric } from './metrics.js';

document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dashboard-dropzone');
    const fileInput = document.getElementById('dashboard-file-input');
    const statusText = document.getElementById('dashboard-upload-status');
    const defaultText = dropzone.querySelector('p');

    let currentUser = null;
    let metricsUnsubscribe = null;

    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
            await initializeDailyMetrics();
            subscribeToMetrics(user);
        } else if (metricsUnsubscribe) {
            metricsUnsubscribe();
        }
    });

    function subscribeToMetrics(user) {
        const today = new Date();
        const dateStr = today.getFullYear() + '-' + 
                        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(today.getDate()).padStart(2, '0');
        
        const metricRef = doc(db, "users", user.uid, "dailyMetrics", dateStr);
        metricsUnsubscribe = onSnapshot(metricRef, (docSnap) => {
            if (docSnap.exists()) {
                updateDashboardUI(docSnap.data());
            }
        });
    }

    function updateDashboardUI(metrics) {
        // Study Plans
        const studyCardsTitle = document.querySelectorAll('.metric-card.blue')[0];
        if (studyCardsTitle) {
            studyCardsTitle.querySelector('.metric-value').textContent = metrics.studyPlansDone || 0;
            studyCardsTitle.querySelector('.metric-insight').textContent = `out of ${metrics.studyPlansGoal || 0} planned`;
        }
        
        // Lessons
        const lessonsCardTitle = document.querySelectorAll('.metric-card.green')[0];
        if (lessonsCardTitle) {
            lessonsCardTitle.querySelector('.metric-value').textContent = metrics.lessonsDone || 0;
            lessonsCardTitle.querySelector('.metric-insight').textContent = `Out of ${metrics.lessonsGoal || 0}`;
        }
        
        // Quizzes
        const quizzesCardTitle = document.querySelectorAll('.metric-card.yellow')[0];
        const quizAvg = metrics.quizzesTaken > 0 ? Math.round(metrics.quizTotalScore / metrics.quizzesTaken) : 0;
        if (quizzesCardTitle) {
            quizzesCardTitle.querySelector('.metric-value').textContent = `${quizAvg}%`;
            quizzesCardTitle.querySelector('.metric-insight').textContent = metrics.quizzesTaken > 0 ? "keep it up" : "No quizzes taken";
        }
        
        // Focus
        const focusCardTitle = document.querySelectorAll('.metric-card.purple')[0];
        if (focusCardTitle) {
            focusCardTitle.querySelector('.metric-value').textContent = `${metrics.focusTimeMinutes || 0}m`;
            focusCardTitle.querySelector('.metric-insight').textContent = `Goal: ${metrics.focusTimeGoal || 30}m`;
        }
        
        // Progress Dots (8 dots total)
        updateProgressDots(0, (metrics.studyPlansDone || 0), (metrics.studyPlansGoal || 0)); // Study Plan
        updateProgressDots(1, (metrics.lessonsDone || 0), (metrics.lessonsGoal || 0)); // Lessons
        updateProgressDots(2, quizAvg, 100); // Quizzes
        updateProgressDots(3, (metrics.focusTimeMinutes || 0), (metrics.focusTimeGoal || 30)); // Focus
    }

    function updateProgressDots(rowIndex, current, goal) {
        const progressRows = document.querySelectorAll('.progress-row');
        if (progressRows.length <= rowIndex) return;
        
        const row = progressRows[rowIndex];
        
        let percent = 0;
        if (goal > 0) percent = Math.min(100, Math.round((current / goal) * 100));
        
        const percentSpan = row.querySelector('.progress-percent');
        if (percentSpan) percentSpan.textContent = `${percent}%`;
        
        const dotsContainer = row.querySelector('.progress-bar');
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.progress-dot');
            const numFilled = Math.round((percent / 100) * 8);
            dots.forEach((dot, idx) => {
                if (idx < numFilled) dot.classList.add('filled');
                else dot.classList.remove('filled');
            });
        }
    }

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const EXTRACT_URL = isLocal ? "http://127.0.0.1:5001/mindly-7f7c4/us-central1/extractText" : "https://extracttext-7f7c4-uc.a.run.app";
    const GENERATE_PLAN_URL = isLocal ? "http://127.0.0.1:5001/mindly-7f7c4/us-central1/generateStudyPlan" : "https://generatestudyplan-7f7c4-uc.a.run.app";
    const GENERATE_LESSON_URL = isLocal ? "http://127.0.0.1:5001/mindly-7f7c4/us-central1/generateLesson" : "https://generatelesson-7f7c4-uc.a.run.app";
    const GENERATE_QUIZ_URL = isLocal ? "http://127.0.0.1:5001/mindly-7f7c4/us-central1/generateQuiz" : "https://generatequiz-7f7c4-uc.a.run.app";

    // Drag and Drop Events
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--primary-purple-dark)';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--primary-purple-light)';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--primary-purple-light)';
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async function handleFile(file) {
        if (!currentUser) {
            console.warn("Please log in first to generate materials.");
            return;
        }

        // Show generating status
        defaultText.style.display = 'none';
        statusText.style.display = 'block';
        statusText.textContent = `Extracting text from ${file.name}... `;
        dropzone.style.pointerEvents = 'none';
        dropzone.style.opacity = '0.8';

        try {
            // 1. Extract Text
            const base64Data = await getBase64(file);
            const extractRes = await fetch(EXTRACT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileBase64: base64Data, fileName: file.name })
            });

            if (!extractRes.ok) throw new Error("Failed to extract text from document.");
            const elements = await extractRes.json();
            const extractedText = elements.map(el => el.text).join("\n\n");

            if (!extractedText || extractedText.trim() === "") {
                throw new Error("No readable text found in document.");
            }

            const wordCount = extractedText.trim().split(/\s+/).length;
            if (wordCount < 100) {
                throw new Error(`Document is too short (${wordCount} words). Please upload a document with at least 100 words.`);
            }

            statusText.textContent = "Generating Study Plan, Lesson, and Quiz in the background... ";

            // 2. Generate all three in parallel
            const [planRes, lessonRes, quizRes] = await Promise.allSettled([
                fetch(GENERATE_PLAN_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: extractedText })
                }).then(res => { if (!res.ok) throw new Error("Plan failed"); return res.json(); }),
                
                fetch(GENERATE_LESSON_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: extractedText })
                }).then(res => { if (!res.ok) throw new Error("Lesson failed"); return res.json(); }),

                fetch(GENERATE_QUIZ_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: extractedText })
                }).then(res => { if (!res.ok) throw new Error("Quiz failed"); return res.json(); })
            ]);

            statusText.textContent = "Saving to your account... ";

            const timestamp = new Date().toISOString();
            const savePromises = [];

            // Save Study Plan
            if (planRes.status === 'fulfilled') {
                const planData = planRes.value;
                const chunksWithStatus = planData.plan.map((node, index) => ({
                    ...node,
                    status: index === 0 ? 'active' : 'locked'
                }));
                const title = planData.title || `Plan: ${file.name}`;
                savePromises.push(addDoc(collection(db, "users", currentUser.uid, "studyPlans"), {
                    title: title,
                    chunks: chunksWithStatus,
                    createdAt: timestamp
                }));
            } else {
                console.error("Study Plan Error:", planRes.reason);
            }

            // Save Lesson
            if (lessonRes.status === 'fulfilled') {
                savePromises.push(addDoc(collection(db, "users", currentUser.uid, "lessons"), {
                    title: `Lesson: ${file.name}`,
                    content: lessonRes.value.lesson,
                    createdAt: timestamp
                }));
            } else {
                console.error("Lesson Error:", lessonRes.reason);
            }

            // Save Quiz
            if (quizRes.status === 'fulfilled') {
                savePromises.push(addDoc(collection(db, "users", currentUser.uid, "quizzes"), {
                    title: `Quiz: ${file.name}`,
                    quizData: quizRes.value.quiz,
                    createdAt: timestamp
                }));
            } else {
                console.error("Quiz Error:", quizRes.reason);
            }

            await Promise.all(savePromises);

            // Increment Goals in Daily Metrics
            if (planRes.status === 'fulfilled') {
                updateDailyMetric('studyPlansGoal', 1);
            }
            if (lessonRes.status === 'fulfilled') {
                updateDailyMetric('lessonsGoal', 1);
            }

            // Success
            statusText.textContent = " Materials generated successfully!";
            statusText.style.color = "green";
            
            setTimeout(() => {
                resetDropzone();
            }, 3000);

        } catch (error) {
            console.error("Upload Error:", error);
            statusText.textContent = ` Error: ${error.message}`;
            statusText.style.color = "red";
            
            setTimeout(() => {
                resetDropzone();
            }, 5000);
        }
    }

    function resetDropzone() {
        defaultText.style.display = 'block';
        statusText.style.display = 'none';
        statusText.style.color = "var(--primary-purple-dark)";
        dropzone.style.pointerEvents = 'auto';
        dropzone.style.opacity = '1';
        fileInput.value = '';
    }
});

