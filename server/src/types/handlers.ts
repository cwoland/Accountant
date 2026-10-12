import type { RequestHandler } from 'express';

export type IdHandler = RequestHandler<{ id: string }>;
export type AccountIdHandler = RequestHandler<{ accountId: string }>;
