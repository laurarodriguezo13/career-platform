variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "allowed_email_domains" {
  type    = list(string)
  default = ["esade.edu", "alumni.esade.edu"]
}

variable "pre_signup_lambda_arn" {
  type        = string
  description = "ARN of the pre-signup Lambda function"
}
