import json
import boto3
import os
import urllib.parse

ses = boto3.client('ses', region_name='eu-west-1')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'laura.rodriguez15@alumni.esade.edu')

def lambda_handler(event, context):
    """
    Custom Cognito Email Sender Lambda
    Sends verification codes via SES instead of Cognito default
    """
    print(f"Email sender event: {json.dumps(event)}")
    
    trigger_source = event.get('triggerSource', '')
    
    # Handle verification code email
    if trigger_source == 'CustomEmailSender_SignUp' or trigger_source == 'CustomEmailSender_ResendCode':
        try:
            # Extract user info
            user_attributes = event.get('request', {}).get('userAttributes', {})
            user_email = user_attributes.get('email', '')
            code_parameter = event.get('request', {}).get('codeParameter', '')
            
            if not user_email:
                print("No email found in user attributes")
                return event
            
            # Get verification code from the event
            verification_code = event.get('request', {}).get('codeParameter', '')
            if not verification_code:
                # Try to extract from codeParameter
                code_parameter = event.get('request', {}).get('codeParameter', '')
                verification_code = code_parameter if code_parameter else 'YOUR_CODE'
            
            # Send verification email via SES
            subject = "ESADE Career Platform - Verification Code"
            body_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #003d82 0%, #0066cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .code-box {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px dashed #003d82; text-align: center; font-size: 32px; font-weight: bold; color: #003d82; letter-spacing: 8px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hi there,</p>
                        <p>Thank you for signing up for the ESADE Career Intelligence Platform!</p>
                        <p>Your verification code is:</p>
                        <div class="code-box">{verification_code}</div>
                        <p>Enter this code in the verification form to complete your registration.</p>
                        <p>This code will expire in 24 hours.</p>
                        <p>If you didn't create this account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>ESADE Career Intelligence Platform | Powered by AWS</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            body_text = f"""
            Email Verification - ESADE Career Platform
            
            Hi there,
            
            Thank you for signing up for the ESADE Career Intelligence Platform!
            
            Your verification code is: {verification_code}
            
            Enter this code in the verification form to complete your registration.
            
            This code will expire in 24 hours.
            
            If you didn't create this account, please ignore this email.
            """
            
            try:
                response = ses.send_email(
                    Source=FROM_EMAIL,
                    Destination={'ToAddresses': [user_email]},
                    Message={
                        'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                        'Body': {
                            'Text': {'Data': body_text, 'Charset': 'UTF-8'},
                            'Html': {'Data': body_html, 'Charset': 'UTF-8'}
                        }
                    }
                )
                print(f"Verification email sent to {user_email}: {response['MessageId']}")
            except Exception as e:
                print(f"Error sending email via SES: {str(e)}")
                # Fall back to Cognito default
                pass
            
        except Exception as e:
            print(f"Error in custom email sender: {str(e)}")
            # Don't fail the signup process
    
    return event

