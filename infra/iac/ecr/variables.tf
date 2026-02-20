variable "aws_region" {
  description = "AWS region for provider operations."
  type        = string
  default     = "us-east-1"
}

variable "api_repository_name" {
  description = "ECR repository name for API image."
  type        = string
  default     = "buildaweb-api"
}

variable "web_repository_name" {
  description = "ECR repository name for WEB image."
  type        = string
  default     = "buildaweb-web"
}

variable "image_tag_mutability" {
  description = "Image tag mutability policy for repositories."
  type        = string
  default     = "MUTABLE"

  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.image_tag_mutability)
    error_message = "image_tag_mutability must be MUTABLE or IMMUTABLE."
  }
}

variable "scan_on_push" {
  description = "Enable image scanning on push."
  type        = bool
  default     = true
}

variable "lifecycle_keep_last_n" {
  description = "Number of most recent images to keep per repository."
  type        = number
  default     = 30

  validation {
    condition     = var.lifecycle_keep_last_n > 0
    error_message = "lifecycle_keep_last_n must be greater than 0."
  }
}

variable "force_delete" {
  description = "Allow repository deletion even when images exist."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags applied to all created resources."
  type        = map(string)
  default     = {}
}
