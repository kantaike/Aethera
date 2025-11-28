namespace Aethera.Server.Middleware
{
    public class ExceptionHandlingMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            ErrorResponse result = exception switch
            {
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
