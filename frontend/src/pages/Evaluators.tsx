import { useState } from 'react';
import {
    ClipboardCheck, FileText, Settings, CheckCircle2, XCircle,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const Evaluators = () => {
    const [activeTab, setActiveTab] = useState<'logs' | 'templates' | 'active'>('logs');

    // --- Mock Data ---

    const evalLogs = Array.from({ length: 15 }, (_, i) => ({
        id: `log_${i}`,
        timestamp: new Date(Date.now() - i * 1000 * 60 * 5).toISOString(),
        evaluator: i % 3 === 0 ? 'Hallucination Detector' : 'Context Relevance',
        traceId: `trace_${100 + i}`,
        score: (Math.random() * 0.5 + 0.5).toFixed(2),
        duration: `${Math.floor(Math.random() * 500 + 100)}ms`,
        status: Math.random() > 0.1 ? 'success' : 'failed'
    }));

    const templates = [
        {
            id: 'tmpl_1',
            name: 'Hallucination Check',
            description: 'Checks if the response is grounded in the provided context.',
            model: 'gpt-4o',
            variables: ['context', 'response'],
            template: 'You are an AI evaluator. Check if the following response...'
        },
        {
            id: 'tmpl_2',
            name: 'Conciseness',
            description: 'Ensures the answer is brief and to the point.',
            model: 'gpt-3.5-turbo',
            variables: ['response'],
            template: 'Rate the conciseness of the response on a scale of 0 to 1...'
        },
        {
            id: 'tmpl_3',
            name: 'Safety Filter',
            description: 'Detects unsafe or harmful content.',
            model: 'llama-guard',
            variables: ['input', 'response'],
            template: 'Analyze the conversation for safety violations...'
        }
    ];

    const activeEvaluators = [
        {
            id: 'eval_1',
            name: 'Prod Hallucination Guard',
            status: 'active',
            template: 'Hallucination Check',
            scoreName: 'hallucination_score',
            target: 'Production Traces',
            sampling: '100%',
            created: '2026-01-15'
        },
        {
            id: 'eval_2',
            name: 'Dev Relevance Test',
            status: 'paused',
            template: 'Context Relevance',
            scoreName: 'relevance_score',
            target: 'Staging Traces',
            sampling: '50%',
            created: '2026-01-20'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Evaluators</h1>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'logs' ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <ClipboardCheck size={16} className="mr-2" /> Evaluation Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'templates' ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <FileText size={16} className="mr-2" /> Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'active' ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <Settings size={16} className="mr-2" /> Active Evaluators
                    </button>
                </div>

                <div className="p-6 bg-gray-50/50 min-h-[500px]">

                    {/* 1. Evaluation Logs Tab */}
                    {activeTab === 'logs' && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Timestamp</th>
                                            <th className="px-6 py-4">Evaluator Name</th>
                                            <th className="px-6 py-4">Trace ID</th>
                                            <th className="px-6 py-4">Score</th>
                                            <th className="px-6 py-4">Duration</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {evalLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.timestamp}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{log.evaluator}</td>
                                                <td className="px-6 py-4 text-indigo-600 font-mono text-xs">{log.traceId}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{log.score}</td>
                                                <td className="px-6 py-4 text-gray-500">{log.duration}</td>
                                                <td className="px-6 py-4">
                                                    {log.status === 'success' ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            <CheckCircle2 size={12} className="mr-1" /> Success
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            <XCircle size={12} className="mr-1" /> Failed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                                <span className="text-sm text-gray-500">Showing 1-15 of 245 logs</span>
                                <div className="flex space-x-2">
                                    <button className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
                                    <button className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Templates Tab */}
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map(tmpl => (
                                <div key={tmpl.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <FileText size={24} />
                                        </div>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-mono">
                                            {tmpl.model}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{tmpl.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{tmpl.description}</p>

                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase">Variables</span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {tmpl.variables.map(v => (
                                                    <span key={v} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase">Preview</span>
                                            <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-100 text-xs font-mono text-gray-600 truncate">
                                                {tmpl.template}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3. Active Evaluators Tab */}
                    {activeTab === 'active' && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Evaluator Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Template</th>
                                        <th className="px-6 py-4">Score Name</th>
                                        <th className="px-6 py-4">Target Data</th>
                                        <th className="px-6 py-4">Sampling</th>
                                        <th className="px-6 py-4">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {activeEvaluators.map((ev) => (
                                        <tr key={ev.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{ev.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                                    ev.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                )}>
                                                    {ev.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{ev.template}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-indigo-600">{ev.scoreName}</td>
                                            <td className="px-6 py-4 text-gray-600">{ev.target}</td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{ev.sampling}</td>
                                            <td className="px-6 py-4 text-gray-500">{ev.created}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Evaluators;
