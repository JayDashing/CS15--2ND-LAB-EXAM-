<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit(0);
}

// Configuration
$usersFile = 'users.json';
$response = ['success' => false, 'message' => '', 'data' => null];

// Helper function to read users from JSON file
function readUsers($filename) {
    if (!file_exists($filename)) {
        return [];
    }
    $content = file_get_contents($filename);
    return json_decode($content, true) ?: [];
}

// Helper function to write users to JSON file
function writeUsers($filename, $users) {
    return file_put_contents($filename, json_encode($users, JSON_PRETTY_PRINT));
}

// Helper function to validate email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Helper function to validate password strength
function isValidPassword($password) {
    // At least 6 characters, contains at least one letter and one number
    return strlen($password) >= 6 && preg_match('/[A-Za-z]/', $password) && preg_match('/[0-9]/', $password);
}

// Helper function to hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Helper function to verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Helper function to generate verification token
function generateVerificationToken() {
    return bin2hex(random_bytes(32));
}

// Helper function to sanitize input
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'test':
            $response['success'] = true;
            $response['message'] = 'PHP server is working correctly!';
            break;
            
        case 'register':
            // Validate required fields
            $requiredFields = ['fullName', 'email', 'username', 'password', 'confirmPassword', 'gender', 'hobbies', 'country', 'termsAccepted'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field]) || (is_string($input[$field]) && trim($input[$field]) === '')) {
                    throw new Exception("Field '$field' is required");
                }
            }
            
            // Sanitize inputs
            $fullName = sanitizeInput($input['fullName']);
            $email = sanitizeInput($input['email']);
            $username = sanitizeInput($input['username']);
            $password = $input['password'];
            $confirmPassword = $input['confirmPassword'];
            $gender = sanitizeInput($input['gender']);
            $hobbies = array_map('sanitizeInput', $input['hobbies']);
            $country = sanitizeInput($input['country']);
            $termsAccepted = (bool)$input['termsAccepted'];
            
            // Validate inputs
            if (strlen($fullName) < 2) {
                throw new Exception('Full name must be at least 2 characters long');
            }
            
            if (!isValidEmail($email)) {
                throw new Exception('Please enter a valid email address');
            }
            
            if (strlen($username) < 3 || strlen($username) > 20) {
                throw new Exception('Username must be between 3 and 20 characters');
            }
            
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
                throw new Exception('Username can only contain letters, numbers, and underscores');
            }
            
            if (!isValidPassword($password)) {
                throw new Exception('Password must be at least 6 characters and contain at least one letter and one number');
            }
            
            if ($password !== $confirmPassword) {
                throw new Exception('Passwords do not match');
            }
            
            if (!in_array($gender, ['male', 'female', 'other'])) {
                throw new Exception('Please select a valid gender');
            }
            
            if (empty($hobbies)) {
                throw new Exception('Please select at least one hobby');
            }
            
            if (!$termsAccepted) {
                throw new Exception('You must agree to the Terms of Service');
            }
            
            // Read existing users
            $users = readUsers($usersFile);
            
            // Check if username or email already exists
            foreach ($users as $user) {
                if (strtolower($user['username']) === strtolower($username)) {
                    throw new Exception('Username already exists');
                }
                if (strtolower($user['email']) === strtolower($email)) {
                    throw new Exception('Email already registered');
                }
            }
            
            // Create new user
            $newUser = [
                'id' => time() . rand(1000, 9999),
                'fullName' => $fullName,
                'email' => $email,
                'username' => $username,
                'password' => hashPassword($password),
                'gender' => $gender,
                'hobbies' => $hobbies,
                'country' => $country,
                'isVerified' => false,
                'verificationToken' => generateVerificationToken(),
                'registeredAt' => date('Y-m-d H:i:s'),
                'lastLogin' => null
            ];
            
            // Add user to array
            $users[] = $newUser;
            
            // Save to file
            if (writeUsers($usersFile, $users)) {
                // Remove sensitive data before sending response
                unset($newUser['password']);
                unset($newUser['verificationToken']);
                
                $response['success'] = true;
                $response['message'] = 'Registration successful! Please check your email for verification instructions.';
                $response['data'] = $newUser;
            } else {
                throw new Exception('Failed to save user data');
            }
            break;
            
        case 'login':
            // Validate required fields
            if (!isset($input['username']) || !isset($input['password'])) {
                throw new Exception('Username and password are required');
            }
            
            $username = sanitizeInput($input['username']);
            $password = $input['password'];
            
            if (empty($username) || empty($password)) {
                throw new Exception('Username and password cannot be empty');
            }
            
            // Read users
            $users = readUsers($usersFile);
            
            // Find user
            $user = null;
            foreach ($users as $key => $u) {
                if (strtolower($u['username']) === strtolower($username) || strtolower($u['email']) === strtolower($username)) {
                    $user = $u;
                    $userKey = $key;
                    break;
                }
            }
            
            if (!$user || !verifyPassword($password, $user['password'])) {
                throw new Exception('Invalid username or password');
            }
            
            // Check if user is verified (optional - you can remove this if you don't want email verification)
            // if (!$user['isVerified']) {
            //     throw new Exception('Please verify your email address before logging in');
            // }
            
            // Update last login
            $users[$userKey]['lastLogin'] = date('Y-m-d H:i:s');
            writeUsers($usersFile, $users);
            
            // Remove sensitive data
            unset($user['password']);
            unset($user['verificationToken']);
            
            $response['success'] = true;
            $response['message'] = 'Login successful!';
            $response['data'] = $user;
            break;
            
        case 'verify':
            // Email verification (optional)
            if (!isset($input['token'])) {
                throw new Exception('Verification token is required');
            }
            
            $token = sanitizeInput($input['token']);
            $users = readUsers($usersFile);
            
            foreach ($users as $key => $user) {
                if ($user['verificationToken'] === $token) {
                    $users[$key]['isVerified'] = true;
                    $users[$key]['verificationToken'] = null;
                    
                    if (writeUsers($usersFile, $users)) {
                        $response['success'] = true;
                        $response['message'] = 'Email verified successfully!';
                    } else {
                        throw new Exception('Failed to update verification status');
                    }
                    break;
                }
            }
            
            if (!$response['success']) {
                throw new Exception('Invalid or expired verification token');
            }
            break;
            
        case 'getUserData':
            // Get user data by username
            if (!isset($input['username'])) {
                throw new Exception('Username is required');
            }
            
            $username = sanitizeInput($input['username']);
            $users = readUsers($usersFile);
            
            foreach ($users as $user) {
                if (strtolower($user['username']) === strtolower($username)) {
                    unset($user['password']);
                    unset($user['verificationToken']);
                    
                    $response['success'] = true;
                    $response['data'] = $user;
                    break;
                }
            }
            
            if (!$response['success']) {
                throw new Exception('User not found');
            }
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Send response
echo json_encode($response);
?>
