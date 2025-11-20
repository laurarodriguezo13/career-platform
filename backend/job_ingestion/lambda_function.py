import json
import boto3
import os
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
secretsmanager = boto3.client('secretsmanager')
JOBS_TABLE = os.environ.get('JOBS_TABLE')

def lambda_handler(event, context):
    print(f"Starting job ingestion at {datetime.utcnow().isoformat()}")
    
    # Get Adzuna API credentials from Secrets Manager
    try:
        secret_response = secretsmanager.get_secret_value(
            SecretId='esade-career-dev-adzuna-api'
        )
        credentials = json.loads(secret_response['SecretString'])
        app_id = credentials['app_id']
        app_key = credentials['app_key']
    except Exception as e:
        print(f"Error getting credentials: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
    
    jobs_table = dynamodb.Table(JOBS_TABLE)
    
    # Fetch jobs from Adzuna API for Spain
    search_terms = ['data scientist', 'consultant', 'analyst', 'product manager']
    all_jobs = []
    
    for term in search_terms:
        try:
            url = "https://api.adzuna.com/v1/api/jobs/es/search/1"
            params = {
                'app_id': app_id,
                'app_key': app_key,
                'results_per_page': 5,
                'what': term,
                'where': 'barcelona',
                'sort_by': 'date'
            }
            
            query_string = urllib.parse.urlencode(params)
            full_url = f"{url}?{query_string}"
            
            with urllib.request.urlopen(full_url) as response:
                data = json.loads(response.read().decode())
                
                for job in data.get('results', []):
                    normalized_job = {
                        'jobId': f"adzuna-{job['id']}",
                        'title': job.get('title', 'Unknown'),
                        'company': job.get('company', {}).get('display_name', 'Unknown'),
                        'description': job.get('description', '')[:500],
                        'location': job.get('location', {}).get('display_name', 'Spain'),
                        'industry': categorize_industry(job.get('category', {}).get('label', '')),
                        'salary': format_salary(job.get('salary_min'), job.get('salary_max')),
                        'workModel': 'Hybrid',
                        'experienceLevel': 'Mid-Senior',
                        'url': job.get('redirect_url', ''),
                        'postedDate': job.get('created', datetime.utcnow().isoformat()),
                        'skills': extract_skills(job.get('description', '')),
                        'expirationTime': int((datetime.utcnow() + timedelta(days=30)).timestamp())
                    }
                    all_jobs.append(normalized_job)
                    
        except Exception as e:
            print(f"Error fetching jobs for '{term}': {e}")
            continue
    
    # Store jobs in DynamoDB
    ingested_count = 0
    for job in all_jobs[:20]:
        try:
            jobs_table.put_item(Item=job)
            ingested_count += 1
            print(f"Ingested: {job['title']}")
        except Exception as e:
            print(f"Error storing job: {e}")
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Ingested {ingested_count} jobs from Adzuna',
            'timestamp': datetime.utcnow().isoformat()
        })
    }

def categorize_industry(category):
    category_lower = category.lower()
    if 'it' in category_lower or 'tech' in category_lower:
        return 'Technology'
    elif 'consult' in category_lower:
        return 'Consulting'
    elif 'financ' in category_lower:
        return 'Finance'
    return 'Other'

def format_salary(min_sal, max_sal):
    if min_sal and max_sal:
        return f"{int(min_sal)}-{int(max_sal)}"
    elif min_sal:
        return f"{int(min_sal)}+"
    return "Negotiable"

def extract_skills(description):
    skills = ['Python', 'Java', 'SQL', 'Excel', 'Machine Learning', 
              'Data Analysis', 'Agile', 'Communication']
    desc_lower = description.lower()
    return [s for s in skills if s.lower() in desc_lower][:5]
