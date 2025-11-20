variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "esade-career"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "allowed_email_domains" {
  description = "Allowed email domains for Cognito sign-up"
  type        = list(string)
  default     = ["esade.edu", "alumni.esade.edu"]
}
