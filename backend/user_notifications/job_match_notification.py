import json
import boto3
import os
from datetime import datetime

ses = boto3.client('ses', region_name='eu-west-1')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@esade-career-platform.com')

def send_job_match_email(user_email, job_title, company, location, match_score, job_url=None):
    """Send job match notification email"""
    subject = f"🎯 New Job Match: {job_title} at {company} ({match_score}% match)"
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .match-badge {{ display: inline-block; padding: 8px 16px; background: #4CAF50; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }}
            .job-card {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 New Job Match Found!</h1>
            </div>
            <div class="content">
                <p>We found a great job opportunity that matches your profile!</p>
                
                <div class="job-card">
                    <h2>{job_title}</h2>
                    <p><strong>Company:</strong> {company}</p>
                    <p><strong>Location:</strong> {location}</p>
                    <span class="match-badge">{match_score}% Match</span>
                </div>
                
                <p style="text-align: center;">
                    <a href="{job_url or 'https://d3c9hkwje42pil.cloudfront.net'}" class="button">View Job Details</a>
                </p>
                
                <p>Log in to your ESADE Career Platform to see more matches and apply!</p>
            </div>
            <div class="footer">
                <p>ESADE Career Intelligence Platform | Powered by AWS</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    body_text = f"""
    New Job Match Found!
    
    We found a great job opportunity that matches your profile!
    
    {job_title}
    Company: {company}
    Location: {location}
    Match Score: {match_score}%
    
    View job details: {job_url or 'https://d3c9hkwje42pil.cloudfront.net'}
    
    Log in to your ESADE Career Platform to see more matches and apply!
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
        print(f"Job match email sent to {user_email}: {response['MessageId']}")
        return response
    except Exception as e:
        print(f"Error sending job match email to {user_email}: {str(e)}")
        return None

def lambda_handler(event, context):
    """
    Send job match notification email
    Expected event structure:
    {
        "user_email": "user@example.com",
        "job_title": "Data Scientist",
        "company": "Tech Corp",
        "location": "Barcelona",
        "match_score": 85,
        "job_url": "https://..."
    }
    """
    print(f"Job match notification event: {json.dumps(event)}")
    
    try:
        user_email = event.get('user_email')
        job_title = event.get('job_title', 'Job Opportunity')
        company = event.get('company', 'Company')
        location = event.get('location', 'Location')
        match_score = event.get('match_score', 0)
        job_url = event.get('job_url')
        
        if not user_email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'user_email is required'})
            }
        
        send_job_match_email(user_email, job_title, company, location, match_score, job_url)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Job match notification sent'})
        }
        
    except Exception as e:
        print(f"Error in job match notification: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

