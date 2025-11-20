output "jobs_live_table_name" {
  value = aws_dynamodb_table.jobs_live.name
}

output "jobs_live_table_arn" {
  value = aws_dynamodb_table.jobs_live.arn
}

output "skill_trends_table_name" {
  value = aws_dynamodb_table.skill_trends.name
}

output "skill_trends_table_arn" {
  value = aws_dynamodb_table.skill_trends.arn
}

output "user_profiles_table_name" {
  value = aws_dynamodb_table.user_profiles.name
}

output "user_profiles_table_arn" {
  value = aws_dynamodb_table.user_profiles.arn
}

output "recommendations_table_name" {
  value = aws_dynamodb_table.recommendations.name
}

output "recommendations_table_arn" {
  value = aws_dynamodb_table.recommendations.arn
}

output "table_arns" {
  value = {
    jobs_live       = aws_dynamodb_table.jobs_live.arn
    skill_trends    = aws_dynamodb_table.skill_trends.arn
    user_profiles   = aws_dynamodb_table.user_profiles.arn
    recommendations = aws_dynamodb_table.recommendations.arn
  }
}
