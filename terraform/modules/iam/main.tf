resource "aws_iam_role" "job_ingestion_lambda" {
  name = "${var.project_name}-${var.environment}-job-ingestion"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "job_ingestion_basic" {
  role       = aws_iam_role.job_ingestion_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "job_ingestion_dynamodb" {
  name = "dynamodb-access"
  role = aws_iam_role.job_ingestion_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:*"]
      Resource = values(var.dynamodb_tables)
    }, {
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role" "nlp_enrichment_lambda" {
  name = "${var.project_name}-${var.environment}-nlp-enrichment"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "nlp_enrichment_basic" {
  role       = aws_iam_role.nlp_enrichment_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "nlp_enrichment_permissions" {
  name = "nlp-permissions"
  role = aws_iam_role.nlp_enrichment_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:*"]
      Resource = values(var.dynamodb_tables)
    }, {
      Effect   = "Allow"
      Action   = ["comprehend:*"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role" "recommendations_lambda" {
  name = "${var.project_name}-${var.environment}-recommendations"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "recommendations_basic" {
  role       = aws_iam_role.recommendations_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "recommendations_dynamodb" {
  name = "dynamodb-access"
  role = aws_iam_role.recommendations_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:*"]
      Resource = values(var.dynamodb_tables)
    }]
  })
}

resource "aws_iam_role" "cognito_trigger_lambda" {
  name = "${var.project_name}-${var.environment}-cognito-trigger"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cognito_trigger_basic" {
  role       = aws_iam_role.cognito_trigger_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role" "step_functions" {
  name = "${var.project_name}-${var.environment}-step-functions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "states.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "step_functions_lambda" {
  name = "lambda-invoke"
  role = aws_iam_role.step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["lambda:InvokeFunction"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role" "eventbridge" {
  name = "${var.project_name}-${var.environment}-eventbridge"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "events.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_step_functions" {
  name = "step-functions-start"
  role = aws_iam_role.eventbridge.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["states:StartExecution"]
      Resource = "*"
    }]
  })
}
