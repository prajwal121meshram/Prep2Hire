# Prep2Hire - Firebase Backend Setup & Guide

This project now has a complete **Firebase Cloud Backend** integrated into the frontend application.

---

## 🚀 What Was Integrated

### 1. Firebase Authentication
- **Email & Password Sign Up:** Creates user accounts in Firebase Auth and initializes a profile document in Cloud Firestore.
- **Email & Password Sign In:** Authenticates credentials directly against Firebase servers.
- **Google Sign-In:** One-click OAuth login via Google Provider.
- **Session Persistence & Real-time State (`onAuthStateChanged`):** Automatically remembers logged-in users across reloads and syncs user details to the navigation bar and dashboard.
- **User Logout:** Secure sign-out with state reset.

### 2. Cloud Firestore Database
- **User Profiles (`users/{uid}`):** Stores registered user profiles, display names, email, timestamp, and activity arrays.
- **Saved Jobs Sync (`users/{uid}.savedJobs`):** Bookmarked jobs sync across devices in real time into the user's Firestore document.
- **Job Applications (`applications/{id}` & `users/{uid}.appliedJobs`):** Clicking **Apply Now** submits a real job application record to Cloud Firestore with candidate info, job title, company, and submission timestamp.
- **Contact Inquiries (`contacts/{id}`):** Messages submitted via the "Contact Us" form are stored directly in Cloud Firestore.

### 3. Firebase Analytics
- Initialized with measurement ID `G-QZ66KKLQ32`.
- Tracks navigation route changes (`page_view`).

---

## 🛠️ File Structure

| File | Purpose |
| :--- | :--- |
| `index.html` | Loads Firebase SDKs (App, Auth, Firestore, Analytics) and hosts the SPA structure. |
| `js/firebase-config.js` | Firebase credentials, initialization, and `FirebaseService` backend functions. |
| `js/firebase-modular.js` | Modern ES module version for use with bundlers (Vite/Webpack). |
| `js/app.js` | Full frontend application logic wired to Firebase Auth, Firestore, and Analytics. |
| `css/style.css` | Styles for Google Sign-In button, toast alerts, error banners, and the "Firebase Live" status pill. |

---

## ⚙️ Firebase Console Checklist (One-Time Setup)

To ensure all Firebase operations work smoothly, make sure the following are enabled in your [Firebase Console](https://console.firebase.google.com/project/pre2hire):

### 1. Enable Authentication Providers
1. Open the [Firebase Console](https://console.firebase.google.com/project/pre2hire).
2. Go to **Build** &rarr; **Authentication** &rarr; Click **Get Started** (if not already started).
3. Under the **Sign-in method** tab:
   - Click **Email/Password** &rarr; Toggle **Enable** &rarr; Click **Save**.
   - (Optional for Google Login) Click **Google** &rarr; Toggle **Enable** &rarr; Set Project support email &rarr; Click **Save**.

### 2. Enable Cloud Firestore
1. In the left sidebar, click **Build** &rarr; **Firestore Database**.
2. Click **Create database**.
3. Choose a location close to you (e.g., `asia-south1` or `us-central1`).
4. Select **Start in test mode** (allows read/write during development for 30 days) and click **Enable**.

---

## 💻 How to Run the Project

### Option A: Local Dev Server (Recommended)
In the terminal, run:
```bash
npx serve .
```
Then open `http://localhost:3000` in your browser.

### Option B: VS Code Live Server
Right-click `index.html` in VS Code and select **Open with Live Server**.

### Option C: Direct File Opening
Double-click `index.html` to open it in your web browser. (The app includes graceful fallbacks and offline resilience).
