import { Request, RequestHandler, Response } from 'express';

function buildHeaders(req: Request) {
  const headers = new Headers();
  const blockedHeaders = new Set(['host', 'connection', 'content-length']);

  for (const [key, value] of Object.entries(req.headers)) {
    if (blockedHeaders.has(key) || value === undefined) {
      continue;
    }

    headers.set(key, Array.isArray(value) ? value.join(',') : value);
  }

  return headers;
}

export function proxyTo(targetBaseUrl: string): RequestHandler {
  return async (req: Request, res: Response, next) => {
    try {
      const targetUrl = new URL(req.originalUrl, targetBaseUrl);
      const body =
        req.method === 'GET' || req.method === 'HEAD'
          ? undefined
          : Buffer.isBuffer(req.body) && req.body.length > 0
            ? req.body
            : undefined;

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: buildHeaders(req),
        body: body as unknown as BodyInit | undefined
      });

      res.status(response.status);

      for (const [key, value] of response.headers.entries()) {
        if (['content-type', 'content-disposition'].includes(key)) {
          res.setHeader(key, value);
        }
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}
