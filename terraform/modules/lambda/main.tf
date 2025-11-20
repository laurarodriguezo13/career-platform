data "archive_file" "job_ingestion" {
  type        = "zip"
  source_dir  = "${path.root}/../../../backend/job_ingestion"
  output_path = "${path.module}/job_ingestion.zip"
}

data "archive_file" "nlp_enrichment" {
  type        = "zip"
  source_dir  = "${path.root}/../../../backend/nlp_enrichment"
  output_path = "${path.module}/nlp_enrichment.zip"
}

data "archive_file" "recommendations" {
  type        = "zip"
  source_dir  = "${path.root}/../../../backend/recommendations"
  output_path = "${path.module}/recommendations.zip"
}

data "archive_file" "cognito_trigger" {
  type        = "zip"
  source_dir  = "${path.root}/../../../backend/cognito_trigger"
  output_path = "${path.module}/cognito_trigger.zip"
}

resource "aws_lambda_function" "job_ingestion" {
  filename         = data.archive_file.job_ingestion.output_path
  function_name    = "${var.project_name}-${var.environment}-job-ingestion"
  role            = var.job_ingestion_role_arn
  handler         = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.job_ingestion.output_base64sha256
  runtime         = "python3.11"
  timeout         = 300
  memory_size     = 512

  environment {
    variables = {
      JOBS_TABLE         = var.jobs_table_name
      SKILL_TRENDS_TABLE = var.skill_trends_table_name
    }
  }
}

resource "aws_lambda_function" "nlp_enrichment" {
  filename         = data.archive_file.nlp_enrichment.output_path
  function_name    = "${var.project_name}-${var.environment}-nlp-enrichment"
  role            = var.nlp_enrichment_role_arn
  handler         = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.nlp_enrichment.output_base64sha256
  runtime         = "python3.11"
  timeout         = 300
  memory_size     = 512

  environment {
    variables = {
      JOBS_TABLE         = var.jobs_table_name
      SKILL_TRENDS_TABLE = var.skill_trends_table_name
    }
  }
}

resource "aws_lambda_function" "recommendations" {
  filename         = data.archive_file.recommendations.output_path
  function_name    = "${var.project_name}-${var.environment}-recommendations"
  role            = var.recommendations_role_arn
  handler         = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.recommendations.output_base64sha256
  runtime         = "python3.11"
  timeout         = 300
  memory_size     = 1024

  environment {
    variables = {
      JOBS_TABLE              = var.jobs_table_name
      USER_PROFILES_TABLE     = var.user_profiles_table_name
      RECOMMENDATIONS_TABLE   = var.recommendations_table_name
    }
  }
}

resource "aws_lambda_function" "cognito_trigger" {
  filename         = data.archive_file.cognito_trigger.output_path
  function_name    = "${var.project_name}-${var.environment}-cognito-trigger"
  role            = var.cognito_trigger_role_arn
  handler         = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.cognito_trigger.output_base64sha256
  runtime         = "python3.11"
  timeout         = 10
  memory_size     = 128
}
