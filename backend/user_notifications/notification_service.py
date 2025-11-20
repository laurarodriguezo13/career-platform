import json
import boto3
import os
from datetime import datetime, timedelta

ses = boto3.client('ses', region_name='eu-west-1')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@esade-career-platform.com')

def send_email(to_email, subject, body_html, body_text):
    """Generic email sending function"""
    try:
        response = ses.send_email(
            Source=FROM_EMAIL,
            Destination={'ToAddresses': [to_email]},
            Message={
                'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                'Body': {
                    'Text': {'Data': body_text, 'Charset': 'UTF-8'},
                    'Html': {'Data': body_html, 'Charset': 'UTF-8'}
                }
            }
        )
        print(f"Email sent to {to_email}: {response['MessageId']}")
        return response
    except Exception as e:
        print(f"Error sending email to {to_email}: {str(e)}")
        return None

def send_welcome_email(user_email, user_name=None):
    """Send welcome email to new user"""
    subject = "Welcome to ESADE Career Platform! 🎓"
    
    if not user_name:
        user_name = user_email.split('@')[0].replace('.', ' ').title()
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to ESADE Career Platform! 🎓</h1>
            </div>
            <div class="content">
                <p>Hi {user_name},</p>
                <p>Thank you for joining the ESADE Career Intelligence Platform! We're excited to help you discover amazing job opportunities across Europe.</p>
                
                <h3>What you can do:</h3>
                <ul>
                    <li>🔍 Browse 72+ real job postings from 6 European cities</li>
                    <li>📍 Filter jobs by location (Barcelona, Madrid, London, Paris, Berlin, Amsterdam)</li>
                    <li>💼 Get personalized recommendations based on your skills</li>
                    <li>📊 Track skill trends in the job market</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="https://d3c9hkwje42pil.cloudfront.net" class="button">Start Exploring Jobs</a>
                </p>
                
                <p>If you have any questions, feel free to reach out to our support team.</p>
                
                <p>Best regards,<br>The ESADE Career Platform Team</p>
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
    Welcome to ESADE Career Platform!
    
    Hi {user_name},
    
    Thank you for joining the ESADE Career Intelligence Platform! We're excited to help you discover amazing job opportunities across Europe.
    
    What you can do:
    - Browse 72+ real job postings from 6 European cities
    - Filter jobs by location (Barcelona, Madrid, London, Paris, Berlin, Amsterdam)
    - Get personalized recommendations based on your skills
    - Track skill trends in the job market
    
    Start exploring: https://d3c9hkwje42pil.cloudfront.net
    
    Best regards,
    The ESADE Career Platform Team
    """
    
    return send_email(user_email, subject, body_html, body_text)

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
    
    return send_email(user_email, subject, body_html, body_text)

def send_password_reset_email(user_email, reset_code, reset_url=None):
    """Send password reset email"""
    subject = "🔐 Password Reset Request - ESADE Career Platform"
    
    if not reset_url:
        reset_url = f"https://d3c9hkwje42pil.cloudfront.net?reset={reset_code}"
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .code-box {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px dashed #667eea; text-align: center; font-size: 24px; font-weight: bold; color: #667eea; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .warning {{ background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hi there,</p>
                <p>We received a request to reset your password for your ESADE Career Platform account.</p>
                
                <p>Your verification code is:</p>
                <div class="code-box">{reset_code}</div>
                
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </p>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </div>
                
                <p>This code will expire in 1 hour for security reasons.</p>
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
    Password Reset Request
    
    Hi there,
    
    We received a request to reset your password for your ESADE Career Platform account.
    
    Your verification code is: {reset_code}
    
    Reset your password: {reset_url}
    
    ⚠️ Security Notice: If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
    
    This code will expire in 1 hour for security reasons.
    """
    
    return send_email(user_email, subject, body_html, body_text)

def send_weekly_digest_email(user_email, user_name, top_jobs, skill_trends=None):
    """Send weekly job digest email"""
    subject = "📊 Your Weekly Job Digest - ESADE Career Platform"
    
    if not user_name:
        user_name = user_email.split('@')[0].replace('.', ' ').title()
    
    jobs_html = ""
    for i, job in enumerate(top_jobs[:5], 1):
        jobs_html += f"""
        <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 10px 0;">{i}. {job.get('title', 'Job Opportunity')}</h3>
            <p style="margin: 5px 0;"><strong>Company:</strong> {job.get('company', 'N/A')}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> {job.get('location', 'N/A')}</p>
            <p style="margin: 5px 0;"><strong>Match Score:</strong> <span style="color: #4CAF50; font-weight: bold;">{job.get('matchScore', 0)}%</span></p>
        </div>
        """
    
    trends_html = ""
    if skill_trends:
        trends_html = """
        <h3>🔥 Trending Skills This Week</h3>
        <ul>
        """
        for skill, count in skill_trends[:5]:
            trends_html += f"<li><strong>{skill}</strong> - {count} job postings</li>"
        trends_html += "</ul>"
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Your Weekly Job Digest</h1>
            </div>
            <div class="content">
                <p>Hi {user_name},</p>
                <p>Here are your top job recommendations for this week!</p>
                
                <h3>💼 Top Job Matches</h3>
                {jobs_html}
                
                {trends_html}
                
                <p style="text-align: center;">
                    <a href="https://d3c9hkwje42pil.cloudfront.net" class="button">View All Jobs</a>
                </p>
                
                <p>Keep exploring and good luck with your job search!</p>
                
                <p>Best regards,<br>The ESADE Career Platform Team</p>
            </div>
            <div class="footer">
                <p>ESADE Career Intelligence Platform | Powered by AWS</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    jobs_text = "\n".join([f"{i}. {job.get('title', 'Job')} at {job.get('company', 'Company')} ({job.get('matchScore', 0)}% match)" 
                           for i, job in enumerate(top_jobs[:5], 1)])
    
    body_text = f"""
    Your Weekly Job Digest
    
    Hi {user_name},
    
    Here are your top job recommendations for this week!
    
    Top Job Matches:
    {jobs_text}
    
    View all jobs: https://d3c9hkwje42pil.cloudfront.net
    
    Keep exploring and good luck with your job search!
    
    Best regards,
    The ESADE Career Platform Team
    """
    
    return send_email(user_email, subject, body_html, body_text)

