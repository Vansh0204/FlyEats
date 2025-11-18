const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function apiFetch(input: string, init?: RequestInit) {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return fetch(input, init)
  }

  const url = API_BASE ? `${API_BASE}${input}` : input
  return fetch(url, init)
}


