namespace Aethera.Server.Middleware
{
    public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unhandled exception occurred while processing request {Method} {Path}", context.Request.Method, context.Request.Path);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            ErrorResponse result = exception switch
            {
                UnauthorizedAccessException => new ErrorResponse
                {
                    StatusCode = StatusCodes.Status401Unauthorized,
                    Message = "Unauthorized",
                    Errors = "Authentication is required for this operation."
                },
                System.Security.SecurityException secEx => new ErrorResponse
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    Message = "Forbidden",
                    Errors = secEx.Message
                },
                FluentValidation.ValidationException valEx => new ErrorResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Validation Error",
                    Errors = valEx.Errors.Select(e => new { e.PropertyName, e.ErrorMessage })
                },
                System.Text.Json.JsonException jsonEx => new ErrorResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Invalid JSON format",
                    Errors = jsonEx.Message
                },
                KeyNotFoundException => new ErrorResponse
                {
                    StatusCode = StatusCodes.Status404NotFound,
                    Message = "Resource Not Found",
                    Errors = "The requested resource could not be found."
                },
                ArgumentNullException => new ErrorResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Invalid Request Data",
                    Errors = "Request body is missing or invalid."
                },
                _ => new ErrorResponse
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Message = "Internal Server Error. Please try again later.",
                    Errors = null
                }
            };
            context.Response.StatusCode = result.StatusCode;
            return context.Response.WriteAsJsonAsync(result);
        }
    }

    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Errors { get; set; }
    }
}
