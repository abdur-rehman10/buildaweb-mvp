provider "aws" {
  region = var.aws_region
}

locals {
  repositories = {
    api = var.api_repository_name
    web = var.web_repository_name
  }
}

resource "aws_ecr_repository" "this" {
  for_each = local.repositories

  name                 = each.value
  image_tag_mutability = var.image_tag_mutability
  force_delete         = var.force_delete

  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(
    var.tags,
    {
      Name      = each.value
      ManagedBy = "terraform"
      Service   = each.key
    }
  )
}

resource "aws_ecr_lifecycle_policy" "this" {
  for_each = aws_ecr_repository.this

  repository = each.value.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire images beyond most recent ${var.lifecycle_keep_last_n}"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.lifecycle_keep_last_n
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
