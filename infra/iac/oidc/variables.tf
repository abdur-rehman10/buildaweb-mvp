variable "aws_region" {
  description = "AWS region for provider operations."
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS account ID used to compose least-privilege ARNs."
  type        = string

  validation {
    condition     = can(regex("^[0-9]{12}$", var.aws_account_id))
    error_message = "aws_account_id must be a 12-digit AWS account ID."
  }
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format (for OIDC trust restriction)."
  type        = string

  validation {
    condition     = can(regex("^[^/]+/[^/]+$", var.github_repository))
    error_message = "github_repository must be in owner/repo format."
  }
}

variable "github_branch" {
  description = "Git branch allowed to assume role via OIDC."
  type        = string
  default     = "main"
}

variable "role_name" {
  description = "IAM role name assumed by GitHub Actions deploy workflow."
  type        = string
  default     = "buildaweb-github-oidc-deploy"
}

variable "create_oidc_provider" {
  description = "Create GitHub OIDC provider if it does not already exist in the account."
  type        = bool
  default     = false
}

variable "github_oidc_thumbprints" {
  description = "Thumbprints for token.actions.githubusercontent.com OIDC provider."
  type        = list(string)
  default     = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

variable "ecr_repository_names" {
  description = "ECR repository names the deploy role can push/pull images to/from."
  type        = list(string)

  validation {
    condition     = length(var.ecr_repository_names) > 0
    error_message = "ecr_repository_names must include at least one repository name."
  }
}

variable "ecs_cluster_name" {
  description = "ECS cluster name that hosts deployable services."
  type        = string
}

variable "ecs_service_names" {
  description = "ECS service names that can be updated by deploy workflow."
  type        = list(string)

  validation {
    condition     = length(var.ecs_service_names) > 0
    error_message = "ecs_service_names must include at least one ECS service."
  }
}

variable "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN allowed for iam:PassRole."
  type        = string

  validation {
    condition     = can(regex("^arn:[^:]+:iam::[0-9]{12}:role/.+$", var.ecs_task_execution_role_arn))
    error_message = "ecs_task_execution_role_arn must be a valid IAM role ARN."
  }
}
