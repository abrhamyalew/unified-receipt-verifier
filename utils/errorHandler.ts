class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

class ConnectionTimeOut extends AppError {
  constructor(message = "Request timed out") {
    super(message, 504);
  }
}

export { AppError, ValidationError, NotFoundError, ConnectionTimeOut };
