class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.data = data;
    this.statusCode = statusCode;
    this.message = "Success";
    this.success = statusCode >= 200 && statusCode < 400;
  }
}

export default ApiResponse;
