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
    if (prefsBtn) prefsBtn.style.display = 'none';
    if (favsBtn) favsBtn.style.display = 'none';
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
    if (prefsBtn) prefsBtn.style.display = 'inline-flex';
    if (favsBtn) favsBtn.style.display = 'inline-flex';
    
    if (currentUser && currentUser.email) {
        document.getElementById('userEmail').textContent = currentUser.email;
    }
}

function showAuthModal(mode) {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('authTitle').textContent = mode === 'signup' ? 'Sign Up' : 'Sign In';
    document.getElementById('authMode').value = mode;
    
    document.getElementById('verificationSection').style.display = 'none';
    document.getElementById('authFormElement').style.display = 'block';
    
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
                document.getElementById('authMessage').innerHTML = 
                    `<div class="error-message">❌ ${err.message}</div>`;
                reject(err);
                return;
            }

            cognitoUser = result.user;
            document.getElementById('authMessage').innerHTML = 
                '<div class="success-message">✅ Account created! Check your email for verification code.</div>';
            
            document.getElementById('verifyEmail').textContent = email;
            document.getElementById('authFormElement').style.display = 'none';
            document.getElementById('verificationSection').style.display = 'block';
            
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
            '<div class="error-message">❌ No user to resend code to.</div>';
        return;
    }

    cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
            document.getElementById('authMessage').innerHTML = 
                `<div class="error-message">❌ ${err.message}</div>`;
            return;
        }
        
        document.getElementById('authMessage').innerHTML = 
            '<div class="success-message">✅ Verification code resent! Check your email.</div>';
    });
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
