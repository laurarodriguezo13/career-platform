resource "aws_dynamodb_table" "jobs_live" {
  name           = "${var.project_name}-${var.environment}-jobs-live"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "jobId"

  attribute {
    name = "jobId"
    type = "S"
  }

  attribute {
    name = "industry"
    type = "S"
  }

  attribute {
    name = "location"
    type = "S"
  }

  global_secondary_index {
    name            = "IndustryIndex"
    hash_key        = "industry"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "LocationIndex"
    hash_key        = "location"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expirationTime"
    enabled        = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-jobs-live"
  }
}

resource "aws_dynamodb_table" "skill_trends" {
  name           = "${var.project_name}-${var.environment}-skill-trends"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "skillName"

  attribute {
    name = "skillName"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-skill-trends"
  }
}

resource "aws_dynamodb_table" "user_profiles" {
  name           = "${var.project_name}-${var.environment}-user-profiles"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-user-profiles"
  }
}

resource "aws_dynamodb_table" "recommendations" {
  name           = "${var.project_name}-${var.environment}-recommendations"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "jobId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "jobId"
    type = "S"
  }

  attribute {
    name = "matchScore"
    type = "N"
  }

  global_secondary_index {
    name            = "MatchScoreIndex"
    hash_key        = "userId"
    range_key       = "matchScore"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expirationTime"
    enabled        = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-recommendations"
  }
}
