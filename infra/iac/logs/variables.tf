variable "aws_region" {
  description = "AWS region for provider operations."
  type        = string
  default     = "us-east-1"
}

variable "api_log_group_name" {
  description = "CloudWatch log group name for API ECS task logs."
  type        = string
  default     = "/ecs/buildaweb-api"
}

variable "web_log_group_name" {
  description = "CloudWatch log group name for WEB ECS task logs."
  type        = string
  default     = "/ecs/buildaweb-web"
}

variable "retention_in_days" {
  description = "Retention period in days for all created log groups."
  type        = number
  default     = 30

  validation {
    condition = contains(
      [1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653],
      var.retention_in_days
    )
    error_message = "retention_in_days must be an AWS-supported value."
  }
}

variable "kms_key_id" {
  description = "Optional KMS key ARN for log group encryption."
  type        = string
  default     = null
}

variable "tags" {
  description = "Common tags applied to all created resources."
  type        = map(string)
  default     = {}
}
