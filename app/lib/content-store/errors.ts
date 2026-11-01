export class ContentStoreError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ContentStoreError';
    this.status = status;
  }
}

export class ConflictError extends ContentStoreError {
  constructor() {
    super('Iemand anders heeft dit net aangepast. Herlaad de pagina.', 409);
    this.name = 'ConflictError';
  }
}
