export class TaktError extends Error {
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
}

// L'API renvoie les erreurs sous la forme { error: { code, message, details? } }.
interface ErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: string[];
  };
}

export async function errorFromResponse(res: Response): Promise<TaktError> {
  let body: ErrorBody = {};
  try {
    body = (await res.json()) as ErrorBody;
  } catch {
    // corps non-JSON : on garde les valeurs par défaut
  }
  const e = body.error ?? {};
  return new TaktError(
    res.status,
    e.code ?? 'erreur_http',
    e.message ?? res.statusText ?? 'erreur HTTP',
    e.details,
  );
}
