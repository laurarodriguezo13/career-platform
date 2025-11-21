// Real AWS Cognito Authentication
const poolData = {
    UserPoolId: CONFIG.cognito.userPoolId,
    ClientId: CONFIG.cognito.clientId
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
let currentUser = null;
let cognitoUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
            if (err || !session.isValid()) {
                showWelcome();
                return;
            }
            
            cognitoUser.getUserAttributes((err, attributes) => {
                if (!err && attributes) {
                    const emailAttr = attributes.find(attr => attr.Name === 'email');
                    if (emailAttr) {
                        currentUser = { email: emailAttr.Value };
                        showDashboard();
                        loadRecommendations();
                    }
                }
            });
        });
    } else {
        showWelcome();
    }
}

function showWelcome() {
    document.getElementById('welcomeSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('signupBtn').style.display = 'inline-block';
    document.getElementById('userInfo').style.display = 'none';
    const prefsBtn = document.getElementById('preferencesBtn');
    const favsBtn = document.getElementById('favoritesBtn');
    const headerSearch = document.getElementById('headerSearch');
    if (prefsBtn) prefsBtn.style.display = 'none';
    if (favsBtn) favsBtn.style.display = 'none';
    if (headerSearch) headerSearch.style.display = 'none';
}

function showDashboard() {
    document.getElementById('welcomeSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('signupBtn').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    const prefsBtn = document.getElementById('preferencesBtn');
    const favsBtn = document.getElementById('favoritesBtn');
    const headerSearch = document.getElementById('headerSearch');
    if (prefsBtn) prefsBtn.style.display = 'inline-flex';
    if (favsBtn) favsBtn.style.display = 'inline-flex';
    if (headerSearch) headerSearch.style.display = 'flex';
    
    if (currentUser && currentUser.email) {
        document.getElementById('userEmail').textContent = currentUser.email;
    }
}

function showAuthModal(mode) {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('authTitle').textContent = mode === 'signup' ? 'Sign Up' : 'Sign In';
    document.getElementById('authMode').value = mode;
    
    document.getElementById('verificationSection').style.display = 'none';
    document.getElementById('forgotPasswordSection').style.display = 'none';
    document.getElementById('resetPasswordSection').style.display = 'none';
    document.getElementById('authFormElement').style.display = 'block';
    
    // Show/hide forgot password button
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    if (forgotBtn) {
        forgotBtn.style.display = mode === 'signin' ? 'inline-block' : 'none';
    }
    
    if (mode === 'signup') {
        document.querySelector('.switch-signin').style.display = 'none';
        document.querySelector('.switch-signup').style.display = 'inline';
    } else {
        document.querySelector('.switch-signin').style.display = 'inline';
        document.querySelector('.switch-signup').style.display = 'none';
    }
    
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('verificationCode').value = '';
    document.getElementById('authMessage').innerHTML = '';
}

function showSignIn() {
    showAuthModal('signin');
}

function showForgotPassword() {
    document.getElementById('authFormElement').style.display = 'none';
    document.getElementById('verificationSection').style.display = 'none';
    document.getElementById('resetPasswordSection').style.display = 'none';
    document.getElementById('forgotPasswordSection').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Reset Password';
    document.getElementById('authMessage').innerHTML = '';
    document.getElementById('forgotPasswordEmail').value = document.getElementById('emailInput').value || '';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Real Sign Up with Cognito
async function handleSignUp(email, password) {
    return new Promise((resolve, reject) => {
        if (!email.endsWith('@esade.edu') && !email.endsWith('@alumni.esade.edu')) {
            document.getElementById('authMessage').innerHTML = 
                '<div class="error-message">❌ Please use an ESADE email address (@esade.edu or @alumni.esade.edu)</div>';
            return;
        }

        const attributeList = [
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'email',
                Value: email
            })
        ];

        userPool.signUp(email, password, attributeList, null, (err, result) => {
            if (err) {
                console.error('Sign up error:', err);
                document.getElementById('authMessage').innerHTML = 
                    `<div class="error-message">❌ ${err.message}</div>`;
                reject(err);
                return;
            }

            cognitoUser = result.user;
            console.log('Sign up successful, user:', cognitoUser);
            console.log('Code delivery details:', result.codeDeliveryDetails);
            
            // Check if code was delivered
            if (result.codeDeliveryDetails) {
                console.log('Code delivery method:', result.codeDeliveryDetails.DeliveryMedium);
                console.log('Code delivery destination:', result.codeDeliveryDetails.Destination);
            } else {
                console.warn('No code delivery details - code might not have been sent');
            }
            
            let message = '<div class="success-message">✅ Account created! ';
            if (result.codeDeliveryDetails && result.codeDeliveryDetails.DeliveryMedium === 'EMAIL') {
                message += 'A verification code has been sent to your email. Please check your inbox (and spam folder).</div>';
            } else {
                message += 'If you don\'t receive a verification code, click "Resend Code" below.</div>';
            }
            document.getElementById('authMessage').innerHTML = message;
            
            document.getElementById('verifyEmail').textContent = email;
            document.getElementById('authFormElement').style.display = 'none';
            document.getElementById('verificationSection').style.display = 'block';
            
            // Auto-trigger code resend if code wasn't delivered
            if (!result.codeDeliveryDetails || result.codeDeliveryDetails.DeliveryMedium !== 'EMAIL') {
                console.log('Code not delivered via email, attempting to resend...');
                setTimeout(() => {
                    resendVerificationCode();
                }, 1000);
            }
            
            resolve(result);
        });
    });
}

// Real Email Verification
async function handleVerifyEmail(code) {
    return new Promise((resolve, reject) => {
        if (!cognitoUser) {
            document.getElementById('authMessage').innerHTML = 
                '<div class="error-message">❌ No user to verify. Please sign up first.</div>';
            return;
        }

        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                document.getElementById('authMessage').innerHTML = 
                    `<div class="error-message">❌ ${err.message}</div>`;
                reject(err);
                return;
            }

            document.getElementById('authMessage').innerHTML = 
                '<div class="success-message">✅ Email verified successfully! Please sign in.</div>';
            
            setTimeout(() => {
                showAuthModal('signin');
            }, 2000);
            
            resolve(result);
        });
    });
}

// Real Sign In with Cognito
async function handleSignIn(email, password) {
    return new Promise((resolve, reject) => {
        if (!email.endsWith('@esade.edu') && !email.endsWith('@alumni.esade.edu')) {
            document.getElementById('authMessage').innerHTML = 
                '<div class="error-message">❌ Please use an ESADE email address</div>';
            return;
        }

        const authenticationData = {
            Username: email,
            Password: password
        };
        
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        
        const userData = {
            Username: email,
            Pool: userPool
        };
        
        cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                currentUser = { email: email };
                document.getElementById('authMessage').innerHTML = 
                    '<div class="success-message">✅ Signed in successfully!</div>';
                
                setTimeout(() => {
                    showDashboard();
                    loadRecommendations();
                }, 1000);
                
                resolve(result);
            },
            onFailure: (err) => {
                document.getElementById('authMessage').innerHTML = 
                    `<div class="error-message">❌ ${err.message}</div>`;
                reject(err);
            }
        });
    });
}

// Resend Verification Code
async function resendVerificationCode() {
    if (!cognitoUser) {
        document.getElementById('authMessage').innerHTML = 
            '<div class="error-message">❌ No user to resend code to. Please sign up first.</div>';
        return;
    }

    // Clear any previous messages
    document.getElementById('authMessage').innerHTML = 
        '<div class="success-message">⏳ Sending verification code...</div>';

    cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
            console.error('Resend code error:', err);
            let errorMsg = err.message || 'Failed to resend code';
            
            // Handle specific error cases
            if (err.code === 'InvalidParameterException' || err.message.includes('Auto verification')) {
                errorMsg = 'Email verification is configured incorrectly. Please contact support or try signing up again.';
            } else if (err.code === 'LimitExceededException') {
                errorMsg = 'Too many attempts. Please wait a few minutes before trying again.';
            }
            
            document.getElementById('authMessage').innerHTML = 
                `<div class="error-message">❌ ${errorMsg}</div>`;
            return;
        }
        
        document.getElementById('authMessage').innerHTML = 
            '<div class="success-message">✅ Verification code resent! Please check your email (and spam folder).</div>';
    });
}

// Forgot Password
function handleForgotPassword() {
    const email = document.getElementById('forgotPasswordEmail').value.trim();
    
    if (!email) {
        document.getElementById('authMessage').innerHTML = 
            '<div class="error-message">❌ Please enter your email address.</div>';
        return;
    }
    
    if (!email.endsWith('@esade.edu') && !email.endsWith('@alumni.esade.edu')) {
        document.getElementById('authMessage').innerHTML = 
            '<div class="error-message">❌ Please use an ESADE email address.</div>';
        return;
    }
    
    const userData = {
        Username: email,
        Pool: userPool
    };
    
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
    document.getElementById('authMessage').innerHTML = 
        '<div class="success-message">⏳ Sending password reset code...</div>';
    
    cognitoUser.forgotPassword({
        onSuccess: function(data) {
            console.log('Password reset code sent:', data);
            document.getElementById('authMessage').innerHTML = 
                '<div class="success-message">✅ Password reset code sent! Please check your email.</div>';
            
            document.getElementById('resetEmailDisplay').textContent = email;
            document.getElementById('forgotPasswordSection').style.display = 'none';
            document.getElementById('resetPasswordSection').style.display = 'block';
            document.getElementById('authTitle').textContent = 'Reset Password';
        },
        onFailure: function(err) {
            console.error('Forgot password error:', err);
            let errorMsg = err.message || 'Failed to send reset code';
            
            if (err.code === 'UserNotFoundException') {
                errorMsg = 'No account found with this email address.';
            } else if (err.code === 'LimitExceededException') {
                errorMsg = 'Too many attempts. Please wait a few minutes.';
            }
            
            document.getElementById('authMessage').innerHTML = 
                `<div class="error-message">❌ ${errorMsg}</div>`;
        }
    });
}

// Handle Password Reset
function handlePasswordReset() {
    const code = document.getElementById('resetCode').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!code || code.length !== 6) {
        document.getElementById('authMessage').innerHTML = 
            '<div class="error-message">❌ Please enter the 6-digit verification code.</div>';
        return;
    }
    
    if (newPassword.length < 8) {
        document.getElementById('authMessage').innerHTML = 
            '<div class="error-message">❌ Password must be at least 8 characters.</div>';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        document.getElementById('authMessage').innerHTML = 
            '<div class="error-message">❌ Passwords do not match.</div>';
        return;
    }
    
    if (!cognitoUser) {
        document.getElementById('authMessage').innerHTML = 
            '<div class="error-message">❌ Please request a reset code first.</div>';
        return;
    }
    
    document.getElementById('authMessage').innerHTML = 
        '<div class="success-message">⏳ Resetting password...</div>';
    
    cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: function() {
            document.getElementById('authMessage').innerHTML = 
                '<div class="success-message">✅ Password reset successfully! Please sign in with your new password.</div>';
            
            setTimeout(() => {
                showAuthModal('signin');
                document.getElementById('authMessage').innerHTML = 
                    '<div class="success-message">✅ Password reset! Please sign in with your new password.</div>';
            }, 2000);
        },
        onFailure: function(err) {
            console.error('Password reset error:', err);
            let errorMsg = err.message || 'Failed to reset password';
            
            if (err.code === 'CodeMismatchException') {
                errorMsg = 'Invalid verification code. Please check and try again.';
            } else if (err.code === 'ExpiredCodeException') {
                errorMsg = 'Verification code has expired. Please request a new one.';
            } else if (err.code === 'InvalidPasswordException') {
                errorMsg = 'Password does not meet requirements. Must include uppercase, lowercase, number, and special character.';
            }
            
            document.getElementById('authMessage').innerHTML = 
                `<div class="error-message">❌ ${errorMsg}</div>`;
        }
    });
}

// Resend Reset Code
function resendResetCode() {
    const email = document.getElementById('resetEmailDisplay').textContent;
    if (!email) {
        document.getElementById('authMessage').innerHTML = 
            '<div class="error-message">❌ No email found. Please start over.</div>';
        return;
    }
    
    document.getElementById('forgotPasswordEmail').value = email;
    handleForgotPassword();
}

// Real Sign Out
function handleSignOut() {
    if (cognitoUser) {
        cognitoUser.signOut();
    }
    currentUser = null;
    cognitoUser = null;
    showWelcome();
}

// Event Listeners
document.getElementById('loginBtn').addEventListener('click', () => {
    showAuthModal('signin');
});

document.getElementById('signupBtn').addEventListener('click', () => {
    showAuthModal('signup');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    handleSignOut();
});

document.getElementById('closeModal').addEventListener('click', () => {
    closeAuthModal();
});

document.getElementById('switchMode').addEventListener('click', () => {
    const currentMode = document.getElementById('authMode').value;
    showAuthModal(currentMode === 'signin' ? 'signup' : 'signin');
});

document.getElementById('authFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const mode = document.getElementById('authMode').value;
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    try {
        if (mode === 'signup') {
            await handleSignUp(email, password);
        } else {
            await handleSignIn(email, password);
        }
    } catch (error) {
        console.error('Authentication error:', error);
    }
});

document.getElementById('verifyBtn').addEventListener('click', async () => {
    const code = document.getElementById('verificationCode').value;
    try {
        await handleVerifyEmail(code);
    } catch (error) {
        console.error('Verification error:', error);
    }
});

document.getElementById('resendCode').addEventListener('click', async () => {
    await resendVerificationCode();
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('authModal');
    if (e.target === modal) {
        closeAuthModal();
    }
});
