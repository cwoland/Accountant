export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
    readonly params?: Record<string, string | number>,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (
  message: string,
  fields?: Record<string, string>,
  code = 'error.badRequest',
  params?: Record<string, string | number>,
) => new HttpError(400, code, message, fields, params);

export const unauthorized = (
  message = 'Требуется авторизация',
  code = 'error.unauthorized',
) => new HttpError(401, code, message);

export const forbidden = (message = 'Нет доступа', code = 'error.noAccess') =>
  new HttpError(403, code, message);

export const notFound = (message = 'Не найдено', code = 'error.notFound') =>
  new HttpError(404, code, message);

export const conflict = (message: string, code = 'error.conflict') =>
  new HttpError(409, code, message);

export const serviceUnavailable = (
  message: string,
  code = 'error.serviceUnavailable',
) => new HttpError(503, code, message);

export const badCredentials = () =>
  new HttpError(401, 'error.badCredentials', 'Неверный email или пароль.');

export const sessionExpired = (message = 'Сессия истекла. Войдите снова.') =>
  new HttpError(401, 'error.sessionExpired', message);

export const emailTaken = () =>
  new HttpError(409, 'error.emailTaken', 'Email уже зарегистрирован.');

export const accountNotFound = () =>
  new HttpError(404, 'error.accountNotFound', 'Счёт не найден.');
