export class ApiError extends Error {
  public code: number;
  public body: any;

  constructor(code: number, body: any) {
    super();
    this.code = code;
    this.body = body;
  }
}
