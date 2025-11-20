import json
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
comprehend = boto3.client('comprehend')
JOBS_TABLE = os.environ.get('JOBS_TABLE')

def lambda_handler(event, context):
    print(f"Starting NLP enrichment at {datetime.utcnow().isoformat()}")
    jobs_table = dynamodb.Table(JOBS_TABLE)
    
    response = jobs_table.scan(Limit=10)
    jobs = response.get('Items', [])
    
    for job in jobs:
        description = job.get('description', '')
        if len(description) > 10:
            try:
                key_phrases = comprehend.detect_key_phrases(
                    Text=description[:5000],
                    LanguageCode='en'
                )
                detected = [kp['Text'] for kp in key_phrases['KeyPhrases']]
                all_skills = list(set(job.get('skills', []) + detected[:10]))
                
                jobs_table.update_item(
                    Key={'jobId': job['jobId']},
                    UpdateExpression='SET skills = :skills',
                    ExpressionAttributeValues={':skills': all_skills}
                )
            except Exception as e:
                print(f"Error: {e}")
    
    return {'statusCode': 200, 'body': json.dumps({'message': 'Enrichment complete'})}
