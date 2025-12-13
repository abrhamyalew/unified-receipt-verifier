class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class ConnectionTimeOut extends AppError {
  constructor(message = "Request timed out") {
    super(message, 504);
  }
}

export default { ValidationError, NotFoundError, ConnectionTimeOut };
