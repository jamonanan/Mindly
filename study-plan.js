import { auth, db } from './firebaseAuth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, doc, getDocs, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const UNSTRUCTURED_URL = "http://127.0.0.1:5001/mindly-7f7c4/us-central1/extractText";
const GENERATE_PLAN_URL = "http://127.0.0.1:5001/mindly-7f7c4/us-central1/generateStudyPlan";

// UI Elements - Views
const listView = document.getElementById("list-view");
const setupView = document.getElementById("setup-view");
const mapView = document.getElementById("map-view");

// UI Elements - List View
const plansContainer = document.getElementById("plans-container");
const showSetupBtn = document.getElementById("show-setup-btn");

// UI Elements - Setup View
const fileInput = document.getElementById("file-input");
const fileNameDisplay = document.getElementById("file-name-display");
const textInput = document.getElementById("text-input");
const generateBtn = document.getElementById("generate-btn");
const backFromSetupBtn = document.getElementById("back-from-setup-btn");

// UI Elements - Map View
const learningPath = document.getElementById("learning-path");
const mapPlanTitle = document.getElementById("map-plan-title");
const backFromMapBtn = document.getElementById("back-from-map-btn");

// Modal Elements
const readingModal = document.getElementById("reading-modal");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");
const closeModalBtn = document.getElementById("close-modal-btn");
const markCompleteBtn = document.getElementById("mark-complete-btn");

// State
let currentUser = null;
let currentPlanId = null; // ID of the currently open plan document
let currentPlan = null; // Object containing { title, chunks, createdAt }
let activeNodeId = null; // ID of the currently opened node in the modal

// --- Authentication & Initialization ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        switchView(listView);
        await loadAllPlans();
    } else {
        alert("Please log in to use the Study Plan feature.");
        window.location.href = "login.html";
    }
});

// --- View Navigation Logic ---
function switchView(view) {
    listView.style.display = "none";
    setupView.style.display = "none";
    mapView.style.display = "none";
    view.style.display = "block";
}

showSetupBtn.addEventListener("click", () => {
    // Reset inputs
    fileInput.value = "";
    fileNameDisplay.textContent = "No file selected";
    textInput.value = "";
    switchView(setupView);
});

backFromSetupBtn.addEventListener("click", () => {
    switchView(listView);
});

backFromMapBtn.addEventListener("click", () => {
    switchView(listView);
    loadAllPlans(); // Refresh list to update progress bars
});

// --- List View Logic ---
async function loadAllPlans() {
    if (!currentUser) return;
    plansContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">Loading plans...</p>';
    
    try {
        const plansRef = collection(db, "users", currentUser.uid, "studyPlans");
        const querySnapshot = await getDocs(plansRef);
        
        plansContainer.innerHTML = "";
        
        if (querySnapshot.empty) {
            plansContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">You have no study plans yet. Create one!</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const planId = docSnap.id;
            renderPlanCard(planId, data);
        });

    } catch (error) {
        console.error("Error loading plans:", error);
        plansContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load plans.</p>';
    }
}

function renderPlanCard(planId, data) {
    const chunksArray = data.chunks || data.plan || [];
    const totalChunks = chunksArray.length;
    const completedChunks = chunksArray.filter(c => c.status === 'completed').length;
    const progressPercent = totalChunks === 0 ? 0 : (completedChunks / totalChunks) * 100;
    
    const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown Date';

    const card = document.createElement("div");
    card.className = "plan-card";
    
    card.innerHTML = `
        <div class="plan-info">
            <h3 class="plan-title">${data.title || 'Untitled Plan'}</h3>
            <p class="plan-meta">Created: ${dateStr} • ${completedChunks}/${totalChunks} tasks done</p>
            <div class="plan-progress-container">
                <div class="plan-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
        </div>
        <button class="delete-plan-btn" title="Delete Plan">🗑️</button>
    `;

    // Click on card to open map
    card.querySelector(".plan-info").addEventListener("click", () => {
        openPlanMap(planId, data);
    });

    // Click on delete button
    card.querySelector(".delete-plan-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete "${data.title || 'this plan'}"?`)) {
            // Optimistically remove from DOM
            card.remove();
            
            // Check if there are any remaining cards
            if (plansContainer.children.length === 0) {
                plansContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 2rem 0;">You have no study plans yet. Create one!</p>';
            }

            await deletePlan(planId);
        }
    });

    plansContainer.appendChild(card);
}

async function deletePlan(planId) {
    try {
        await deleteDoc(doc(db, "users", currentUser.uid, "studyPlans", planId));
        // We removed loadAllPlans() here because we optimistically removed the card from the DOM
    } catch (error) {
        console.error("Error deleting plan:", error);
        alert("Failed to delete plan.");
        await loadAllPlans(); // Reload to restore the card if deletion failed
    }
}

// --- Setup View Logic ---
fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        fileNameDisplay.textContent = e.target.files[0].name;
    } else {
        fileNameDisplay.textContent = "No file selected";
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

generateBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    const text = textInput.value.trim();

    if (!file && !text) {
        alert("Please upload a file or paste some text.");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "Analyzing materials... ⏳";

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
            
            const extractedText = elements.map(el => el.text).join("\n");
            finalContextText = finalContextText + "\n\n" + extractedText;
        }

        generateBtn.textContent = "Generating your path... 🚀";

        const planRes = await fetch(GENERATE_PLAN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: finalContextText })
        });

        if (!planRes.ok) throw new Error("Failed to generate plan.");
        const data = await planRes.json();
        
        let newPlanChunks = data.plan; // the chunks array
        let generatedTitle = data.title || "My Study Plan";
        
        // Initialize state for each node
        let chunksWithStatus = newPlanChunks.map((node, index) => ({
            ...node,
            status: index === 0 ? 'active' : 'locked' // First node is active, rest are locked
        }));

        // Save as new document
        const plansRef = collection(db, "users", currentUser.uid, "studyPlans");
        const newDocRef = await addDoc(plansRef, {
            title: generatedTitle,
            chunks: chunksWithStatus,
            createdAt: new Date().toISOString()
        });

        // Open the newly created plan
        openPlanMap(newDocRef.id, { title: generatedTitle, chunks: chunksWithStatus });

    } catch (error) {
        console.error(error);
        alert("Error generating plan: " + error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Plan 📋";
    }
});

// --- Gamified Map Logic ---
function openPlanMap(planId, data) {
    currentPlanId = planId;
    currentPlan = data;
    mapPlanTitle.textContent = data.title;
    
    switchView(mapView);
    renderMap();
}

function renderMap() {
    learningPath.innerHTML = "";
    
    const chunksArray = currentPlan.chunks || currentPlan.plan || [];
    
    chunksArray.forEach((node, index) => {
        // Create the node element
        const nodeEl = document.createElement("div");
        nodeEl.className = `node ${node.status}`;
        
        let iconSymbol = "🔒";
        if (node.status === 'active') iconSymbol = "▶️";
        if (node.status === 'completed') iconSymbol = "✅";

        nodeEl.innerHTML = `
            <div class="node-icon">${iconSymbol}</div>
            <div class="node-content">
                <h4 class="node-title">${node.title}</h4>
                <p class="node-time">⏱️ ~${node.estimatedTimeMinutes} mins</p>
            </div>
        `;

        if (node.status !== 'locked') {
            nodeEl.addEventListener("click", () => openModal(node, chunksArray));
        }

        learningPath.appendChild(nodeEl);

        // Create the connecting line if it's not the last node
        if (index < chunksArray.length - 1) {
            const lineEl = document.createElement("div");
            lineEl.className = "path-line";
            if (node.status === 'completed') {
                lineEl.classList.add("completed");
            }
            learningPath.appendChild(lineEl);
        }
    });
}

// --- Modal Logic ---
function openModal(node) {
    activeNodeId = node.id;
    modalTitle.textContent = node.title;
    modalText.textContent = node.content;
    
    if (node.status === 'completed') {
        markCompleteBtn.textContent = "Completed ✅";
        markCompleteBtn.disabled = true;
        markCompleteBtn.style.opacity = "0.5";
    } else {
        markCompleteBtn.textContent = "Mark Complete ✅";
        markCompleteBtn.disabled = false;
        markCompleteBtn.style.opacity = "1";
    }

    readingModal.style.display = "flex";

    if (window.isBionicActive && window.isBionicActive()) {
        window.applyBionicReading(modalText);
    }
}

closeModalBtn.addEventListener("click", () => {
    readingModal.style.display = "none";
    activeNodeId = null;
});

markCompleteBtn.addEventListener("click", async () => {
    if (!activeNodeId || !currentPlanId) return;

    const chunksArray = currentPlan.chunks || currentPlan.plan || [];

    const nodeIndex = chunksArray.findIndex(n => n.id === activeNodeId);
    if (nodeIndex !== -1) {
        chunksArray[nodeIndex].status = 'completed';
        
        // Unlock the next node if it exists
        if (nodeIndex + 1 < chunksArray.length) {
            chunksArray[nodeIndex + 1].status = 'active';
        }
    }

    readingModal.style.display = "none";
    activeNodeId = null;
    
    renderMap();
    
    // Save updated chunks to Firestore
    try {
        const planRef = doc(db, "users", currentUser.uid, "studyPlans", currentPlanId);
        if (currentPlan.chunks) {
            await updateDoc(planRef, { chunks: chunksArray });
        } else {
            await updateDoc(planRef, { plan: chunksArray });
        }
    } catch (error) {
        console.error("Error updating plan:", error);
    }
});
