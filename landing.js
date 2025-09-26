// User storage now handled by PHP backend
let currentUser = JSON.parse(localStorage.getItem('nexusCurrentUser')) || null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (currentUser) {
        showUserMenu();
    }
    
    // Add form event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegistration);
    document.getElementById('contactForm').addEventListener('submit', handleContactForm);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
    }
});

// Modal functions
function showModal(type) {
    clearFormErrors();
    document.getElementById(type + 'Modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal(type) {
    document.getElementById(type + 'Modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    clearFormErrors();
}

function switchModal(from, to) {
    hideModal(from);
    setTimeout(() => showModal(to), 300);
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
        clearFormErrors();
    }
});

// Clear form errors
function clearFormErrors() {
    document.querySelectorAll('.error-message, .general-error').forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
    });
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        const formGroup = errorElement.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('has-error');
        }
    }
}

// Validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    // At least 6 characters, contains at least one letter and one number
    return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

// API helper function
async function makeAPIRequest(data) {
    try {
        const response = await fetch('logreg.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonResponse = await response.json();
        console.log('Server response:', jsonResponse);
        return jsonResponse;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Server connection failed. Please try again.');
    }
}

// Registration handler
async function handleRegistration(e) {
    e.preventDefault();
    clearFormErrors();
    
    const fullName = document.getElementById('registerFullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value);
    const country = document.getElementById('registerCountry').value;
    const termsAccepted = document.getElementById('registerTerms').checked;
    
    let hasErrors = false;

    // Client-side validation
    if (!fullName || fullName.length < 2) {
        showError('registerFullNameError', 'Full name must be at least 2 characters');
        hasErrors = true;
    }

    if (!email) {
        showError('registerEmailError', 'Email is required');
        hasErrors = true;
    } else if (!isValidEmail(email)) {
        showError('registerEmailError', 'Please enter a valid email address');
        hasErrors = true;
    }

    if (!username) {
        showError('registerUsernameError', 'Username is required');
        hasErrors = true;
    } else if (username.length < 3 || username.length > 20) {
        showError('registerUsernameError', 'Username must be between 3 and 20 characters');
        hasErrors = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showError('registerUsernameError', 'Username can only contain letters, numbers, and underscores');
        hasErrors = true;
    }

    if (!password) {
        showError('registerPasswordError', 'Password is required');
        hasErrors = true;
    } else if (!isValidPassword(password)) {
        showError('registerPasswordError', 'Password must be at least 6 characters and contain at least one letter and one number');
        hasErrors = true;
    }

    if (!confirmPassword) {
        showError('registerConfirmPasswordError', 'Please confirm your password');
        hasErrors = true;
    } else if (password !== confirmPassword) {
        showError('registerConfirmPasswordError', 'Passwords do not match');
        hasErrors = true;
    }

    if (!gender) {
        showError('registerGenderError', 'Please select your gender');
        hasErrors = true;
    }

    if (interests.length === 0) {
        showError('registerInterestsError', 'Please select at least one area of interest');
        hasErrors = true;
    }

    if (!country) {
        showError('registerCountryError', 'Please select your country');
        hasErrors = true;
    }

    if (!termsAccepted) {
        showError('registerTermsError', 'You must agree to the Terms of Service');
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    // Show loading message
    showMessage('Creating your account...', 'info');
    
    // Debug logging
    console.log('Registration data:', {
        fullName,
        email,
        username,
        password: '***',
        confirmPassword: '***',
        gender,
        interests,
        country,
        termsAccepted
    });
    
    try {
        // Make API request
        const response = await makeAPIRequest({
            action: 'register',
            fullName,
            email,
            username,
            password,
            confirmPassword,
            gender,
            hobbies: interests,
            country,
            termsAccepted
        });

        console.log('Registration response:', response);

        if (response.success) {
            // Store user data locally for session management
            currentUser = {
                username: response.data.username,
                fullName: response.data.fullName,
                email: response.data.email,
                id: response.data.id
            };
            localStorage.setItem('nexusCurrentUser', JSON.stringify(currentUser));

            hideModal('register');
            showMessage(response.message + ' Redirecting to your dashboard...', 'success');
            
            // Redirect to welcome page after a short delay
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 2000);
        } else {
            // Handle server-side validation errors
            if (response.message.includes('Username already exists')) {
                showError('registerUsernameError', response.message);
            } else if (response.message.includes('Email already registered')) {
                showError('registerEmailError', response.message);
            } else {
                showError('registerGeneralError', response.message);
            }
        }
    } catch (error) {
        showError('registerGeneralError', error.message);
    }
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    clearFormErrors();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    let hasErrors = false;

    // Client-side validation
    if (!username) {
        showError('loginUsernameError', 'Username or email is required');
        hasErrors = true;
    }

    if (!password) {
        showError('loginPasswordError', 'Password is required');
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    // Show loading message
    showMessage('Signing you in...', 'info');
    
    try {
        // Make API request
        const response = await makeAPIRequest({
            action: 'login',
            username,
            password
        });

        if (response.success) {
            // Store user data locally for session management
            currentUser = {
                username: response.data.username,
                fullName: response.data.fullName,
                email: response.data.email,
                id: response.data.id,
                gender: response.data.gender,
                hobbies: response.data.hobbies,
                country: response.data.country,
                registeredAt: response.data.registeredAt
            };
            localStorage.setItem('nexusCurrentUser', JSON.stringify(currentUser));

            hideModal('login');
            showMessage('Welcome back, ' + response.data.fullName + '! Redirecting to your dashboard...', 'success');
            
            // Redirect to welcome page after a short delay
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 2000);
        } else {
            showError('loginGeneralError', response.message);
        }
    } catch (error) {
        showError('loginGeneralError', error.message);
    }
}

// Dashboard function
function goToDashboard() {
    window.location.href = 'welcome.html';
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('nexusCurrentUser');
    showAuthButtons();
    showMessage('You have been logged out successfully', 'info');
}

// Show user menu
function showUserMenu() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('welcomeUser').textContent = 'Welcome, ' + currentUser.fullName;
}

// Show auth buttons
function showAuthButtons() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
}

// Message display functions
function showMessage(message, type = 'success') {
    const messageDisplay = document.getElementById('messageDisplay');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = message;
    messageDisplay.className = 'message-display show ' + type;
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

// Contact form handler
function handleContactForm(e) {
    e.preventDefault();
    showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
    e.target.reset();
}

// Animate elements on scroll
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

document.querySelectorAll('.feature-card, .about-text, .contact-form').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});