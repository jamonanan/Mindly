const UNSTRUCTURED_URL = "http://127.0.0.1:5001/mindly-7f7c4/us-central1/extractText";
const GENERATE_QUIZ_URL = "http://127.0.0.1:5001/mindly-7f7c4/us-central1/generateQuiz";

// Views
const setupView = document.getElementById("setup-view");
const quizView = document.getElementById("quiz-view");
const resultsView = document.getElementById("results-view");

// Setup UI Elements
const fileInput = document.getElementById("file-input");
const fileNameDisplay = document.getElementById("file-name-display");
const textInput = document.getElementById("text-input");
const generateBtn = document.getElementById("generate-btn");

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
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let hasAnsweredCurrent = false;

// File Selection Handler
fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        fileNameDisplay.textContent = e.target.files[0].name;
    } else {
        fileNameDisplay.textContent = "No file selected";
    }
});

// Helper: Convert file to Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Generate Quiz Logic
generateBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    const text = textInput.value.trim();

    if (!file && !text) {
        alert("Please upload a file or paste some text.");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating Magic Quiz... ⏳";

    try {
        let finalContextText = text;

        if (file) {
            generateBtn.textContent = "Extracting text from document... 📄";
            const base64Data = await getBase64(file);
            
            const extractRes = await fetch(UNSTRUCTURED_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileBase64: base64Data, fileName: file.name })
            });

            if (!extractRes.ok) throw new Error("Failed to extract text from document.");
            const elements = await extractRes.json();
            
            // Combine unstructured elements into a single string
            const extractedText = elements.map(el => el.text).join("\n");
            finalContextText = finalContextText + "\n\n" + extractedText;
        }

        generateBtn.textContent = "Creating questions... 🧠";

        const quizRes = await fetch(GENERATE_QUIZ_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: finalContextText })
        });

        if (!quizRes.ok) throw new Error("Failed to generate quiz.");
        const data = await quizRes.json();
        
        quizData = data.quiz;
        if (!quizData || quizData.length === 0) {
            throw new Error("No questions were generated.");
        }

        startQuiz();

    } catch (error) {
        console.error(error);
        alert("Error generating quiz: " + error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Magic Quiz ✨";
    }
});

function switchView(view) {
    setupView.classList.remove("active");
    quizView.classList.remove("active");
    resultsView.classList.remove("active");
    view.classList.add("active");
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

    // Randomize options just in case
    const options = [...q.options].sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.textContent = opt;
        btn.addEventListener("click", () => handleAnswer(btn, opt, q.correctAnswer, q.explanation));
        optionsGrid.appendChild(btn);
    });

    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.textContent = "See Results 🎉";
    } else {
        nextBtn.textContent = "Next Question →";
    }

    if (window.isBionicActive && window.isBionicActive()) {
        window.applyBionicReading(questionTextEl);
        window.applyBionicReading(optionsGrid);
    }
}

function handleAnswer(selectedBtn, selectedOpt, correctOpt, explanation) {
    if (hasAnsweredCurrent) return;
    hasAnsweredCurrent = true;

    const allBtns = optionsGrid.querySelectorAll(".option-btn");
    
    // Disable all buttons
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

function showResults() {
    progressBar.style.width = "100%";
    finalScoreEl.textContent = score;
    switchView(resultsView);
}

restartBtn.addEventListener("click", () => {
    // Reset inputs
    fileInput.value = "";
    fileNameDisplay.textContent = "No file selected";
    textInput.value = "";
    switchView(setupView);
});
