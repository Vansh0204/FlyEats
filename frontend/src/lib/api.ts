const RAW_API_BASE = (import.meta.env.VITE_API_URL || 'https://flyeats.onrender.com').replace(/\/$/, '')
const API_BASE = RAW_API_BASE

// Add timeout and retry support to mitigate cold starts or transient errors
export async function apiFetch(
  input: string,
  init?: (RequestInit & { timeoutMs?: number; retries?: number; retryDelayMs?: number })
) {
  // If full URL, pass through untouched
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return fetch(input, init as RequestInit)
  }

  const url = API_BASE ? `${API_BASE}${input}` : input

  const timeoutMs = init?.timeoutMs ?? 20000 // 20s default
  const retries = init?.retries ?? 2 // total attempts = retries + 1
  const retryDelayMs = init?.retryDelayMs ?? 1000

  // Remove custom fields from fetch init
  const { timeoutMs: _t, retries: _r, retryDelayMs: _d, signal, ...fetchInit } = init || {}

  let attempt = 0
  while (true) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const combinedSignal = controller.signal
      const resp = await fetch(url, { ...fetchInit, signal: combinedSignal })

      // Retry on transient server errors (often seen during cold starts)
      if ([502, 503, 504].includes(resp.status) && attempt < retries) {
        attempt++
        clearTimeout(timer)
        await new Promise((res) => setTimeout(res, retryDelayMs * attempt))
        continue
      }

      clearTimeout(timer)
      return resp
    } catch (err: any) {
      clearTimeout(timer)
      // Retry on network/timeout errors
      if (attempt < retries) {
        attempt++
        await new Promise((res) => setTimeout(res, retryDelayMs * attempt))
        continue
      }
      throw err
    }
  }
}


