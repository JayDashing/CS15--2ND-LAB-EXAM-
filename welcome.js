// Welcome page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeWelcomePage();
});

// Load user data and display it
function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('nexusCurrentUser'));
    
    if (!currentUser) {
        // Redirect to landing page if not logged in
        window.location.href = 'landing.html';
        return;
    }
    
    // User data is now stored directly in currentUser object from PHP response
    const userData = currentUser;
    
    // Update navigation
    document.getElementById('userName').textContent = userData.fullName;
    
    // Update welcome section
    document.getElementById('welcomeUserName').textContent = userData.fullName;
    
    // Update member since
    if (userData.registeredAt) {
        const registrationDate = new Date(userData.registeredAt);
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const memberSince = monthNames[registrationDate.getMonth()] + " " + registrationDate.getFullYear();
        document.getElementById('memberSince').textContent = memberSince;
    }
    
    // Update profile section
    document.getElementById('profileName').textContent = userData.fullName;
    document.getElementById('profileEmail').textContent = userData.email;
    
    if (userData.country) {
        document.getElementById('profileCountry').textContent = getCountryName(userData.country);
    }
    
    if (userData.gender) {
        document.getElementById('profileGender').textContent = capitalizeFirst(userData.gender);
    }
    
    if (userData.hobbies && userData.hobbies.length > 0) {
        document.getElementById('profileHobbies').textContent = userData.hobbies.map(hobby => capitalizeFirst(hobby)).join(', ');
    }
}

// Initialize welcome page animations and interactions
function initializeWelcomePage() {
    // Animate dashboard cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe dashboard cards
    document.querySelectorAll('.dashboard-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Show welcome message
    setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem('nexusCurrentUser'));
        if (currentUser) {
            showMessage(`Welcome back, ${currentUser.fullName}! 🎉`, 'success');
        }
    }, 1000);
}

// Navigation functions
function showProfile() {
    showMessage('Profile settings coming soon!', 'info');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('nexusCurrentUser');
        showMessage('Logged out successfully!', 'info');
        setTimeout(() => {
            window.location.href = 'landing.html';
        }, 1500);
    }
}

// Academic dashboard action functions
function viewCourses() {
    showMessage('Courses section coming soon! You will be able to view your enrolled courses here.', 'info');
}

function viewAssignments() {
    showMessage('Assignments portal coming soon! Check your pending and submitted assignments.', 'info');
}

function viewGrades() {
    showMessage('Grades dashboard coming soon! View your academic performance and progress.', 'info');
}

function viewSchedule() {
    showMessage('Class schedule coming soon! View your weekly class timetable.', 'info');
}

function openResource(type) {
    const messages = {
        'lab': 'Programming Lab environment coming soon! Practice coding exercises online.',
        'library': 'Digital Library access coming soon! Browse CS textbooks and research papers.',
        'groups': 'Study Groups platform coming soon! Connect and collaborate with classmates.'
    };
    showMessage(messages[type] || 'Resource coming soon!', 'info');
}

function editProfile() {
    showMessage('Profile editor coming soon!', 'info');
}

// Helper functions
function getCountryName(countryCode) {
    const countries = {
        'US': 'United States',
        'CA': 'Canada',
        'UK': 'United Kingdom',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'JP': 'Japan',
        'CN': 'China',
        'IN': 'India',
        'BR': 'Brazil',
        'MX': 'Mexico',
        'IT': 'Italy',
        'ES': 'Spain',
        'RU': 'Russia',
        'KR': 'South Korea',
        'NL': 'Netherlands',
        'SE': 'Sweden',
        'NO': 'Norway',
        'DK': 'Denmark',
        'FI': 'Finland',
        'PH': 'Philippines'
    };
    
    return countries[countryCode] || countryCode;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Message display functions
function showMessage(message, type = 'success') {
    const messageDisplay = document.getElementById('messageDisplay');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = message;
    messageDisplay.className = `message-display show ${type}`;
    messageDisplay.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

function hideMessage() {
    const messageDisplay = document.getElementById('messageDisplay');
    messageDisplay.style.display = 'none';
    messageDisplay.className = 'message-display';
}

// Add some interactive features
document.addEventListener('click', function(e) {
    // Add ripple effect to buttons
    if (e.target.matches('button, .action-btn')) {
        createRipple(e);
    }
});

function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
    
    // Add CSS for ripple effect
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            button {
                position: relative;
                overflow: hidden;
            }
            .ripple {
                position: absolute;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Dynamic time updates
function updateTimeBasedContent() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Welcome back';
    
    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }
    
    // Update the welcome title with time-based greeting
    const titleElement = document.querySelector('.welcome-title');
    if (titleElement) {
        const currentUser = JSON.parse(localStorage.getItem('nexusCurrentUser'));
        if (currentUser) {
            const userName = titleElement.querySelector('span').textContent;
            titleElement.innerHTML = `${greeting}, <span id="welcomeUserName">${userName}</span>! 🎉`;
        }
    }
}

// Call time update on load
setTimeout(updateTimeBasedContent, 2000);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Q for quick logout
    if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        logout();
    }
    
    // Ctrl/Cmd + N for new project
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNew();
    }
    
    // Escape to close messages
    if (e.key === 'Escape') {
        hideMessage();
    }
});

// Add smooth scroll behavior for any internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance optimization: Lazy load non-critical content
function lazyLoadContent() {
    // Simulate loading additional content
    setTimeout(() => {
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }, 1500);
}

// Initialize lazy loading
lazyLoadContent();