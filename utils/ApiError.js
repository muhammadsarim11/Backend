class ApiError extends Error {
  constructor(
    statusCode,
    message = "Internal Server Error",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.stack = stack;
    this.message = message;
  }
}

export default ApiError;
