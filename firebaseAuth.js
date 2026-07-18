
  // Import the functions you need from the SDKs you need
    // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import {getFirestore, setDoc, doc, getDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";



  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyB2lRYk9YZZ7UBG9H1bt3mpEl2K8TNegKQ",
    authDomain: "mindly-7f7c4.firebaseapp.com",
    projectId: "mindly-7f7c4",
    storageBucket: "mindly-7f7c4.firebasestorage.app",
    messagingSenderId: "505317673514",
    appId: "1:505317673514:web:b78c2b1b32b733892f1153"
  };

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  export const provider = new GoogleAuthProvider();

  function showMessage(message, divId){
    var messageDiv=document.getElementById(divId);
    messageDiv.style.display='block';
    messageDiv.innerHTML=message;
    messageDiv.style.opacity='1';
    setTimeout(function(){
        messageDiv.style.opacity='0';
  },3000);
  }

  // Function to handle user registration
  window.registerUser = function() {
    const email=document.getElementById('registerEmail').value;
    const password=document.getElementById('registerPassword').value;
    const confirmPassword=document.getElementById('confirmPassword').value;
    const fullName=document.getElementById('fullName').value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match.', 'signUpMessage');
        return;
    }

    // Validate password rules
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        showMessage('Please ensure your password meets all the rules.', 'signUpMessage');
        return;
    }

    createUserWithEmailAndPassword(auth,email,password)
    .then((userCredentials)=>{
        const user=userCredentials.user;
        const userData={
            email: email,
            fullName: fullName
        };

        const docRef=doc(db,'users',user.uid);
        setDoc(docRef,userData)
        .then(()=>{
            sendEmailVerification(user)
            .then(() => {
                showMessage('Account created! Please check your email for a verification link.', 'signUpMessage');
                // Wait 3 seconds so the user can read the success message before redirecting
                setTimeout(() => {
                    window.location.href='login.html';
                }, 3000);
            })
            .catch((error) => {
                console.error('Error sending verification email:', error);
                showMessage('Account created, but error sending verification email.', 'signUpMessage');
            });
        })
        .catch((error)=>{
            console.error('Error saving user data:', error);
        });
    })      
//If user enters email for already registered one.
    .catch((error)=>{
        const errorCode=error.code;
        if(errorCode==='auth/email-already-in-use'){
            showMessage('The email address is already in use by another account.','signUpMessage');
        }
        else{
            showMessage('Error creating account: ','signUpMessage');
        }
    });
  }

  // Function to handle user login
  window.loginUser = function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (!userCredential.user.emailVerified) {
          showMessage('Please verify your email address before logging in.', 'loginMessage');
          signOut(auth);
          return;
        }
        // Signed in successfully
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        console.error('Login error:', error);
        showMessage('Invalid email or password.', 'loginMessage');
      });
  }

  // Monitor authentication state to display user name on dashboard and profile pictures
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // Greet user if element exists
          const greetingElement = document.getElementById('userGreeting');
          if (greetingElement) {
            greetingElement.innerText = `Welcome back, ${userData.fullName}!! ✨`;
          }

          // Update profile picture everywhere if element exists
          const profilePicUrl = userData.profilePicUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.uid;
          const profilePicElements = document.querySelectorAll('.user-profile-pic');
          profilePicElements.forEach(el => {
            el.src = profilePicUrl;
          });
        }
      }).catch((error) => {
        console.error("Error getting user document:", error);
      });
    }
  });

  // Function to handle Google Sign-In
  window.signInWithGoogle = function() {
    signInWithPopup(auth, provider)
      .then((result) => {
        // The signed-in user info
        const user = result.user;
        
        // Prepare user data to save in Firestore
        const userData = {
          email: user.email,
          fullName: user.displayName || 'Google User'
        };

        const docRef = doc(db, 'users', user.uid);
        
        // Use setDoc with merge: true to update or create user doc
        setDoc(docRef, userData, { merge: true })
          .then(() => {
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
          })
          .catch((error) => {
            console.error('Error saving Google user data:', error);
            // Optionally redirect anyway if saving fails, or show message
            window.location.href = 'dashboard.html';
          });
      })
      .catch((error) => {
        console.error('Google Sign-In error:', error);
        // Show error message if on a page with message div
        const msgDiv = document.getElementById('loginMessage') || document.getElementById('signUpMessage');
        if (msgDiv) {
            msgDiv.style.display = 'block';
            msgDiv.innerHTML = 'Error signing in with Google: ' + error.message;
        } else {
            alert('Error signing in with Google: ' + error.message);
        }
      });
  }
