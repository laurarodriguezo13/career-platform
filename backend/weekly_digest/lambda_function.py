import json
import boto3
import os
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
lambda_client = boto3.client('lambda', region_name='eu-west-1')
JOBS_TABLE = os.environ.get('JOBS_TABLE', 'esade-career-dev-jobs-live')
USER_PROFILES_TABLE = os.environ.get('USER_PROFILES_TABLE', 'esade-career-dev-user-profiles')
NOTIFICATION_LAMBDA = os.environ.get('NOTIFICATION_LAMBDA', 'esade-career-dev-user-notifications')

def lambda_handler(event, context):
    """Weekly digest - send top job recommendations to all active users"""
    print(f"Weekly digest event: {json.dumps(event)}")
    
    try:
        jobs_table = dynamodb.Table(JOBS_TABLE)
        user_profiles_table = dynamodb.Table(USER_PROFILES_TABLE)
        
        # Get all jobs
        jobs_response = jobs_table.scan()
        all_jobs = jobs_response.get('Items', [])
        
        # Get all user profiles (or use Cognito to get users)
        # For now, we'll get users from user_profiles table
        users_response = user_profiles_table.scan()
        users = users_response.get('Items', [])
        
        # If no users in table, return (in production, fetch from Cognito)
        if not users:
            print("No users found in user_profiles table")
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'No users to send digest to'})
            }
        
        # Calculate skill trends
        skill_counts = {}
        for job in all_jobs:
            for skill in job.get('skills', []):
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
        skill_trends = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Send digest to each user
        sent_count = 0
        for user in users:
            user_email = user.get('email') or user.get('userId')
            if not user_email or '@' not in str(user_email):
                continue
            
            user_skills = user.get('skills', [])
            
            # Calculate match scores for this user
            scored_jobs = []
            for job in all_jobs:
                if user_skills:
                    matching = sum(1 for s in user_skills if s.lower() in str(job.get('skills', [])).lower())
                    score = 75 + (matching * 5)
                    job['matchScore'] = min(score, 95)
                else:
                    job['matchScore'] = 75
                scored_jobs.append(job)
            
            # Sort and get top 5
            scored_jobs.sort(key=lambda x: x.get('matchScore', 0), reverse=True)
            top_jobs = scored_jobs[:5]
            
            # Convert Decimal to float
            for job in top_jobs:
                for key, value in job.items():
                    if hasattr(value, '__float__'):
                        try:
                            job[key] = float(value)
                        except:
                            pass
            
            # Send notification
            try:
                lambda_client.invoke(
                    FunctionName=NOTIFICATION_LAMBDA,
                    InvocationType='Event',
                    Payload=json.dumps({
                        'notification_type': 'weekly_digest',
                        'user_email': user_email,
                        'user_name': user.get('name'),
                        'top_jobs': top_jobs,
                        'skill_trends': skill_trends
                    })
                )
                sent_count += 1
                print(f"Weekly digest triggered for {user_email}")
            except Exception as e:
                print(f"Error sending digest to {user_email}: {str(e)}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Weekly digest sent to {sent_count} users',
                'users_notified': sent_count
            })
        }
        
    except Exception as e:
        print(f"Error in weekly digest: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

