import { auth, db } from './firebaseAuth.js';
import { doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Gets the document reference for today's metrics
 */
function getTodayMetricRef() {
    if (!auth.currentUser) return null;
    
    // Get date string in YYYY-MM-DD format (local time)
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + 
                    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(today.getDate()).padStart(2, '0');
                    
    return doc(db, "users", auth.currentUser.uid, "dailyMetrics", dateStr);
}

/**
 * Ensures today's metric document exists, creates it with defaults if not.
 */
export async function initializeDailyMetrics() {
    const metricRef = getTodayMetricRef();
    if (!metricRef) return null;

    try {
        const docSnap = await getDoc(metricRef);
        if (!docSnap.exists()) {
            const defaultMetrics = {
                studyPlansGoal: 0,
                studyPlansDone: 0,
                lessonsGoal: 0,
                lessonsDone: 0,
                quizTotalScore: 0,
                quizzesTaken: 0,
                focusTimeMinutes: 0,
                focusTimeGoal: 30 // Default 30 mins
            };
            await setDoc(metricRef, defaultMetrics);
            return defaultMetrics;
        }
        return docSnap.data();
    } catch (error) {
        console.error("Error initializing daily metrics:", error);
        return null;
    }
}

/**
 * Updates a specific metric field. 
 * @param {string} field - The field to update (e.g. 'lessonsDone')
 * @param {number} value - The value to increment by, or set to
 * @param {string} operation - 'increment' or 'set'
 */
export async function updateDailyMetric(field, value, operation = 'increment') {
    const metricRef = getTodayMetricRef();
    if (!metricRef) return;

    try {
        // Ensure it exists first
        const docSnap = await getDoc(metricRef);
        if (!docSnap.exists()) {
            await initializeDailyMetrics();
        }

        const updateData = {};
        if (operation === 'increment') {
            updateData[field] = increment(value);
        } else {
            updateData[field] = value;
        }

        await updateDoc(metricRef, updateData);
    } catch (error) {
        console.error(`Error updating metric ${field}:`, error);
    }
}
