/** Minimalny helper do budowania query string */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>
) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '') q.set(k, String(v))
  }

  return q.toString()
}
