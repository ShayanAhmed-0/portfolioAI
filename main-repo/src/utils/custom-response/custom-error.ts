class CustomError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.message = message;
  }

  static createError(message: string, status: number, res: any) {
    return new CustomError(message, status);
  }

  static notFound(message: string = "Not Found") {
    return new CustomError(message, 404);
  }

  static badRequest(message: string = "Bad Request") {
    return new CustomError(message, 400);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new CustomError(message, 401);
  }

  static forbidden(message: string = "Forbidden") {
    return new CustomError(message, 403);
  }

  static internal(message: string = "Internal Server Error") {
    return new CustomError(message, 500);
  }

  static DataWithErrors(data: any, message: string, status: number) {
    return {
      user: data,
      message: message,
      status: status,
    };
  }
}

export default CustomError;
