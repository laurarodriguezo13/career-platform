terraform {
  backend "s3" {
    bucket         = "esade-career-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "esade-career-terraform-locks"
    encrypt        = true
  }
}
