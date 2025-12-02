

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...init,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
    }

    // handle empty response
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : (null as unknown as T);
}

export const api = {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};