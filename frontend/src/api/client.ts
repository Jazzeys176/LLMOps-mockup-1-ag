const API_BASE_URL = 'http://localhost:8001/api/v1/analytics';

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

export interface EvaluationLog {
    timestamp: string;
    evaluator_name: string;
    trace_id: string;
    score_value: number;
    duration_ms: number;
    status: string;
}

export interface Template {
    id: string;
    name: string;
    version: string;
    description: string;
    model: string;
    inputs: string[];
    template: string;
}

export interface Evaluator {
    id: string;
    name: string;
    score_name: string;
    template_id: string;
    target: string;
    status: string;
    variable_mapping: Record<string, string>;
    execution: any;
}

// Live Dashboard Types (from JSONL metrics)
export interface DailyActiveUsers {
    date: string;
    users: number;
}

export interface ModelUsage {
    model: string;
    tokens: number;
    cost: number;
    count: number;
    avg_latency: number;
}

export interface TraceByName {
    name: string;
    count: number;
}

export interface CostByModel {
    name: string;
    cost: number;
}

export interface LiveDashboardStats {
    computed_at: string | null;
    total_traces: number;
    avg_latency: number;
    total_tokens: number;
    total_cost: number;
    daily_active_users: DailyActiveUsers[];
    model_usage: ModelUsage[];
    traces_by_name: TraceByName[];
    cost_by_model: CostByModel[];
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
    },

    async getEvaluationLogs(limit: number = 50): Promise<EvaluationLog[]> {
        const response = await fetch(`${API_BASE_URL.replace('/analytics', '/evaluations')}/logs?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch evaluation logs');
        return response.json();
    },

    async getEvaluators(): Promise<Evaluator[]> {
        const response = await fetch(`${API_BASE_URL.replace('/analytics', '/evaluators')}/`);
        if (!response.ok) throw new Error('Failed to fetch evaluators');
        return response.json();
    },

    async updateEvaluatorStatus(id: string, status: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL.replace('/analytics', '/evaluators')}/${id}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update evaluator status');
        return response.json();
    },

    async getTemplates(): Promise<Template[]> {
        const response = await fetch(`${API_BASE_URL.replace('/analytics', '/templates')}/`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        return response.json();
    },

    async getLiveStats(): Promise<LiveDashboardStats> {
        const response = await fetch(`${API_BASE_URL}/dashboard-live`);
        if (!response.ok) throw new Error('Failed to fetch live dashboard stats');
        return response.json();
    }
};

