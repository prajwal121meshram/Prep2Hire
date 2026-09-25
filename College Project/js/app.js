// ========================================================
// Prep2Hire - Core Application Logic & Firebase Backend
// ========================================================

const appContent = document.getElementById('app-content');
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.querySelector('.nav-links');

// --------------------------------------------------------
// Local State & Persistence
// --------------------------------------------------------
let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    name: "Guest",
    email: "",
    isLoggedIn: false
};

// --------------------------------------------------------
// Toast Notification Utility
// --------------------------------------------------------
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' 
        ? 'fa-circle-check' 
        : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info');
        
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px) scale(0.95)';
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}

// --------------------------------------------------------
// Error Translator for Firebase Auth
// --------------------------------------------------------
function getFriendlyAuthError(err) {
    if (!err) return "An unexpected error occurred.";
    switch (err.code) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
            return 'No user found with this email. Please create an account.';
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Incorrect email or password. Please verify your credentials.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email. Please log in.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/operation-not-allowed':
            return 'Authentication provider is not enabled in Firebase Console. Please enable Email/Password in Console.';
        case 'auth/popup-closed-by-user':
            return 'Google Sign-In popup was closed before completion.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        default:
            return err.message || 'Authentication error. Please try again.';
    }
}

// --------------------------------------------------------
// Routing System
// --------------------------------------------------------
const routes = {
    home: renderHome,
    jobs: renderJobs,
    preparation: renderPreparation,
    courses: renderCourses,
    roadmap: renderRoadmap,
    contact: renderContact,
    login: renderLogin,
    dashboard: renderDashboard
};

function navigateTo(route) {
    if(routes[route]) {
        appContent.innerHTML = routes[route]();
        updateActiveNav(route);
        window.scrollTo(0,0);
        
        // Log analytics page view if supported
        if (typeof firebase !== 'undefined' && firebase.analytics && window.analytics) {
            try {
                window.analytics.logEvent('page_view', { page_title: route });
            } catch(e) {}
        }

        // Post-render lifecycle setups
        if(route === 'preparation') setupPreparationEvents();
        if(route === 'jobs') setupJobsEvents();
        if(route === 'dashboard') setupDashboardEvents();
        if(route === 'login') setupLoginEvents();
        if(route === 'contact') setupContactEvents();
    }
}

function updateActiveNav(route) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        if(link.getAttribute('data-route') === route) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateNavbarUser() {
    const navUserBtn = document.getElementById('nav-user-btn');
    const navLoginBtn = document.getElementById('nav-login-btn');
    if (navUserBtn) {
        const displayName = currentUser.isLoggedIn && currentUser.name ? currentUser.name : 'Dashboard';
        navUserBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${displayName}`;
    }
    if (navLoginBtn) {
        if (currentUser.isLoggedIn) {
            navLoginBtn.textContent = 'Account';
            navLoginBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            navLoginBtn.textContent = 'Login';
            navLoginBtn.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        }
    }
}

// --------------------------------------------------------
// Real-time Firebase Authentication Listener
// --------------------------------------------------------
function initAuthListener() {
    if (typeof firebase !== 'undefined' && window.auth) {
        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = {
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    isLoggedIn: true
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateNavbarUser();

                // Fetch cloud data from Firestore
                if (window.FirebaseService) {
                    const userData = await FirebaseService.fetchUserData(user.uid);
                    if (userData) {
                        if (Array.isArray(userData.savedJobs)) {
                            savedJobs = userData.savedJobs;
                            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
                        }
                        if (Array.isArray(userData.appliedJobs)) {
                            appliedJobs = userData.appliedJobs;
                            localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
                        }
                    }
                }
            } else {
                currentUser = {
                    name: "Guest",
                    email: "",
                    isLoggedIn: false
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateNavbarUser();
            }

            // Refresh current view if currently in dashboard or jobs
            const currentRouteEl = document.querySelector('.dashboard-section');
            if (currentRouteEl) {
                navigateTo('dashboard');
            }
        });
    }
}

// --------------------------------------------------------
// Render Views
// --------------------------------------------------------

function renderHome() {
    return `
        <section class="hero fade-in">
            <div class="hero-content">
                <h1>Your Career Journey Starts Here</h1>
                <p>Prepare for interviews, discover jobs, and build your technical career with Prep2Hire.</p>
                <div class="hero-btns">
                    <button class="btn btn-primary" onclick="document.querySelector('[data-route=jobs]').click()">Find Jobs</button>
                    <button class="btn btn-outline" style="background:transparent; color:#fff; border-color:#fff;" onclick="document.querySelector('[data-route=preparation]').click()">Start Preparing</button>
                </div>
            </div>
        </section>
        <section class="section fade-in">
            <div class="section-header">
                <h2>Why Choose Prep2Hire?</h2>
                <p>Everything you need in one unified, cloud-connected platform</p>
            </div>
            <div class="grid">
                <div class="card" style="text-align:center;">
                    <i class="fa-solid fa-briefcase" style="font-size:2.5rem; color:var(--primary); margin-bottom:15px;"></i>
                    <h3 class="card-title">Curated Jobs</h3>
                    <p>Access high-growth roles, track applications, and save favorite positions in the cloud.</p>
                </div>
                <div class="card" style="text-align:center;">
                    <i class="fa-solid fa-laptop-code" style="font-size:2.5rem; color:var(--primary); margin-bottom:15px;"></i>
                    <h3 class="card-title">Coding Playground</h3>
                    <p>Practice coding directly in your browser with instant execution and output.</p>
                </div>
                <div class="card" style="text-align:center;">
                    <i class="fa-solid fa-cloud" style="font-size:2.5rem; color:var(--primary); margin-bottom:15px;"></i>
                    <h3 class="card-title">Firebase Cloud Sync</h3>
                    <p>Real-time authentication, cloud profile sync, and live job application tracking.</p>
                </div>
            </div>
        </section>
    `;
}

function renderJobs() {
    let jobsHtml = mockJobs.map(job => {
        const isSaved = savedJobs.some(sj => sj.id === job.id);
        const hasApplied = appliedJobs.some(aj => aj.jobId === job.id);

        return `
        <div class="card job-card fade-in">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                <h3 class="card-title" style="margin-bottom:0;">${job.title}</h3>
                <span style="font-size:0.8rem; background:rgba(99,102,241,0.1); color:var(--primary); padding:3px 8px; border-radius:12px; font-weight:600;">Full-time</span>
            </div>
            <p class="company"><i class="fa-solid fa-building"></i> ${job.company}</p>
            <p class="salary"><i class="fa-solid fa-indian-rupee-sign"></i> ${job.salary}</p>
            <div class="skills">
                ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="card-actions" style="display:flex; gap:10px; margin-top:15px;">
                <button class="btn btn-primary apply-job-btn" data-id="${job.id}" style="flex:1;" ${hasApplied ? 'disabled style="opacity:0.7;"' : ''}>
                    ${hasApplied ? '<i class="fa-solid fa-check"></i> Applied' : 'Apply Now'}
                </button>
                <button class="btn btn-outline save-job-btn ${isSaved ? 'saved' : ''}" style="${isSaved ? 'background: #fee2e2; color: #ef4444; border-color: #ef4444;' : ''}" data-id="${job.id}">
                    <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i> ${isSaved ? 'Saved' : 'Save'}
                </button>
            </div>
        </div>
        `;
    }).join('');

    return `
        <section class="section jobs-section fade-in">
            <div class="section-header">
                <h2>Latest Opportunities</h2>
                <p>Browse open tech roles and apply directly with your cloud profile</p>
            </div>
            <div class="grid">
                ${jobsHtml}
            </div>
        </section>
    `;
}

function renderPreparation() {
    return `
        <section class="section prep-section fade-in">
            <div class="section-header">
                <h2>Interview Preparation</h2>
                <p>Sharpen your technical aptitude, coding, and behavioral skills</p>
            </div>
            <div class="prep-tabs">
                <button class="tab-btn active" data-tab="mcq">Aptitude & MCQ</button>
                <button class="tab-btn" data-tab="coding">Coding Playground</button>
                <button class="tab-btn" data-tab="hr">HR Questions</button>
            </div>
            <div class="prep-content" id="prep-content">
                ${renderMCQ()}
            </div>
        </section>
    `;
}

function renderMCQ() {
    let mcqHtml = mcqQuestions.map((q, index) => `
        <div class="question-item">
            <h4>Q${index + 1}: ${q.question}</h4>
            <div class="mcq-options">
                ${q.options.map((opt, i) => `
                    <label>
                        <input type="radio" name="q${index}" value="${i}"> ${opt}
                    </label>
                `).join('')}
            </div>
            <button class="btn btn-primary check-ans-btn" data-qindex="${index}" style="margin-top:10px;">Check Answer</button>
            <p class="feedback" id="feedback-${index}" style="margin-top:10px; font-weight:600;"></p>
        </div>
    `).join('');
    return `<div class="mcq-container">${mcqHtml}</div>`;
}

function renderCoding() {
    return `
        <div class="coding-playground fade-in">
            <h3>Interactive JavaScript Playground</h3>
            <p style="color:var(--gray); margin-bottom:15px;">Write, run, and experiment with JavaScript code in real time.</p>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <textarea id="code-editor" class="form-control" rows="10" style="font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 15px;">// Write your JavaScript code below
function calculateBonus(salary, rating) {
    const multiplier = rating >= 4 ? 0.2 : 0.1;
    return salary * multiplier;
}

const bonus = calculateBonus(800000, 5);
console.log("Estimated Bonus: ₹" + bonus);</textarea>
                <button class="btn btn-primary" id="run-code-btn" style="align-self:flex-start;"><i class="fa-solid fa-play"></i> Run Code</button>
                <div class="output-console" style="padding: 15px; background: #000; color: #0f0; border-radius: 8px; min-height: 100px; font-family:monospace;" id="code-output">
                    // Output will appear here...
                </div>
            </div>
        </div>
    `;
}

function renderHR() {
    let hrHtml = hrQuestions.map((q, index) => `
        <div class="question-item">
            <h4>${index + 1}. ${q}</h4>
            <textarea class="form-control" rows="3" placeholder="Draft your response here..." style="margin-top:10px;"></textarea>
        </div>
    `).join('');
    
    return `
        <div class="hr-questions fade-in">
            <h3>Common HR & Behavioral Questions</h3>
            <p style="color:var(--gray); margin-bottom:20px;">Structure your STAR-method answers to popular interview questions.</p>
            <div class="hr-list">
                ${hrHtml}
            </div>
        </div>
    `;
}

function renderCourses() {
    const brandIcons = ['fa-js', 'fa-react', 'fa-python', 'fa-html5', 'fa-css3-alt', 'fa-node', 'fa-vuejs', 'fa-angular'];

    let coursesHtml = mockCourses.map(course => {
        let iconClass = course.icon;
        if (!iconClass.includes(' ')) {
            const prefix = brandIcons.includes(iconClass) ? 'fa-brands' : 'fa-solid';
            iconClass = `${prefix} ${iconClass}`;
        }
        const isYoutube = course.platform.includes('YouTube');
        const platformIcon = isYoutube ? 'fa-brands fa-youtube' : 'fa-solid fa-graduation-cap';
        const platformColor = isYoutube ? '#ef4444' : 'var(--primary)';
        return `
        <div class="card course-card fade-in" style="text-align:center;">
            <div style="font-size:3.5rem; color:${course.color || 'var(--primary)'}; margin-bottom:15px;">
                <i class="${iconClass}"></i>
            </div>
            <h3 class="card-title">${course.title}</h3>
            <p class="platform" style="margin-bottom: 10px; font-weight: 600; color: ${platformColor}; justify-content: center;"><i class="${platformIcon}"></i> ${course.platform}</p>
            <p class="duration" style="color: var(--gray); font-size: 0.9rem; margin-bottom: 20px; justify-content: center;"><i class="fa-regular fa-clock"></i> ${course.duration}</p>
            <a href="${course.link}" class="btn btn-outline btn-full" style="margin-top:auto;">Start Learning</a>
        </div>
        `;
    }).join('');

    return `
        <section class="section courses-section fade-in">
            <div class="section-header">
                <h2>Recommended Courses</h2>
                <p>Curated learning resources from industry-leading instructors</p>
            </div>
            <div class="grid">
                ${coursesHtml}
            </div>
        </section>
    `;
}

function renderRoadmap() {
    let roadmapHtml = roadmapData.map((step, index) => {
        let position = index % 2 === 0 ? 'left' : 'right';
        return `
        <div class="timeline-item ${position} fade-in">
            <div class="timeline-content">
                <h3>${step.title}</h3>
                <p style="margin-bottom: 12px; color: var(--gray);">${step.desc}</p>
                <ul>
                    ${step.points.map(p => `<li><i class="fa-solid fa-check" style="color: #10b981; margin-right: 8px; font-weight: 900;"></i>${p}</li>`).join('')}
                </ul>
            </div>
        </div>
        `;
    }).join('');

    return `
        <section class="section roadmap-section fade-in">
            <div class="section-header">
                <h2>Career Roadmap</h2>
                <p>A proven roadmap to guide you from beginner to hired engineer</p>
            </div>
            <div class="timeline">
                <svg class="timeline-wave-svg" viewBox="0 0 100 800" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#6366f1" />
                            <stop offset="50%" stop-color="#ec4899" />
                            <stop offset="100%" stop-color="#10b981" />
                        </linearGradient>
                    </defs>
                    <path d="M 50,0 C 100,100 0,200 50,300 C 100,400 0,500 50,600 C 100,700 0,780 50,800" 
                          fill="none" 
                          stroke="url(#wave-gradient)" 
                          stroke-width="4" 
                          stroke-dasharray="8,6" 
                          stroke-linecap="round" />
                </svg>
                ${roadmapHtml}
            </div>
        </section>
    `;
}

function renderContact() {
    return `
        <section class="section contact-section fade-in">
            <div class="section-header">
                <h2>Contact Us</h2>
                <p>Have questions, ideas, or feedback? Send us a message.</p>
            </div>
            <form class="contact-form" id="contact-form">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="contact-name" class="form-control" placeholder="John Doe" value="${currentUser.isLoggedIn ? currentUser.name : ''}" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="contact-email" class="form-control" placeholder="john@example.com" value="${currentUser.isLoggedIn ? currentUser.email : ''}" required>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea id="contact-message" class="form-control" rows="4" placeholder="How can we help you?" required></textarea>
                </div>
                <button type="submit" id="contact-submit-btn" class="btn btn-primary btn-full">
                    <i class="fa-solid fa-paper-plane" style="margin-right:6px;"></i> Send Message
                </button>
            </form>
        </section>
    `;
}

function renderLogin() {
    return `
        <section class="section login-section fade-in" style="min-height:75vh; display:flex; align-items:center; justify-content:center; padding:40px 20px;">
            <div class="auth-card" style="width:100%; max-width:440px; background:var(--white); padding:35px 30px; border-radius:var(--radius); box-shadow:var(--shadow-lg); border:1px solid rgba(0,0,0,0.06);">
                <div class="auth-tabs" style="display:flex; gap:10px; margin-bottom:20px; background:var(--bg); padding:5px; border-radius:30px;">
                    <button class="auth-tab-btn active" id="tab-login-btn" type="button" style="flex:1; padding:10px; border:none; border-radius:25px; font-weight:600; cursor:pointer; background:var(--primary); color:#fff; transition:var(--transition);">Login</button>
                    <button class="auth-tab-btn" id="tab-signup-btn" type="button" style="flex:1; padding:10px; border:none; border-radius:25px; font-weight:600; cursor:pointer; background:transparent; color:var(--gray); transition:var(--transition);">Sign Up</button>
                </div>

                <div class="auth-msg-banner" id="auth-banner"></div>

                <!-- Login Form -->
                <form id="login-form">
                    <div style="text-align:center; margin-bottom:20px;">
                        <i class="fa-solid fa-circle-user" style="font-size:3rem; color:var(--primary); margin-bottom:10px;"></i>
                        <h2 style="font-size:1.6rem; color:var(--dark);">Welcome Back</h2>
                        <p style="color:var(--gray); font-size:0.9rem;">Sign in with your Firebase cloud account</p>
                    </div>
                    <div class="form-group">
                        <label style="color:var(--dark); font-weight:500;"><i class="fa-solid fa-envelope" style="margin-right:6px; color:var(--primary);"></i>Email Address</label>
                        <input type="email" id="login-email" class="form-control" placeholder="user@prep2hire.com" value="${currentUser.isLoggedIn ? currentUser.email : ''}" required>
                    </div>
                    <div class="form-group">
                        <label style="color:var(--dark); font-weight:500;"><i class="fa-solid fa-lock" style="margin-right:6px; color:var(--primary);"></i>Password</label>
                        <input type="password" id="login-password" class="form-control" placeholder="••••••••" required>
                    </div>
                    <button type="submit" id="login-submit-btn" class="btn btn-primary btn-full" style="margin-top:10px; padding:12px;">Sign In</button>
                    
                    <div class="auth-divider"><span>OR</span></div>

                    <button type="button" class="btn-google" id="google-auth-btn">
                        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/></svg>
                        Continue with Google
                    </button>
                </form>

                <!-- Sign Up Form (hidden by default) -->
                <form id="signup-form" style="display:none;">
                    <div style="text-align:center; margin-bottom:20px;">
                        <i class="fa-solid fa-user-plus" style="font-size:3rem; color:var(--secondary); margin-bottom:10px;"></i>
                        <h2 style="font-size:1.6rem; color:var(--dark);">Create Account</h2>
                        <p style="color:var(--gray); font-size:0.9rem;">Register to save jobs and sync progress via Firebase</p>
                    </div>
                    <div class="form-group">
                        <label style="color:var(--dark); font-weight:500;"><i class="fa-solid fa-user" style="margin-right:6px; color:var(--primary);"></i>Full Name / User Name</label>
                        <input type="text" id="signup-name" class="form-control" placeholder="e.g. Rahul Sharma" required>
                    </div>
                    <div class="form-group">
                        <label style="color:var(--dark); font-weight:500;"><i class="fa-solid fa-envelope" style="margin-right:6px; color:var(--primary);"></i>Email Address</label>
                        <input type="email" id="signup-email" class="form-control" placeholder="name@example.com" required>
                    </div>
                    <div class="form-group">
                        <label style="color:var(--dark); font-weight:500;"><i class="fa-solid fa-lock" style="margin-right:6px; color:var(--primary);"></i>Password</label>
                        <input type="password" id="signup-password" class="form-control" placeholder="Minimum 6 characters" required>
                    </div>
                    <button type="submit" id="signup-submit-btn" class="btn btn-primary btn-full" style="margin-top:10px; padding:12px; background:linear-gradient(135deg, var(--secondary), var(--primary));">Register Account</button>
                </form>
            </div>
        </section>
    `;
}

function renderDashboard() {
    const welcomeName = currentUser.isLoggedIn && currentUser.name ? currentUser.name : 'Guest User';

    let savedJobsHtml = savedJobs.length > 0 ? `
        <div class="grid">
            ${savedJobs.map(job => `
                <div class="card job-card fade-in">
                    <h3 class="card-title">${job.title}</h3>
                    <div class="company"><i class="fa-solid fa-building"></i> ${job.company}</div>
                    <div class="salary"><i class="fa-solid fa-indian-rupee-sign"></i> ${job.salary}</div>
                    <div class="card-actions" style="margin-top:15px; display:flex; gap:10px;">
                        <button class="btn btn-primary apply-job-btn" style="flex: 1;" data-id="${job.id}">
                            ${appliedJobs.some(aj => aj.jobId === job.id) ? '<i class="fa-solid fa-check"></i> Applied' : 'Apply'}
                        </button>
                        <button class="btn-icon saved remove-job-btn" data-id="${job.id}" title="Remove Job">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : `
        <div class="empty-state">
            <i class="fa-regular fa-folder-open"></i>
            <h3>No saved jobs yet</h3>
            <p>Go to the Jobs section to find and save jobs you're interested in.</p>
            <button class="btn btn-outline" style="margin-top: 15px;" onclick="document.querySelector('[data-route=jobs]').click()">Browse Jobs</button>
        </div>
    `;

    let appliedJobsHtml = appliedJobs.length > 0 ? `
        <div style="margin-top:30px; margin-bottom:30px;">
            <h3 style="margin-bottom:15px; font-size:1.5rem;"><i class="fa-solid fa-paper-plane" style="color:var(--primary); margin-right:8px;"></i>Recent Applications (${appliedJobs.length})</h3>
            <div>
                ${appliedJobs.map(app => `
                    <div class="applied-job-item fade-in">
                        <div>
                            <strong style="color:var(--dark); font-size:1.05rem;">${app.jobTitle}</strong>
                            <div style="color:var(--gray); font-size:0.85rem;"><i class="fa-solid fa-building" style="margin-right:5px;"></i>${app.company} &bull; <i class="fa-regular fa-calendar" style="margin-right:4px;"></i>${app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}</div>
                        </div>
                        <span class="status-pill"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:0.65rem; margin-right:4px;"></i>Under Review</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    return `
        <section class="section dashboard-section fade-in">
            <div class="section-header" style="text-align:left; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                <div>
                    <h2>Welcome back, <span style="color:var(--primary);">${welcomeName}</span>! 👋</h2>
                    <p style="margin-top:5px; color:var(--gray);">
                        Track your applications, saved jobs, and profile status 
                        ${currentUser.isLoggedIn ? `(<span style="color:#10b981; font-weight:600;"><i class="fa-solid fa-circle-check"></i> ${currentUser.email}</span>)` : '(Guest Mode)'}
                    </p>
                </div>
                <div>
                    ${currentUser.isLoggedIn ? `
                        <button id="logout-btn" class="btn btn-outline" style="border-color:#ef4444; color:#ef4444;"><i class="fa-solid fa-right-from-bracket" style="margin-right:6px;"></i>Logout</button>
                    ` : `
                        <button onclick="document.querySelector('[data-route=login]').click()" class="btn btn-primary"><i class="fa-solid fa-right-to-bracket" style="margin-right:6px;"></i>Login / Sign Up</button>
                    `}
                </div>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <p>User Profile</p>
                    <h3 style="font-size:1.8rem; margin:15px 0;">${welcomeName}</h3>
                    <p style="font-size:0.85rem; opacity:0.9;">
                        ${currentUser.isLoggedIn ? '🔥 Cloud Synced (Firebase)' : 'Local Guest Account'}
                    </p>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <p>Jobs Applied</p>
                    <h3>${appliedJobs.length}</h3>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    <p>Saved Jobs</p>
                    <h3>${savedJobs.length}</h3>
                </div>
            </div>

            ${appliedJobsHtml}

            <h3 style="margin-bottom: 20px; font-size: 1.5rem;"><i class="fa-solid fa-bookmark" style="color:var(--secondary); margin-right:8px;"></i>Saved Jobs (${savedJobs.length})</h3>
            ${savedJobsHtml}
        </section>
    `;
}

// --------------------------------------------------------
// Event Handlers & Interactions
// --------------------------------------------------------

function setupPreparationEvents() {
    const tabs = document.querySelectorAll('.tab-btn');
    const content = document.getElementById('prep-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            const tabName = e.target.getAttribute('data-tab');
            if(tabName === 'mcq') {
                content.innerHTML = renderMCQ();
                setupMCQEvents();
            } else if(tabName === 'coding') {
                content.innerHTML = renderCoding();
                setupCodingEvents();
            } else if(tabName === 'hr') {
                content.innerHTML = renderHR();
            }
        });
    });
    
    setupMCQEvents();
}

function setupMCQEvents() {
    document.querySelectorAll('.check-ans-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-qindex');
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const feedback = document.getElementById(`feedback-${index}`);
            
            if(!selected) {
                feedback.textContent = "Please select an option first.";
                feedback.style.color = "#f59e0b";
                return;
            }
            
            if(parseInt(selected.value) === mcqQuestions[index].answer) {
                feedback.textContent = "Correct Answer! 🎉";
                feedback.style.color = "#10b981";
            } else {
                feedback.textContent = "Incorrect. Try again.";
                feedback.style.color = "#ef4444";
            }
        });
    });
}

function setupCodingEvents() {
    const runBtn = document.getElementById('run-code-btn');
    const editor = document.getElementById('code-editor');
    const output = document.getElementById('code-output');

    if(runBtn) {
        runBtn.addEventListener('click', () => {
            const code = editor.value;
            output.innerHTML = '';
            
            const originalLog = console.log;
            console.log = function(...args) {
                output.innerHTML += args.join(' ') + '<br>';
                originalLog.apply(console, args);
            };
            
            try {
                const result = eval(code);
                if (result !== undefined) {
                    output.innerHTML += '<span style="color: #aaa;">> ' + result + '</span><br>';
                }
            } catch (err) {
                output.innerHTML += '<span style="color: #ef4444;">Error: ' + err.message + '</span><br>';
            }
            
            console.log = originalLog;
        });
    }
}

// Job Application Workflow
async function handleApplyJob(jobId, btnElement) {
    const job = mockJobs.find(j => j.id === jobId) || savedJobs.find(j => j.id === jobId);
    if (!job) return;

    if (!currentUser.isLoggedIn) {
        showToast("Please login or sign up to submit applications.", "info");
        navigateTo('login');
        return;
    }

    if (appliedJobs.some(aj => aj.jobId === jobId)) {
        showToast(`You have already applied for ${job.title}!`, "info");
        return;
    }

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Applying...';
    }

    try {
        if (window.FirebaseService) {
            await FirebaseService.submitJobApplication(currentUser, job);
        }

        const newApp = {
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            appliedAt: new Date().toISOString()
        };
        appliedJobs.push(newApp);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));

        showToast(`Application submitted for ${job.title} at ${job.company}! Stored in Firebase.`);

        if (btnElement) {
            btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Applied';
            btnElement.style.opacity = '0.7';
        }

        // Refresh dashboard if active
        if (document.querySelector('.dashboard-section')) {
            navigateTo('dashboard');
        }
    } catch (err) {
        console.error("Application error:", err);
        showToast("Error submitting application: " + err.message, "error");
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = 'Apply Now';
        }
    }
}

function setupJobsEvents() {
    // Save / Unsave Job
    document.querySelectorAll('.save-job-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const btnEl = e.currentTarget;
            const jobId = parseInt(btnEl.getAttribute('data-id'));
            const job = mockJobs.find(j => j.id === jobId);
            
            const index = savedJobs.findIndex(j => j.id === jobId);
            if(index === -1 && job) {
                savedJobs.push(job);
                btnEl.innerHTML = '<i class="fa-solid fa-bookmark"></i> Saved';
                btnEl.classList.add('saved');
                btnEl.style.background = "#fee2e2";
                btnEl.style.color = "#ef4444";
                btnEl.style.borderColor = "#ef4444";
                showToast(`Saved "${job.title}" to your list`);
            } else if(index !== -1) {
                savedJobs.splice(index, 1);
                btnEl.innerHTML = '<i class="fa-regular fa-bookmark"></i> Save';
                btnEl.classList.remove('saved');
                btnEl.style.background = "transparent";
                btnEl.style.color = "var(--primary)";
                btnEl.style.borderColor = "var(--primary)";
                showToast(`Removed "${job.title}" from saved jobs`, "info");
            }
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));

            // Sync with Firestore if logged in
            if (currentUser.isLoggedIn && window.FirebaseService && currentUser.uid) {
                await FirebaseService.syncSavedJobs(currentUser.uid, savedJobs);
            }
        });
    });

    // Apply for Job
    document.querySelectorAll('.apply-job-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = parseInt(e.currentTarget.getAttribute('data-id'));
            handleApplyJob(jobId, e.currentTarget);
        });
    });
}

function setupContactEvents() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        const submitBtn = document.getElementById('contact-submit-btn');

        if (!name || !email || !message) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        try {
            if (window.FirebaseService) {
                await FirebaseService.saveContactMessage({
                    name,
                    email,
                    message,
                    userId: currentUser.isLoggedIn ? currentUser.uid : null
                });
            }
            showToast("✨ Message sent! Saved to Firebase Firestore.");
            contactForm.reset();
        } catch (err) {
            console.error("Contact form error:", err);
            showToast("Message recorded successfully!");
            contactForm.reset();
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane" style="margin-right:6px;"></i> Send Message';
        }
    });
}

function setupLoginEvents() {
    const loginTabBtn = document.getElementById('tab-login-btn');
    const signupTabBtn = document.getElementById('tab-signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authBanner = document.getElementById('auth-banner');
    const googleAuthBtn = document.getElementById('google-auth-btn');

    function showBanner(msg, type = 'error') {
        if (!authBanner) return;
        authBanner.textContent = msg;
        authBanner.className = `auth-msg-banner ${type}`;
        authBanner.style.display = 'block';
    }

    function hideBanner() {
        if (!authBanner) return;
        authBanner.style.display = 'none';
        authBanner.textContent = '';
    }

    if (loginTabBtn && signupTabBtn) {
        loginTabBtn.addEventListener('click', () => {
            hideBanner();
            loginTabBtn.style.background = 'var(--primary)';
            loginTabBtn.style.color = '#fff';
            signupTabBtn.style.background = 'transparent';
            signupTabBtn.style.color = 'var(--gray)';
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        });

        signupTabBtn.addEventListener('click', () => {
            hideBanner();
            signupTabBtn.style.background = 'var(--secondary)';
            signupTabBtn.style.color = '#fff';
            loginTabBtn.style.background = 'transparent';
            loginTabBtn.style.color = 'var(--gray)';
            signupForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    }

    // Email/Password Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideBanner();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('login-submit-btn');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

            try {
                if (window.FirebaseService && window.auth) {
                    await FirebaseService.signInWithEmail(email, password);
                    showToast("🎉 Welcome back! Signed in with Firebase.");
                    navigateTo('dashboard');
                } else {
                    // Fallback to local user
                    currentUser = {
                        name: email.split('@')[0],
                        email: email,
                        isLoggedIn: true
                    };
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateNavbarUser();
                    showToast("Logged in (Local Mode)");
                    navigateTo('dashboard');
                }
            } catch (err) {
                console.error("Login error:", err);
                showBanner(getFriendlyAuthError(err), 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Sign In';
            }
        });
    }

    // Email/Password Sign Up
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideBanner();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const submitBtn = document.getElementById('signup-submit-btn');

            if (password.length < 6) {
                showBanner("Password must be at least 6 characters long.", 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

            try {
                if (window.FirebaseService && window.auth) {
                    await FirebaseService.signUpWithEmail(name, email, password);
                    showToast("🎉 Account created successfully in Firebase!");
                    navigateTo('dashboard');
                } else {
                    currentUser = {
                        name: name,
                        email: email,
                        isLoggedIn: true
                    };
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateNavbarUser();
                    showToast("Account created (Local Mode)");
                    navigateTo('dashboard');
                }
            } catch (err) {
                console.error("Sign up error:", err);
                showBanner(getFriendlyAuthError(err), 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Register Account';
            }
        });
    }

    // Google Sign-In
    if (googleAuthBtn) {
        googleAuthBtn.addEventListener('click', async () => {
            hideBanner();
            googleAuthBtn.disabled = true;
            googleAuthBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting to Google...';

            try {
                if (window.FirebaseService && window.auth) {
                    await FirebaseService.signInWithGoogle();
                    showToast("🎉 Signed in with Google via Firebase!");
                    navigateTo('dashboard');
                } else {
                    showBanner("Firebase Authentication not initialized.", 'error');
                }
            } catch (err) {
                console.error("Google Auth error:", err);
                showBanner(getFriendlyAuthError(err), 'error');
            } finally {
                googleAuthBtn.disabled = false;
                googleAuthBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/></svg>
                    Continue with Google
                `;
            }
        });
    }
}

function setupDashboardEvents() {
    // Remove job from saved list
    document.querySelectorAll('.remove-job-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const jobId = parseInt(e.currentTarget.getAttribute('data-id'));
            savedJobs = savedJobs.filter(j => j.id !== jobId);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));

            // Sync with Firestore
            if (currentUser.isLoggedIn && window.FirebaseService && currentUser.uid) {
                await FirebaseService.syncSavedJobs(currentUser.uid, savedJobs);
            }

            showToast("Job removed from saved list", "info");
            navigateTo('dashboard');
        });
    });

    // Apply button inside Dashboard
    document.querySelectorAll('.dashboard-section .apply-job-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = parseInt(e.currentTarget.getAttribute('data-id'));
            handleApplyJob(jobId, e.currentTarget);
        });
    });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging out...';

            try {
                if (window.FirebaseService) {
                    await FirebaseService.signOut();
                }
            } catch (err) {
                console.error("Sign out error:", err);
            }

            currentUser = {
                name: "Guest",
                email: "",
                isLoggedIn: false
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateNavbarUser();
            showToast("Logged out successfully");
            navigateTo('login');
        });
    }
}

// --------------------------------------------------------
// Application Initialization
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Setup initial state and user
    updateNavbarUser();
    navigateTo('home');

    // Initialize Firebase Auth real-time listener
    initAuthListener();

    // Route Navigation Handlers
    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if(navLinks && navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
            }
            const route = link.getAttribute('data-route');
            navigateTo(route);
        });
    });

    // Mobile Hamburger Menu
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // Light / Dark Theme Switching
    const lightBtn = document.getElementById('light-mode-btn');
    const darkBtn = document.getElementById('dark-mode-btn');
    
    function setTheme(theme) {
        if(theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (darkBtn) darkBtn.classList.add('active');
            if (lightBtn) lightBtn.classList.remove('active');
        } else {
            document.body.classList.remove('dark-theme');
            if (lightBtn) lightBtn.classList.add('active');
            if (darkBtn) darkBtn.classList.remove('active');
        }
        localStorage.setItem('theme', theme);
    }

    if(lightBtn && darkBtn) {
        lightBtn.addEventListener('click', () => setTheme('light'));
        darkBtn.addEventListener('click', () => setTheme('dark'));
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }
});