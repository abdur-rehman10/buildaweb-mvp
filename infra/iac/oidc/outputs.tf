output "github_actions_role_arn" {
  description = "ARN of IAM role used by GitHub Actions deploy workflow."
  value       = aws_iam_role.github_actions_deploy.arn
}

output "github_actions_role_name" {
  description = "Name of IAM role used by GitHub Actions deploy workflow."
  value       = aws_iam_role.github_actions_deploy.name
}

output "oidc_provider_arn" {
  description = "ARN of GitHub OIDC provider used by IAM role trust policy."
  value       = local.oidc_provider_arn
}
