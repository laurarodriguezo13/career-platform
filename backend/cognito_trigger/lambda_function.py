import json

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
    event['response']['autoConfirmUser'] = False
    event['response']['autoVerifyEmail'] = False
    
    return event
