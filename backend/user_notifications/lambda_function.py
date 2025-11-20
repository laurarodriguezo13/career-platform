import json
import boto3
import os
from notification_service import (
    send_welcome_email,
    send_job_match_email,
    send_password_reset_email,
    send_weekly_digest_email
)

def lambda_handler(event, context):
    """
    Multi-purpose notification Lambda
    Handles:
    1. Cognito Post-Confirmation (welcome emails)
    2. Job match notifications
    3. Password reset requests
    4. Weekly digest emails
    """
    print(f"Notification event: {json.dumps(event)}")
    
    try:
        # Determine notification type from event
        notification_type = event.get('notification_type') or event.get('triggerSource', '')
        
        # Cognito Post-Confirmation trigger
        if 'PostConfirmation' in notification_type or 'PostConfirmation' in str(event):
            user_attributes = event.get('request', {}).get('userAttributes', {})
            user_email = user_attributes.get('email', '')
            
            if user_email:
                send_welcome_email(user_email)
            return event
        
        # Job match notification
        elif notification_type == 'job_match' or 'job_match' in event:
            send_job_match_email(
                user_email=event.get('user_email'),
                job_title=event.get('job_title', 'Job Opportunity'),
                company=event.get('company', 'Company'),
                location=event.get('location', 'Location'),
                match_score=event.get('match_score', 0),
                job_url=event.get('job_url')
            )
            return {'statusCode': 200, 'body': json.dumps({'message': 'Job match notification sent'})}
        
        # Password reset
        elif notification_type == 'password_reset' or 'password_reset' in event:
            send_password_reset_email(
                user_email=event.get('user_email'),
                reset_code=event.get('reset_code'),
                reset_url=event.get('reset_url')
            )
            return {'statusCode': 200, 'body': json.dumps({'message': 'Password reset email sent'})}
        
        # Weekly digest
        elif notification_type == 'weekly_digest' or 'weekly_digest' in event:
            send_weekly_digest_email(
                user_email=event.get('user_email'),
                user_name=event.get('user_name'),
                top_jobs=event.get('top_jobs', []),
                skill_trends=event.get('skill_trends')
            )
            return {'statusCode': 200, 'body': json.dumps({'message': 'Weekly digest sent'})}
        
        # Default: try Cognito format
        else:
            user_attributes = event.get('request', {}).get('userAttributes', {})
            user_email = user_attributes.get('email', '')
            if user_email:
                send_welcome_email(user_email)
            return event
        
    except Exception as e:
        print(f"Error in notification handler: {str(e)}")
        # Don't fail the operation if notification fails
        return event if 'request' in event else {'statusCode': 500, 'body': json.dumps({'error': str(e)})}

