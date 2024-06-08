export class PermissionNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionNotFoundError';
  }
}
