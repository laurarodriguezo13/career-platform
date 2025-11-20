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
    
    # Fetch jobs from Adzuna API for multiple cities
    search_terms = ['data scientist', 'consultant', 'analyst', 'product manager']
    cities = ['barcelona', 'madrid', 'london', 'paris', 'berlin', 'amsterdam']
    all_jobs = []
    
    for city in cities:
        for term in search_terms:
            try:
                # Use appropriate country code for each city
                country_code = 'es' if city in ['barcelona', 'madrid'] else \
                              'gb' if city == 'london' else \
                              'fr' if city == 'paris' else \
                              'de' if city == 'berlin' else 'nl'
                
                url = f"https://api.adzuna.com/v1/api/jobs/{country_code}/search/1"
                params = {
                    'app_id': app_id,
                    'app_key': app_key,
                    'results_per_page': 3,  # Reduced to get more cities
                    'what': term,
                    'where': city,
                    'sort_by': 'date'
                }
                
                query_string = urllib.parse.urlencode(params)
                full_url = f"{url}?{query_string}"
                
                with urllib.request.urlopen(full_url) as response:
                    data = json.loads(response.read().decode())
                    
                    for job in data.get('results', []):
                        # Normalize location to match our city names
                        location_display = city.capitalize()
                        if city == 'barcelona' or city == 'madrid':
                            location_display = city.capitalize() + ', Spain'
                        elif city == 'london':
                            location_display = 'London, UK'
                        elif city == 'paris':
                            location_display = 'Paris, France'
                        elif city == 'berlin':
                            location_display = 'Berlin, Germany'
                        elif city == 'amsterdam':
                            location_display = 'Amsterdam, Netherlands'
                        
                        normalized_job = {
                            'jobId': f"adzuna-{city}-{job['id']}",
                            'title': job.get('title', 'Unknown'),
                            'company': job.get('company', {}).get('display_name', 'Unknown'),
                            'description': job.get('description', '')[:500],
                            'location': location_display,
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
                print(f"Error fetching jobs for '{term}' in '{city}': {e}")
                continue
    
    # Store jobs in DynamoDB (store all jobs, not just 20)
    ingested_count = 0
    for job in all_jobs:
        try:
            jobs_table.put_item(Item=job)
            ingested_count += 1
            print(f"Ingested: {job['title']} in {job['location']}")
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
