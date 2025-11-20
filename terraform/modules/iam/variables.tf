variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "dynamodb_tables" {
  type    = map(string)
  default = {}
}
