output "api_log_group_name" {
  description = "API CloudWatch log group name."
  value       = aws_cloudwatch_log_group.this["api"].name
}

output "api_log_group_arn" {
  description = "API CloudWatch log group ARN."
  value       = aws_cloudwatch_log_group.this["api"].arn
}

output "web_log_group_name" {
  description = "WEB CloudWatch log group name."
  value       = aws_cloudwatch_log_group.this["web"].name
}

output "web_log_group_arn" {
  description = "WEB CloudWatch log group ARN."
  value       = aws_cloudwatch_log_group.this["web"].arn
}
