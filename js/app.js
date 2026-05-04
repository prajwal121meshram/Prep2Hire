// State Management
let savedJobs = JSON.parse(localStorage.getItem('prep2hire_saved_jobs')) || [];
let completedTopics = JSON.parse(localStorage.getItem('prep2hire_completed_topics')) || 0;

// Utility functions
const saveState = () => {
    localStorage.setItem('prep2hire_saved_jobs', JSON.stringify(savedJobs));
    localStorage.setItem('prep2hire_completed_topics', JSON.stringify(completedTopics));
};

const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
        savedJobs = savedJobs.filter(id => id !== jobId);
    } else {
        savedJobs.push(jobId);
    }
    saveState();
    // Re-render current view if on jobs or dashboard
    const currentRoute = location.hash.replace('#', '') || 'home';
    if (currentRoute === 'jobs' || currentRoute === 'dashboard') {
        renderView(currentRoute);
    }
};

// Routing & View Rendering
const appContent = document.getElementById('app-content');
const navLinks = document.querySelectorAll('[data-route]');
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.querySelector('.nav-links');

// Mobile Menu Toggle
mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
});

// Navigation Handling
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        window.location.hash = route;
        navMenu.classList.remove('show');
    });
});

window.addEventListener('hashchange', () => {
    const route = location.hash.replace('#', '') || 'home';
    updateActiveNav(route);
    renderView(route);
    window.scrollTo(0, 0);
});

const updateActiveNav = (route) => {
    navLinks.forEach(link => {
        if (link.getAttribute('data-route') === route) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

// --- View Templates ---

const views = {
    home: () => `
        <section class="hero fade-in">
            <div class="hero-content">
                <h1>Find Jobs and Prepare Easily</h1>
                <p>Your one-stop destination for career guidance, interview preparation, and finding the perfect job opportunities.</p>
                <div class="hero-btns">
                    <a href="#jobs" class="btn btn-primary">Find Jobs</a>
                    <a href="#courses" class="btn btn-outline" style="background: rgba(255,255,255,0.1); border-color: white; color: white;">Start Learning</a>
                </div>
            </div>
        </section>
        
        <section class="section fade-in">
            <div class="section-header">
                <h2>Why Choose Prep2Hire?</h2>
                <p>Everything you need to launch your career</p>
            </div>
            <div class="grid">
                <div class="card" style="text-align: center;">
                    <i class="fa-solid fa-briefcase" style="font-size: 3rem; color: var(--primary); margin-bottom: 20px;"></i>
                    <h3 class="card-title">Curated Jobs</h3>
                    <p style="color: var(--gray);">Find jobs tailored to your skills and aspirations.</p>
                </div>
                <div class="card" style="text-align: center;">
                    <i class="fa-solid fa-book-open" style="font-size: 3rem; color: var(--secondary); margin-bottom: 20px;"></i>
                    <h3 class="card-title">Preparation Material</h3>
                    <p style="color: var(--gray);">Access MCQs, coding problems, and interview Q&As.</p>
                </div>
                <div class="card" style="text-align: center;">
                    <i class="fa-solid fa-map-location-dot" style="font-size: 3rem; color: var(--primary); margin-bottom: 20px;"></i>
                    <h3 class="card-title">Structured Roadmaps</h3>
                    <p style="color: var(--gray);">Follow step-by-step guides for different career paths.</p>
                </div>
            </div>
        </section>
    `,
    jobs: () => `
        <section class="section fade-in">
            <div class="section-header">
                <h2>Latest Job Openings</h2>
                <p>Browse through our curated list of opportunities</p>
            </div>
            <div class="grid">
                ${mockJobs.map(job => `
                    <div class="card job-card">
                        <h3 class="card-title">${job.title}</h3>
                        <div class="company"><i class="fa-solid fa-building"></i> ${job.company}</div>
                        <div class="skills">
                            ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                        <div class="salary"><i class="fa-solid fa-money-bill-wave"></i> ${job.salary}</div>
                        <div class="card-actions">
                            <button class="btn btn-primary" style="flex: 1;" onclick="alert('Application sent for ${job.title}!')">Apply Now</button>
                            <button class="btn-icon ${savedJobs.includes(job.id) ? 'saved' : ''}" onclick="toggleSaveJob(${job.id})" title="${savedJobs.includes(job.id) ? 'Remove' : 'Save'} Job">
                                <i class="fa-${savedJobs.includes(job.id) ? 'solid' : 'regular'} fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `,
    preparation: () => `
        <section class="section fade-in">
            <div class="section-header">
                <h2>Interview Preparation</h2>
                <p>Test your knowledge and practice your skills</p>
            </div>
            
            <div class="prep-tabs">
                <button class="tab-btn active" onclick="switchPrepTab('mcq')">Aptitude & MCQ</button>
                <button class="tab-btn" onclick="switchPrepTab('coding')">Coding Practice</button>
                <button class="tab-btn" onclick="switchPrepTab('interview')">HR & Tech Interview</button>
            </div>

            <div class="prep-content" id="prep-container">
                <!-- Content injected by switchPrepTab -->
            </div>
        </section>
    `,
    courses: () => `
        <section class="section fade-in">
            <div class="section-header">
                <h2>Recommended Courses</h2>
                <p>Learn new skills to land your dream job</p>
            </div>
            <div class="grid">
                ${mockCourses.map(course => `
                    <div class="card course-card">
                        <i class="fa-brands ${course.icon}" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 15px;"></i>
                        <h3 class="card-title">${course.title}</h3>
                        <div class="duration"><i class="fa-regular fa-clock"></i> ${course.duration}</div>
                        <div class="platform"><i class="fa-brands fa-youtube"></i> ${course.platform}</div>
                        <a href="${course.link}" class="btn btn-outline btn-full" style="margin-top: auto;" target="_blank">View Course</a>
                    </div>
                `).join('')}
            </div>
        </section>
    `,
    roadmap: () => `
        <section class="section fade-in">
            <div class="section-header">
                <h2>Career Roadmap</h2>
                <p>Your step-by-step guide to success</p>
            </div>
            <div class="timeline">
                ${roadmapData.map((step, index) => `
                    <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}">
                        <div class="timeline-content">
                            <h3>${step.title}</h3>
                            <p>${step.desc}</p>
                            <ul>
                                ${step.points.map(point => `<li>${point}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `,
    dashboard: () => {
        const savedJobsData = mockJobs.filter(job => savedJobs.includes(job.id));
        
        return `
        <section class="section fade-in">
            <div class="section-header">
                <h2>Your Dashboard</h2>
                <p>Track your progress and saved items</p>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <p>Profile Completion</p>
                    <h3>85%</h3>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <p>Jobs Applied</p>
                    <h3>12</h3>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    <p>Saved Jobs</p>
                    <h3>${savedJobs.length}</h3>
                </div>
            </div>

            <h3 style="margin-bottom: 20px; font-size: 1.8rem;">Saved Jobs</h3>
            ${savedJobsData.length > 0 ? `
                <div class="grid">
                    ${savedJobsData.map(job => `
                        <div class="card job-card">
                            <h3 class="card-title">${job.title}</h3>
                            <div class="company"><i class="fa-solid fa-building"></i> ${job.company}</div>
                            <div class="salary"><i class="fa-solid fa-money-bill-wave"></i> ${job.salary}</div>
                            <div class="card-actions">
                                <button class="btn btn-primary" style="flex: 1;" onclick="alert('Applying for ${job.title}')">Apply</button>
                                <button class="btn-icon saved" onclick="toggleSaveJob(${job.id})" title="Remove">
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
                    <a href="#jobs" class="btn btn-outline" style="margin-top: 15px;">Browse Jobs</a>
                </div>
            `}
        </section>
    `},
    login: () => `
        <section class="section fade-in" style="min-height: 70vh; display: flex; align-items: center; justify-content: center;">
            <div class="contact-form" style="width: 100%; max-width: 450px; text-align: center;">
                <div style="margin-bottom: 30px;">
                    <i class="fa-solid fa-user-circle" style="font-size: 4rem; color: var(--primary); margin-bottom: 15px;"></i>
                    <h2 style="font-size: 2rem; color: var(--dark);">Welcome Back</h2>
                    <p style="color: var(--gray);">Sign in to continue to Prep2Hire</p>
                </div>
                <form onsubmit="event.preventDefault(); window.location.hash = 'dashboard';">
                    <div class="form-group" style="text-align: left;">
                        <label>Email</label>
                        <input type="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group" style="text-align: left;">
                        <label>Password</label>
                        <input type="password" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full" style="margin-top: 10px;">Sign In</button>
                </form>
                <p style="margin-top: 20px; color: var(--gray); font-size: 0.9rem;">Don't have an account? <a href="#" style="color: var(--primary); font-weight: 600;">Sign up</a></p>
            </div>
        </section>
    `,
    contact: () => `
        <section class="section fade-in">
            <div class="section-header">
                <h2>Contact Us</h2>
                <p>Have questions? We're here to help.</p>
            </div>
            <div class="contact-form">
                <form onsubmit="event.preventDefault(); alert('Message sent successfully!'); this.reset();">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" class="form-control" placeholder="Your Name" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" placeholder="Your Email" required>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea class="form-control" placeholder="How can we help you?" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">Send Message</button>
                </form>
            </div>
        </section>
    `
};

// Core Renderer
const renderView = (route) => {
    if (views[route]) {
        appContent.innerHTML = views[route]();
        // Setup initial state for prep tab if routed to preparation
        if (route === 'preparation') {
            switchPrepTab('mcq');
        }
    } else {
        appContent.innerHTML = views['home']();
    }
};

// Preparation Tab Logic
window.switchPrepTab = (tab) => {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event && event.target && event.target.classList && event.target.classList.add('active');

    const container = document.getElementById('prep-container');
    if (!container) return;

    if (tab === 'mcq') {
        container.innerHTML = `
            <h3 style="margin-bottom: 20px; color: var(--primary);">Multiple Choice Questions</h3>
            ${mcqQuestions.map((q, i) => `
                <div class="question-item">
                    <h4>${i + 1}. ${q.question}</h4>
                    <div class="mcq-options">
                        ${q.options.map((opt, optIndex) => `
                            <label>
                                <input type="radio" name="q${i}" value="${optIndex}" onchange="checkAnswer(${i}, ${optIndex})">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                    <div id="feedback-${i}" style="margin-top: 10px; font-weight: 500;"></div>
                </div>
            `).join('')}
        `;
    } else if (tab === 'coding') {
        container.innerHTML = `
            <h3 style="margin-bottom: 20px; color: var(--primary);">Coding Practice</h3>
            <div class="question-item">
                <h4>1. Two Sum</h4>
                <p style="color: var(--gray); margin-bottom: 10px;">Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
                <div class="coding-problem">
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}</div>
            </div>
            <div class="question-item">
                <h4>2. Reverse String</h4>
                <p style="color: var(--gray); margin-bottom: 10px;">Write a function that reverses a string.</p>
                <div class="coding-problem">
function reverseString(str) {
    return str.split('').reverse().join('');
}</div>
            </div>
        `;
    } else if (tab === 'interview') {
        container.innerHTML = `
            <h3 style="margin-bottom: 20px; color: var(--primary);">HR & Technical Interview Questions</h3>
            <ul style="list-style: none;">
                ${hrQuestions.map((q, i) => `
                    <li style="margin-bottom: 15px; padding: 15px; background: var(--bg); border-radius: 8px; border-left: 4px solid var(--secondary);">
                        <strong>Q${i+1}:</strong> ${q}
                    </li>
                `).join('')}
            </ul>
        `;
    }
};

window.checkAnswer = (qIndex, selectedIndex) => {
    const q = mcqQuestions[qIndex];
    const feedbackEl = document.getElementById(`feedback-${qIndex}`);
    if (q.answer === selectedIndex) {
        feedbackEl.innerHTML = '<span style="color: #10b981;"><i class="fa-solid fa-check-circle"></i> Correct!</span>';
    } else {
        feedbackEl.innerHTML = '<span style="color: #ef4444;"><i class="fa-solid fa-times-circle"></i> Incorrect. Try again.</span>';
    }
};

// Initialize App
const initRoute = location.hash.replace('#', '') || 'home';
updateActiveNav(initRoute);
renderView(initRoute);

// Theme Toggling Logic
const lightBtn = document.getElementById('light-mode-btn');
const darkBtn = document.getElementById('dark-mode-btn');
const currentTheme = localStorage.getItem('prep2hire_theme') || 'light';

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
    } else {
        document.body.classList.remove('dark-theme');
        lightBtn.classList.add('active');
        darkBtn.classList.remove('active');
    }
    localStorage.setItem('prep2hire_theme', theme);
};

// Set initial theme
applyTheme(currentTheme);

lightBtn.addEventListener('click', () => applyTheme('light'));
darkBtn.addEventListener('click', () => applyTheme('dark'));
