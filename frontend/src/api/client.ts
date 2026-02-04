const API_BASE_URL = 'http://localhost:8000/api/v1/analytics';

// Types matching Backend Pydantic Models
export interface DashboardStats {
    total_traces: number;
    total_cost: number;
    total_tokens: number;
    avg_latency: number;
    first_response_accuracy: number;
    escalation_rate: number;
    daily_stats: any[];
}

export interface TraceScores {
    hallucination: number;
    context_relevance: number;
    conciseness: number;
}

export interface Trace {
    id: string;
    timestamp: string;
    name: string;
    input: string;
    output?: string;
    latency: string;
    tokens: string;
    cost: string;
    scores?: TraceScores;
    status: string;
    user_id: string;
    session_id: string;
}

export interface Session {
    id: string;
    user: string;
    traces: number;
    totalTokens: string;
    totalCost: string;
    created: string;
}

export interface TraceBubble {
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
    trace_id: string;
}

// Client Implementation
export const apiClient = {
    async getStats(): Promise<DashboardStats> {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    },

    async getTraces(page: number = 1, limit: number = 20, search: string = ''): Promise<Trace[]> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}/traces?${params}`);
        if (!response.ok) throw new Error('Failed to fetch traces');
        return response.json();
    },

    async getTraceDetail(id: string): Promise<Trace> {
        const response = await fetch(`${API_BASE_URL}/traces/${id}`);
        if (!response.ok) throw new Error('Failed to fetch trace detail');
        return response.json();
    },

    async getSessions(page: number = 1, limit: number = 20, search: string = ''): Promise<Session[]> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}/sessions?${params}`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        return response.json();
    },

    async getSessionTraces(sessionId: string): Promise<TraceBubble[]> {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/traces`);
        if (!response.ok) throw new Error('Failed to fetch session traces');
        return response.json();
    }
};
