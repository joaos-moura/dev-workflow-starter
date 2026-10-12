output "bucket_name" {
  description = "Nome do bucket do site."
  value       = aws_s3_bucket.site.bucket
}

output "website_url" {
  description = "URL HTTP do site estático."
  value       = "http://${aws_s3_bucket_website_configuration.site.website_endpoint}"
}

output "api_url" {
  description = "URL HTTPS da API."
  value       = aws_lambda_function_url.api.function_url
}
