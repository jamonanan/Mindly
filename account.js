import { auth, db, storage } from './firebaseAuth.js';
import { 
    onAuthStateChanged, 
    sendPasswordResetEmail, 
    sendEmailVerification, 
    deleteUser, 
    signOut, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// UI Elements
const fullNameInput = document.getElementById('fullNameInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const emailDisplay = document.getElementById('emailDisplay');
const emailStatusBadge = document.getElementById('emailStatusBadge');
const resendVerificationBtn = document.getElementById('resendVerificationBtn');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const logoutBtn = document.getElementById('logoutBtn');
const messageBox = document.getElementById('accountMessage');

let currentUser = null;

function showMessage(msg, type = 'success') {
    messageBox.textContent = msg;
    messageBox.className = `message-box message-${type}`;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// Authentication State
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Reload user to get the latest email verification status
        await user.reload();
        currentUser = auth.currentUser;
        
        // Display email
        emailDisplay.textContent = currentUser.email;

        // Email Verification Status
        if (currentUser.emailVerified) {
            emailStatusBadge.textContent = 'Verified';
            emailStatusBadge.className = 'status-badge status-verified';
            resendVerificationBtn.style.display = 'none';
        } else {
            emailStatusBadge.textContent = 'Unverified';
            emailStatusBadge.className = 'status-badge status-unverified';
            resendVerificationBtn.style.display = 'inline-block';
        }

        // Load Firestore Data
        const docRef = doc(db, "users", user.uid);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                fullNameInput.value = userData.fullName || '';
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            showMessage("Failed to load user data.", 'error');
        }

    } else {
        // Not logged in
        window.location.href = 'login.html';
    }
});

// Update Full Name
saveNameBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    const newName = fullNameInput.value.trim();
    if (!newName) {
        showMessage("Name cannot be empty.", 'error');
        return;
    }

    try {
        // Update Auth profile
        await updateProfile(currentUser, { displayName: newName });
        
        // Update Firestore
        const docRef = doc(db, "users", currentUser.uid);
        await updateDoc(docRef, { fullName: newName });
        
        showMessage("Name updated successfully!");
    } catch (error) {
        console.error("Error updating name:", error);
        showMessage("Failed to update name.", 'error');
    }
});


// Password Reset
resetPasswordBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    try {
        await sendPasswordResetEmail(auth, currentUser.email);
        showMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
        console.error("Error sending reset email:", error);
        showMessage("Failed to send reset email.", 'error');
    }
});

// Resend Verification
resendVerificationBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    try {
        await sendEmailVerification(currentUser);
        showMessage("Verification email sent. Please check your inbox.");
    } catch (error) {
        console.error("Error sending verification:", error);
        showMessage("Failed to send verification email. Try again later.", 'error');
    }
});

// Delete Account
deleteAccountBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    const confirmDelete = confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
        try {
            // Delete user doc from firestore
            const docRef = doc(db, "users", currentUser.uid);
            await deleteDoc(docRef);

            // Delete from Auth
            await deleteUser(currentUser);
            
            // Redirect will happen automatically via onAuthStateChanged
        } catch (error) {
            console.error("Error deleting account:", error);
            if (error.code === 'auth/requires-recent-login') {
                showMessage("For security reasons, please log out and log back in before deleting your account.", 'error');
            } else {
                showMessage("Failed to delete account.", 'error');
            }
        }
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error signing out:", error);
        showMessage("Failed to sign out.", 'error');
    }
});
