provider "aws" {
  region = var.aws_region
}

locals {
  log_groups = {
    api = var.api_log_group_name
    web = var.web_log_group_name
  }
}

resource "aws_cloudwatch_log_group" "this" {
  for_each = local.log_groups

  name              = each.value
  retention_in_days = var.retention_in_days
  kms_key_id        = var.kms_key_id

  tags = merge(
    var.tags,
    {
      Name      = each.value
      ManagedBy = "terraform"
      Service   = each.key
    }
  )
}
