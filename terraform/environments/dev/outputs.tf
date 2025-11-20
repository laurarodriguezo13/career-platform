output "dynamodb_tables" {
  value = {
    jobs_live       = module.dynamodb.jobs_live_table_name
    skill_trends    = module.dynamodb.skill_trends_table_name
    user_profiles   = module.dynamodb.user_profiles_table_name
    recommendations = module.dynamodb.recommendations_table_name
  }
}

output "s3_website_endpoint" {
  value = module.s3.website_endpoint
}

output "s3_bucket_name" {
  value = module.s3.bucket_name
}

output "lambda_functions" {
  value = {
    job_ingestion    = module.lambda.job_ingestion_function_name
    nlp_enrichment   = module.lambda.nlp_enrichment_function_name
    recommendations  = module.lambda.recommendations_function_name
    cognito_trigger  = module.lambda.cognito_trigger_function_name
  }
}

output "cognito_user_pool_id" {
  value = module.cognito.user_pool_id
}

output "cognito_client_id" {
  value = module.cognito.user_pool_client_id
}

output "cognito_domain" {
  value = module.cognito.user_pool_domain
}

output "cloudfront_url" {
  description = "CloudFront HTTPS URL"
  value       = "https://${module.cloudfront.cloudfront_domain_name}"
}

output "cloudfront_domain" {
  description = "CloudFront domain name"
  value       = module.cloudfront.cloudfront_domain_name
}
