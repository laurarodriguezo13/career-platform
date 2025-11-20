import json
import boto3
import os
from datetime import datetime, timedelta
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
lambda_client = boto3.client('lambda', region_name='eu-west-1')
JOBS_TABLE = os.environ.get('JOBS_TABLE')
USER_PROFILES_TABLE = os.environ.get('USER_PROFILES_TABLE')
RECOMMENDATIONS_TABLE = os.environ.get('RECOMMENDATIONS_TABLE')
NOTIFICATION_LAMBDA = os.environ.get('NOTIFICATION_LAMBDA', 'esade-career-dev-user-notifications')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def calculate_match_score(job, user_skills):
    """Calculate match score based on skills"""
    base_score = 75
    job_skills = [s.lower() for s in job.get('skills', [])]
    user_skills_lower = [s.lower() for s in user_skills]
    
    matching_skills = sum(1 for skill in user_skills_lower if any(js in skill or skill in js for js in job_skills))
    score = base_score + (matching_skills * 5)
    return min(score, 95)  # Cap at 95%

def lambda_handler(event, context):
    """Get job recommendations and send notifications for high matches"""
    print(f"Recommendations event: {json.dumps(event)}")
    
    # Handle API Gateway event
    query_params = event.get('queryStringParameters') or {}
    user_email = query_params.get('user_email')  # Optional: for notifications
    location = query_params.get('location', '').lower()
    skills_str = query_params.get('skills', '')
    user_skills = [s.strip() for s in skills_str.split(',') if s.strip()] if skills_str else []
    
    try:
        jobs_table = dynamodb.Table(JOBS_TABLE)
        
        # Scan jobs (or use GSI for location filtering)
        response = jobs_table.scan()
        jobs = response.get('Items', [])
        
        # Filter by location if provided
        if location:
            jobs = [j for j in jobs if location in j.get('location', '').lower()]
        
        # Calculate match scores
        for job in jobs:
            if user_skills:
                job['matchScore'] = calculate_match_score(job, user_skills)
            else:
                job['matchScore'] = 75  # Default score
        
        # Sort by match score
        jobs.sort(key=lambda x: x.get('matchScore', 0), reverse=True)
        
        # Convert Decimal to float for JSON
        for job in jobs:
            for key, value in job.items():
                if isinstance(value, Decimal):
                    job[key] = float(value)
        
        # Send notification for top match if user_email provided
        if user_email and jobs and jobs[0].get('matchScore', 0) >= 80:
            top_job = jobs[0]
            try:
                lambda_client.invoke(
                    FunctionName=NOTIFICATION_LAMBDA,
                    InvocationType='Event',  # Async
                    Payload=json.dumps({
                        'notification_type': 'job_match',
                        'user_email': user_email,
                        'job_title': top_job.get('title', 'Job Opportunity'),
                        'company': top_job.get('company', 'Company'),
                        'location': top_job.get('location', 'Location'),
                        'match_score': int(top_job.get('matchScore', 0)),
                        'job_url': top_job.get('url', 'https://d3c9hkwje42pil.cloudfront.net')
                    })
                )
                print(f"Job match notification triggered for {user_email}")
            except Exception as e:
                print(f"Error triggering notification: {str(e)}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'jobs': jobs[:20],  # Return top 20
                'count': len(jobs)
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error in recommendations: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': str(e)})
        }
