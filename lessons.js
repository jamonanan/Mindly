document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const generateBtn = document.getElementById('generateBtn');
    
    const uploadSection = document.getElementById('uploadSection');
    const loadingState = document.getElementById('loadingState');
    const loadingStatus = document.getElementById('loadingStatus');
    const resultsSection = document.getElementById('resultsSection');
    const lessonContent = document.getElementById('lessonContent');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const element = document.getElementById('lessonContent');
            const opt = {
                margin:       1,
                filename:     'Mindly_Study_Lesson.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            // New Promise-based usage of html2pdf
            html2pdf().set(opt).from(element).save();
        });
    }

    // Determine backend URLs based on environment
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const EXTRACT_URL = isLocal 
        ? "http://127.0.0.1:5001/mindly-7f7c4/us-central1/extractText" 
        : "https://extracttext-7f7c4-uc.a.run.app";
    const GENERATE_URL = isLocal 
        ? "http://127.0.0.1:5001/mindly-7f7c4/us-central1/generateLesson" 
        : "https://generatelesson-7f7c4-uc.a.run.app";

    let selectedFile = null;

    // Drag and Drop Events
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        selectedFile = file;
        const p = dropZone.querySelector('p');
        p.textContent = `Selected: ${file.name}`;
        p.style.color = "var(--primary)";
    }

    // Generate Button Click
    generateBtn.addEventListener('click', async () => {
        const textValue = textInput.value.trim();
        
        if (!selectedFile && !textValue) {
            alert("Please upload a file or paste some text first.");
            return;
        }

        // Show loading state
        uploadSection.classList.add('hidden');
        loadingState.classList.remove('hidden');

        try {
            let textToProcess = textValue;

            // If a file is selected, extract text first
            if (selectedFile) {
                loadingStatus.textContent = "Extracting text from document...";
                textToProcess = await extractTextFromFile(selectedFile);
                if (!textToProcess) {
                    throw new Error("Could not extract readable text from the file.");
                }
            }

            // Generate Lesson
            loadingStatus.textContent = "AI is studying and creating your lesson...";
            const lessonMarkdown = await generateLesson(textToProcess);

            // Show results
            loadingState.classList.add('hidden');
            resultsSection.classList.remove('hidden');

            // Render Markdown securely using marked.js
            lessonContent.innerHTML = marked.parse(lessonMarkdown);

            if (window.isBionicActive && window.isBionicActive()) {
                window.applyBionicReading(lessonContent);
            }

        } catch (error) {
            console.error("Error generating lesson:", error);
            alert("Something went wrong: " + error.message);
            loadingState.classList.add('hidden');
            uploadSection.classList.remove('hidden');
        }
    });

    // Reset Button
    resetBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        textInput.value = '';
        selectedFile = null;
        fileInput.value = '';
        const p = dropZone.querySelector('p');
        p.textContent = 'Drag and drop your PDF or DOCX here';
        p.style.color = '';
    });

    // Helper functions
    async function extractTextFromFile(file) {
        const fileBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        const response = await fetch(EXTRACT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fileBase64: fileBase64,
                fileName: file.name
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to parse document");
        }

        const elements = await response.json();
        const allowedTypes = ["NarrativeText", "Title", "ListItem"];
        return elements
            .filter(el => allowedTypes.includes(el.type))
            .map(el => el.text)
            .join("\n\n");
    }

    async function generateLesson(text) {
        const response = await fetch(GENERATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to generate lesson");
        }

        const data = await response.json();
        return data.lesson;
    }
});
