class CustomSuccess {
  data: any;
  message: string;
  status: number;

  constructor(data: any, message: string, status: number) {
    this.data = data;
    this.message = message;
    this.status = status;
  }

  static createSuccess(data: any, message: string, status: number) {
    return new CustomSuccess(data, message, status);
  }

  static ok(data: any = "OK") {
    return new CustomSuccess(data, "OK", 200);
  }

  static created(data: any, message: string = "Created") {
    return new CustomSuccess(data, message, 201);
  }

  static accepted(data: any) {
    return new CustomSuccess(data, "Accepted", 202);
  }

  static noContent(data: any) {
    return new CustomSuccess(data, "", 204);
  }
}

export default CustomSuccess;
