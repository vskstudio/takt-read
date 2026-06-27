export default class TaktError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: string[];

  constructor(status: number, code: string, message: string, details?: string[]) {
    super(message);
    this.name = 'TaktError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static async fromResponse(res: Response): Promise<TaktError> {
    let body: { error?: { code?: string; message?: string; details?: string[] } } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      // corps non-JSON
    }
    const e = body.error ?? {};
    return new TaktError(
      res.status,
      e.code ?? 'erreur_http',
      e.message ?? res.statusText ?? 'erreur HTTP',
      e.details,
    );
  }
}
