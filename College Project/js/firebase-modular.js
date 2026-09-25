// ========================================================
// Prep2Hire - Modern Modular ES Module (v10+)
// For use with bundlers (Vite/Webpack) or <script type="module">
// ========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBI6xQDj8_q4jStVDDbaDRtx5cB4j-8GKk",
  authDomain: "pre2hire.firebaseapp.com",
  projectId: "pre2hire",
  storageBucket: "pre2hire.firebasestorage.app",
  messagingSenderId: "191032215819",
  appId: "1:191032215819:web:a728347c03b339813d3a0e",
  measurementId: "G-QZ66KKLQ32"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics safely
export let analytics = null;
if (await isSupported()) {
    analytics = getAnalytics(app);
}
