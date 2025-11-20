output "job_ingestion_lambda_role_arn" {
  value = aws_iam_role.job_ingestion_lambda.arn
}

output "nlp_enrichment_lambda_role_arn" {
  value = aws_iam_role.nlp_enrichment_lambda.arn
}

output "recommendations_lambda_role_arn" {
  value = aws_iam_role.recommendations_lambda.arn
}

output "cognito_trigger_lambda_role_arn" {
  value = aws_iam_role.cognito_trigger_lambda.arn
}

output "step_functions_role_arn" {
  value = aws_iam_role.step_functions.arn
}

output "eventbridge_role_arn" {
  value = aws_iam_role.eventbridge.arn
}
