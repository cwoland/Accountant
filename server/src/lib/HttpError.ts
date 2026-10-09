export class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly fields?: Record<string, string>,
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

export const badRequest = (m: string, f?: Record<string, string>) => new HttpError(400, m, f);
export const unauthorized = (m = 'Требуется авторизация') => new HttpError(401, m);
export const forbidden = (m = 'Нет доступа') => new HttpError(403, m);
export const notFound = (m = 'Не найдено') => new HttpError(404, m);
export const conflict = (m: string) => new HttpError(409, m);
export const serviceUnavailable = (m: string) => new HttpError(503, m);