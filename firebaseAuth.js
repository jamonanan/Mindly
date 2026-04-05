
  // Import the functions you need from the SDKs you need
    // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getAuth , createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import {getFirestore, setDoc, doc, getDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  


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
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

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

    createUserWithEmailAndPassword(auth,email,password)
    .then((userCredentials)=>{
        const user=userCredentials.user;
        const userData={
            email: email,
            fullName: fullName

  };
  showMessage('Account created successfully! Redirecting to login...', 'signUpMessage');
  const docRef=doc(db,'users',user.uid);
    setDoc(docRef,userData)
    .then(()=>{
        // Wait 2 seconds so the user can read the success message before redirecting
        setTimeout(() => {
            window.location.href='login.html';
        }, 2000);
    })
    .catch((error)=>{
        console.error('Error saving user data:', error);
    });
})      
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
        // Signed in successfully
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        console.error('Login error:', error);
        showMessage('Invalid email or password.', 'loginMessage');
      });
  }

  // Monitor authentication state to display user name on dashboard
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const greetingElement = document.getElementById('userGreeting');
      if (greetingElement) {
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            greetingElement.innerText = `Welcome back, ${userData.fullName}!! ✨`;
          }
        }).catch((error) => {
          console.error("Error getting user document:", error);
        });
      }
    }
  });
