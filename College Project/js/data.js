const mockJobs = [
    {
        id: 1,
        title: "Frontend Developer",
        company: "TechNova Solutions",
        skills: ["HTML", "CSS", "JavaScript", "React"],
        salary: "₹5,00,000 - ₹10,00,000"
    },
    {
        id: 2,
        title: "Backend Engineer",
        company: "CloudCore Systems",
        skills: ["Node.js", "Python", "SQL", "AWS"],
        salary: "₹8,00,000 - ₹15,00,000"
    },
    {
        id: 3,
        title: "UI/UX Designer",
        company: "Creative Minds",
        skills: ["Figma", "Adobe XD", "Prototyping"],
        salary: "₹4,00,000 - ₹8,00,000"
    },
    {
        id: 4,
        title: "Data Analyst",
        company: "DataMetrics Inc",
        skills: ["Python", "SQL", "Tableau", "Excel"],
        salary: "₹4,00,000 - ₹7,00,000"
    },
    {
        id: 5,
        title: "Full Stack Developer",
        company: "Startup Hub",
        skills: ["React", "Node.js", "MongoDB"],
        salary: "₹7,00,000 - ₹12,00,000"
    },
    {
        id: 6,
        title: "Software Tester (QA)",
        company: "QualityFirst Apps",
        skills: ["Selenium", "Jest", "Manual Testing"],
        salary: "₹3,50,000 - ₹6,00,000"
    }
];

const mockCourses = [
    {
        id: 1,
        title: "Complete Web Development Bootcamp",
        duration: "55 Hours",
        platform: "YouTube",
        link: "#",
        icon: "fa-code",
        color: "#e44d26"
    },
    {
        id: 2,
        title: "Advanced JavaScript Concepts",
        duration: "12 Hours",
        platform: "Udemy Equivalent",
        link: "#",
        icon: "fa-js",
        color: "#f7df1e"
    },
    {
        id: 3,
        title: "UI/UX Design Masterclass",
        duration: "8 Hours",
        platform: "YouTube",
        link: "#",
        icon: "fa-pen-nib",
        color: "#ec4899"
    },
    {
        id: 4,
        title: "Data Structures & Algorithms",
        duration: "40 Hours",
        platform: "Coursera Equivalent",
        link: "#",
        icon: "fa-database",
        color: "#10b981"
    },
    {
        id: 5,
        title: "React JS Crash Course",
        duration: "4 Hours",
        platform: "YouTube",
        link: "#",
        icon: "fa-react",
        color: "#61dafb"
    },
    {
        id: 6,
        title: "Python for Beginners",
        duration: "15 Hours",
        platform: "YouTube",
        link: "#",
        icon: "fa-python",
        color: "#3572A5"
    }
];

const roadmapData = [
    {
        title: "Step 1: Choose Your Path",
        icon: "fa-solid fa-compass",
        desc: "Decide whether you want to be a Frontend Developer, Backend Developer, Data Analyst, or Designer.",
        points: ["Research market demand", "Identify your interests", "Set a long-term goal"]
    },
    {
        title: "Step 2: Learn the Fundamentals",
        icon: "fa-solid fa-book-bookmark",
        desc: "Start with the basics. Don't rush to frameworks. Solidify your understanding of core concepts.",
        points: ["HTML/CSS/JS for Web", "Python/SQL for Data", "Version Control (Git)"]
    },
    {
        title: "Step 3: Practice & Build Projects",
        icon: "fa-solid fa-laptop-code",
        desc: "Theory isn't enough. Build projects to apply what you've learned. Start small and gradually increase complexity.",
        points: ["Build a portfolio website", "Create clones of popular apps", "Contribute to Open Source"]
    },
    {
        title: "Step 4: Prepare for Interviews",
        icon: "fa-solid fa-clipboard-question",
        desc: "Brush up on your data structures, algorithms, and core CS concepts. Practice mock interviews.",
        points: ["Solve coding problems (LeetCode/HackerRank)", "Review behavioral questions", "Refine your resume"]
    },
    {
        title: "Step 5: Apply & Network",
        icon: "fa-solid fa-paper-plane",
        desc: "Start applying to jobs, internships, and reach out to professionals on LinkedIn.",
        points: ["Tailor resume for each job", "Attend tech meetups", "Ask for referrals"]
    }
];

const mcqQuestions = [
    {
        question: "Which of the following is NOT a JavaScript framework/library?",
        options: ["React", "Angular", "Django", "Vue"],
        answer: 2 // index 2 (Django)
    },
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink Text Makeup Language", "Home Tool Markup Language"],
        answer: 0
    },
    {
        question: "Which data structure uses LIFO (Last In First Out)?",
        options: ["Queue", "Stack", "Tree", "Graph"],
        answer: 1
    },
    {
        question: "If a train travels 60 miles in 1.5 hours, what is its average speed?",
        options: ["30 mph", "40 mph", "45 mph", "50 mph"],
        answer: 1
    },
    {
        question: "What comes next in the sequence? 2, 6, 12, 20, 30, ...",
        options: ["38", "40", "42", "44"],
        answer: 2
    },
    {
        question: "If A=1, B=2, C=3, what is the value of 'CAT' if you multiply the letters together?",
        options: ["60", "24", "40", "120"],
        answer: 0
    },
    {
        question: "A man buys a watch for ₹500 and sells it for ₹600. What is his profit percentage?",
        options: ["10%", "15%", "20%", "25%"],
        answer: 2
    },
    {
        question: "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
        options: ["5 minutes", "100 minutes", "50 minutes", "1 minute"],
        answer: 0
    }
];

const hrQuestions = [
    "Tell me about yourself.",
    "Why do you want to work for our company?",
    "What are your greatest strengths and weaknesses?",
    "Describe a challenging project you worked on and how you overcame the obstacles.",
    "Where do you see yourself in 5 years?"
];
