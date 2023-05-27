export class OSError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  };
}