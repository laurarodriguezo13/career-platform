variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "jobs_table_name" {
  type = string
}

variable "skill_trends_table_name" {
  type = string
}

variable "user_profiles_table_name" {
  type = string
}

variable "recommendations_table_name" {
  type = string
}

variable "job_ingestion_role_arn" {
  type = string
}

variable "nlp_enrichment_role_arn" {
  type = string
}

variable "recommendations_role_arn" {
  type = string
}

variable "cognito_trigger_role_arn" {
  type = string
}
