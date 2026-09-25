// ========================================================
// Prep2Hire - Firebase Backend Configuration & Service
// ========================================================

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBI6xQDj8_q4jStVDDbaDRtx5cB4j-8GKk",
    authDomain: "pre2hire.firebaseapp.com",
    projectId: "pre2hire",
    storageBucket: "pre2hire.firebasestorage.app",
    messagingSenderId: "191032215819",
    appId: "1:191032215819:web:a728347c03b339813d3a0e",
    measurementId: "G-QZ66KKLQ32"
};

// Initialize Firebase services
let firebaseApp = null;
let auth = null;
let db = null;
let analytics = null;
let isFirebaseReady = false;

try {
    if (typeof firebase !== 'undefined') {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Analytics initialization with environment check
        try {
            if (typeof firebase.analytics === 'function' && window.location.protocol.startsWith('http')) {
                analytics = firebase.analytics();
            }
        } catch (analyticsErr) {
            console.info("[Firebase Analytics] Not active in current environment:", analyticsErr.message);
        }

        isFirebaseReady = true;
        console.log("🔥 [Firebase] Backend connected successfully to project: pre2hire");
    } else {
        console.warn("[Firebase] SDK not detected. Operating in offline/localStorage mode.");
    }
} catch (error) {
    console.error("[Firebase] Initialization error:", error);
}

// Global references for seamless access across scripts
window.firebaseConfig = firebaseConfig;
window.firebaseApp = firebaseApp;
window.auth = auth;
window.db = db;
window.analytics = analytics;
window.isFirebaseReady = isFirebaseReady;

// --------------------------------------------------------
// Backend Helper Service Functions
// --------------------------------------------------------
const FirebaseService = {
    // Authentication
    signUpWithEmail: async function(name, email, password) {
        if (!auth) throw new Error("Firebase Auth is not initialized.");
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user display name
        await user.updateProfile({ displayName: name });

        // Create or update user profile document in Cloud Firestore
        if (db) {
            try {
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    savedJobs: [],
                    appliedJobs: []
                }, { merge: true });
            } catch (err) {
                console.warn("[Firestore] User document creation error:", err);
            }
        }

        return user;
    },

    signInWithEmail: async function(email, password) {
        if (!auth) throw new Error("Firebase Auth is not initialized.");
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    },

    signInWithGoogle: async function() {
        if (!auth) throw new Error("Firebase Auth is not initialized.");
        const provider = new firebase.auth.GoogleAuthProvider();
        const userCredential = await auth.signInWithPopup(provider);
        const user = userCredential.user;

        // Upsert user in Firestore
        if (db) {
            try {
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (err) {
                console.warn("[Firestore] Google user sync error:", err);
            }
        }

        return user;
    },

    signOut: async function() {
        if (!auth) return;
        await auth.signOut();
    },

    // Cloud Firestore: User Profile & Saved Jobs
    fetchUserData: async function(uid) {
        if (!db) return null;
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                return doc.data();
            }
        } catch (err) {
            console.warn("[Firestore] Fetch user data error:", err);
        }
        return null;
    },

    syncSavedJobs: async function(uid, savedJobsList) {
        if (!db || !uid) return;
        try {
            await db.collection('users').doc(uid).set({
                savedJobs: savedJobsList
            }, { merge: true });
        } catch (err) {
            console.error("[Firestore] Sync saved jobs error:", err);
        }
    },

    // Cloud Firestore: Job Applications
    submitJobApplication: async function(user, job) {
        const applicationData = {
            userId: user.uid || 'anonymous',
            userEmail: user.email || 'N/A',
            userName: user.name || user.displayName || 'Applicant',
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            appliedAt: firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
            status: 'Applied'
        };

        if (db) {
            const docRef = await db.collection('applications').add(applicationData);
            
            // Also append to user document
            if (user.uid) {
                try {
                    await db.collection('users').doc(user.uid).set({
                        appliedJobs: firebase.firestore.FieldValue.arrayUnion({
                            applicationId: docRef.id,
                            jobId: job.id,
                            jobTitle: job.title,
                            company: job.company,
                            appliedAt: new Date().toISOString()
                        })
                    }, { merge: true });
                } catch(e) {
                    console.warn("[Firestore] User appliedJobs array update:", e);
                }
            }
            return { id: docRef.id, ...applicationData };
        }
        return applicationData;
    },

    // Cloud Firestore: Contact Form
    saveContactMessage: async function(contactData) {
        const payload = {
            ...contactData,
            createdAt: firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
        };

        if (db) {
            const docRef = await db.collection('contacts').add(payload);
            return docRef.id;
        }
        return null;
    }
};

window.FirebaseService = FirebaseService;
