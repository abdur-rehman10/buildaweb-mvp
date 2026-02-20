output "api_repository_name" {
  description = "API ECR repository name."
  value       = aws_ecr_repository.this["api"].name
}

output "api_repository_arn" {
  description = "API ECR repository ARN."
  value       = aws_ecr_repository.this["api"].arn
}

output "api_repository_url" {
  description = "API ECR repository URL."
  value       = aws_ecr_repository.this["api"].repository_url
}

output "web_repository_name" {
  description = "WEB ECR repository name."
  value       = aws_ecr_repository.this["web"].name
}

output "web_repository_arn" {
  description = "WEB ECR repository ARN."
  value       = aws_ecr_repository.this["web"].arn
}

output "web_repository_url" {
  description = "WEB ECR repository URL."
  value       = aws_ecr_repository.this["web"].repository_url
}
