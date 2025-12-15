// File: `src/api/client.ts`

/**
 * Small HTTP client wrapper around `fetch` for the application's API.
 *
 * Uses `import.meta.env.VITE_API_URL` as the base URL and sends JSON
 * requests with credentials included by default.
 *
 * @template T - Expected shape of the parsed JSON response.
 * @param {string} path - Path to append to the API base URL (e.g. '/auth/login').
 * @param {RequestInit} [init] - Optional fetch init to override method, body, headers, etc.
 * @returns {Promise<T>} Parsed JSON response cast to T, or `null` for empty responses.
 * @throws {Error} When the response has a non-2xx status; error message includes response text.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
    // Build full URL using the Vite environment variable for the API base.
    const url = `${import.meta.env.VITE_API_URL}${path}`;

    // Send JSON by default and include credentials (cookies). Allow callers to override via `init`.
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...init,
    });

    // If server responded with a non-OK status, read the response text and throw a helpful error.
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
    }

    // Read raw text to gracefully handle empty responses (204 No Content, etc.).
    const text = await res.text();

    // If body is empty, return `null` cast to T; otherwise parse JSON.
    return text ? (JSON.parse(text) as T) : (null as unknown as T);
}

export const api = {
    // Convenience wrappers for common HTTP verbs.
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
