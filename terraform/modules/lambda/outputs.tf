output "job_ingestion_function_arn" {
  value = aws_lambda_function.job_ingestion.arn
}

output "job_ingestion_function_name" {
  value = aws_lambda_function.job_ingestion.function_name
}

output "nlp_enrichment_function_arn" {
  value = aws_lambda_function.nlp_enrichment.arn
}

output "nlp_enrichment_function_name" {
  value = aws_lambda_function.nlp_enrichment.function_name
}

output "recommendations_function_arn" {
  value = aws_lambda_function.recommendations.arn
}

output "recommendations_function_name" {
  value = aws_lambda_function.recommendations.function_name
}

output "cognito_trigger_function_arn" {
  value = aws_lambda_function.cognito_trigger.arn
}

output "cognito_trigger_function_name" {
  value = aws_lambda_function.cognito_trigger.function_name
}
