export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequest<TPayload = unknown> {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: TPayload;
}

export interface HttpResponse<T = unknown> {
    status: number;
    headers: Record<string, string>;
    data: T;
}

export interface HttpClient {
    request<TResponse = unknown, TPayload = unknown>(request: HttpRequest<TPayload>): Promise<HttpResponse<TResponse>>;
}

export class FetchHttpClient implements HttpClient {
    constructor(private readonly baseUrl: string, private readonly defaultHeaders: Record<string, string> = {}) {}

    async request<TResponse = unknown, TPayload = unknown>(request: HttpRequest<TPayload>): Promise<HttpResponse<TResponse>> {
        const url = request.url.startsWith('http') ? request.url : `${this.baseUrl}${request.url}`;
        const headers = { ...this.defaultHeaders, ...(request.headers ?? {}) };

        const response = await fetch(url, {
            method: request.method,
            headers,
            body: request.body ? JSON.stringify(request.body) : undefined
        });

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key.toLowerCase()] = value;
        });

        console.log('[HttpClient] Response received:');
        console.log('[HttpClient]    Status:', response.status);
        console.log('[HttpClient]    URL:', url);
        console.log('[HttpClient]    Headers:', JSON.stringify(responseHeaders, null, 2));

        const contentType = response.headers.get('content-type') ?? '';
        const isJson = contentType.includes('application/json');
        const data = (isJson ? await response.json() : await response.text()) as TResponse;

        console.log('[HttpClient]    Data:', JSON.stringify(data, null, 2));

        // Throw an error for non-2xx responses
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            (error as any).status = response.status;
            (error as any).response = { status: response.status, headers: responseHeaders, data };
            console.error('[HttpClient] ❌ Request failed:', error.message);
            console.error('[HttpClient]    Error data:', JSON.stringify(data, null, 2));
            throw error;
        }

        return {
            status: response.status,
            headers: responseHeaders,
            data
        };
    }
}
