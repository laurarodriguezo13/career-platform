import json
import os

def lambda_handler(event, context):
    """Cognito Pre-Signup Lambda Trigger"""
    ALLOWED_DOMAINS = ['esade.edu', 'alumni.esade.edu']
    user_email = event['request']['userAttributes'].get('email', '')
    print(f"Pre-signup validation for email: {user_email}")
    
    email_domain = user_email.split('@')[-1].lower() if '@' in user_email else ''
    
    if email_domain not in ALLOWED_DOMAINS:
        print(f"Email domain {email_domain} not allowed")
        raise Exception(f"Registration is restricted to ESADE email addresses (@esade.edu or @alumni.esade.edu)")
    
    print(f"Email domain {email_domain} validated successfully")
    
    # TEMPORARY FIX FOR DEMO: Auto-verify ESADE emails to bypass SES sandbox mode
    # TODO: Remove this once SES production access is approved
    AUTO_VERIFY_ENABLED = os.environ.get('AUTO_VERIFY_ENABLED', 'true').lower() == 'true'
    
    if AUTO_VERIFY_ENABLED:
        print(f"Auto-verifying email for {user_email} (demo mode)")
        event['response']['autoConfirmUser'] = True
        event['response']['autoVerifyEmail'] = True
    else:
        print(f"Email verification required for {user_email}")
        event['response']['autoConfirmUser'] = False
        event['response']['autoVerifyEmail'] = False
    
    return event
