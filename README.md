# Nexus Authentication System Setup Guide

## Overview
The application now includes:
- ✅ Secure user registration with validation
- ✅ User login with password hashing
- ✅ JSON file storage for user data
- ✅ Enhanced password requirements (letters + numbers)
- ✅ Username/email duplicate checking
- ✅ Proper error handling and validation

## Files Created/Modified:
1. **logreg.php** - Backend API for user registration and login
2. **users.json** - JSON file to store user data
3. **landing.js** - Updated to use PHP backend
4. **welcome.js** - Updated to work with new user data structure
5. **backend-test.html** - Test page to verify backend functionality

## Setup Instructions:

### 1. Install a Local Server
You need a local server that supports PHP to run this application.

**Option A: XAMPP (Recommended)**
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP
3. Start Apache from XAMPP Control Panel

**Option B: PHP Built-in Server**
1. Install PHP from https://www.php.net/downloads.php
2. Navigate to your project folder in command prompt
3. Run: `php -S localhost:8000`

### 2. Place Files in Server Directory
- For XAMPP: Copy all files to `C:\xampp\htdocs\nexus\`
- For PHP built-in server: Files are already in the correct location

### 3. Set File Permissions
Make sure `users.json` is writable:
- Right-click users.json → Properties → Security
- Ensure "Full control" is granted to the web server

### 4. Access the Application
- XAMPP: http://localhost/nexus/landing.html
- PHP built-in: http://localhost:8000/landing.html

## Testing the Backend:

### Option 1: Use the Test Page
1. Open http://localhost:8000/backend-test.html
2. Click "Test Register User" to test registration
3. Click "Test Login" to test login
4. Click "View users.json" to see stored data

### Option 2: Manual Testing
1. Open the main application: http://localhost:8000/landing.html
2. Click "Sign Up" and create a new account
3. Try logging in with the created account

## New Features:

### Enhanced Password Security:
- Passwords are now hashed using PHP's password_hash()
- Passwords must contain at least one letter and one number
- Minimum 6 characters required

### Improved Validation:
- Server-side validation for all fields
- Username must be 3-20 characters, alphanumeric + underscore only
- Email format validation
- Duplicate username/email checking

### JSON Storage:
- All user data is stored in users.json
- Passwords are securely hashed
- Registration timestamps included
- Last login tracking

### Error Handling:
- Comprehensive error messages
- Both client-side and server-side validation
- Network error handling

## File Structure:
```
nexus/
├── landing.html          # Main landing/login page
├── landing.css          # Styles for landing page
├── landing.js           # Updated frontend logic
├── welcome.html         # Dashboard after login
├── welcome.css          # Dashboard styles
├── welcome.js           # Updated dashboard logic
├── logreg.php           # Backend API
├── users.json           # User data storage
├── backend-test.html    # Testing interface
└── README.md           # This file
```

## Security Features:
- Password hashing with PHP's password_hash()
- Input sanitization to prevent XSS
- Server-side validation
- SQL injection prevention (though we're using JSON, not SQL)
- Secure session management

## Troubleshooting:

### Common Issues:
1. **"showModal is not defined"** - Make sure landing.js is properly linked
2. **"Server connection failed"** - Ensure PHP server is running
3. **"Permission denied"** - Check users.json file permissions
4. **"Invalid JSON input"** - Check browser console for JavaScript errors

### Debug Steps:
1. Check browser console for JavaScript errors
2. Check PHP error log (usually in XAMPP/logs/php_error_log)
3. Verify users.json is writable
4. Test with backend-test.html first

## Next Steps (Optional Enhancements):
- Email verification system
- Password reset functionality
- User profile editing
- Admin panel for user management
- Session timeout handling
- Remember me functionality