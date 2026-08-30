/**
 * Resolve an app-relative API path into something `fetch` will accept in both
 * environments.
 *
 * In the browser a relative path is fine — it resolves against the document
 * origin. During SSR there is no document, so Node's `fetch` rejects the bare
 * path with `ERR_INVALID_URL` and the query fails before it ever runs.
 *
 * The server can always reach its own routes over loopback, so we build an
 * absolute URL from the port Nitro is listening on rather than requiring the
 * public hostname. That keeps this working behind a reverse proxy, where the
 * container has no idea what domain it is served under.
 */
export function apiUrl(path: string): string {
  if (typeof window !== "undefined") return path;

  const port = process.env.PORT ?? process.env.NITRO_PORT ?? "3000";
  return `http://127.0.0.1:${port}${path}`;
}
