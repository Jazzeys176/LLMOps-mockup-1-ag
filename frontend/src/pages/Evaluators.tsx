import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ExternalLink, Plus } from 'lucide-react';
import clsx from 'clsx';
import { apiClient, type EvaluationLog } from '../api/client';

const Evaluators = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'evaluators' | 'templates' | 'logs'>('evaluators');

    // --- Mock Data ---

    const activeEvaluators = [
        {
            id: 'eval_1',
            name: 'Production Hallucination Check',
            status: 'Active',
            template: 'Hallucination Detector',
            scoreName: 'hallucination',
            target: 'TRACE',
            sampling: '20%',
            created: '13/01/2026'
        },
        {
            id: 'eval_2',
            name: 'Context Relevance Monitor',
            status: 'Active',
            template: 'Context Relevance',
            scoreName: 'context_relevance',
            target: 'TRACE',
            sampling: '50%',
            created: '18/01/2026'
        }
    ];

    const templates = [
        {
            id: 'tmpl_1',
            name: 'Hallucination Detector',
            version: 'v1',
            description: 'Detects factual inconsistencies in model responses',
            template: 'Given the context: {{context}} And the response: {{response}} Rate the hallucination level from 0 (no hallucination) to 1 (complete hallucination).',
            examples: ['Model: gpt-4o-mini', '{{context}}', '{{response}}'],
            lastUpdated: '18/01/2026, 13:32:35'
        },
        {
            id: 'tmpl_2',
            name: 'Context Relevance',
            version: 'v1',
            description: 'Evaluates how relevant the retrieved context is to the query',
            template: 'Query: {{query}} Context: {{context}} Rate relevance from 0 to 1.',
            examples: ['Model: gpt-4o-mini', '{{query}}', '{{context}}'],
            lastUpdated: '18/01/2026, 13:32:35' // Assuming same for demo
        }
    ];

    // State for Real Logs
    const [evalLogs, setEvalLogs] = useState<EvaluationLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Fetch Logs on Tab Change
    useEffect(() => {
        if (activeTab === 'logs') {
            const fetchLogs = async () => {
                setLoadingLogs(true);
                try {
                    const data = await apiClient.getEvaluationLogs();
                    setEvalLogs(data);
                } catch (err) {
                    console.error("Failed to fetch evaluation logs", err);
                } finally {
                    setLoadingLogs(false);
                }
            };
            fetchLogs();
        }
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Evaluators</h1>
                    <p className="text-slate-500 mt-1">Automated evaluation system</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-teal-400 hover:bg-teal-500 text-slate-950 rounded-lg font-semibold transition-colors">
                    <Plus size={18} className="mr-2" />
                    New Evaluator
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-transparent">
                {['Evaluators', 'Templates', 'Evaluation Log'].map((tab) => {
                    const key = tab === 'Evaluation Log' ? 'logs' : tab.toLowerCase();
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2",
                                activeTab === key
                                    ? "border-teal-400 text-teal-400 bg-[#181D25]"
                                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#181D25]/50"
                            )}
                        >
                            {tab}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="bg-[#181D25] rounded-xl border border-slate-800 p-6">

                {/* 1. Active Evaluators Tab */}
                {activeTab === 'evaluators' && (
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 mb-6">Active Evaluators</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Template</th>
                                        <th className="px-6 py-4">Score Name</th>
                                        <th className="px-6 py-4">Target</th>
                                        <th className="px-6 py-4">Sampling</th>
                                        <th className="px-6 py-4">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {activeEvaluators.map((ev) => (
                                        <tr key={ev.id} className="hover:bg-[#1C2028] transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-100">{ev.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                                    {ev.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 text-xs font-mono">
                                                    {ev.template}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-400 text-xs">{ev.scoreName}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 border border-slate-700 rounded text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                                                    {ev.target}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{ev.sampling}</td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">{ev.created}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 2. Templates Tab */}
                {activeTab === 'templates' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Evaluator Templates</h2>
                            <button
                                onClick={() => navigate('/evaluators/templates/new')}
                                className="flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors border border-slate-700">
                                <Plus size={16} className="mr-2" />
                                New Template
                            </button>
                        </div>
                        <div className="space-y-6">
                            {templates.map(tmpl => (
                                <div key={tmpl.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-slate-100">{tmpl.name}</h3>
                                        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded font-mono border border-slate-700">
                                            {tmpl.version}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-6">{tmpl.description}</p>

                                    <div className="bg-[#0D1117] rounded-lg p-4 font-mono text-sm text-slate-300 border border-slate-800 mb-4 whitespace-pre-wrap">
                                        {tmpl.template}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {tmpl.examples.map((ex, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700 font-mono">
                                                {ex}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-600">Last updated: {tmpl.lastUpdated}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Evaluation Logs Tab */}
                {activeTab === 'logs' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Evaluation Execution Log</h2>
                            <div className="flex gap-2">
                                <button className="flex items-center px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm">
                                    All Evaluators <ChevronDown size={14} className="ml-2 opacity-50" />
                                </button>
                                <button className="flex items-center px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm">
                                    All Status <ChevronDown size={14} className="ml-2 opacity-50" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Evaluator</th>
                                        <th className="px-6 py-4">Trace ID</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Duration</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {loadingLogs ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                                Loading logs...
                                            </td>
                                        </tr>
                                    ) : evalLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                                No evaluation logs found.
                                            </td>
                                        </tr>
                                    ) : (
                                        evalLogs.map((log, index) => {
                                            const scoreVal = log.score_value;
                                            const isLowScore = !isNaN(scoreVal) && scoreVal < 0.5;

                                            return (
                                                <tr key={index} className="hover:bg-[#1C2028] transition-colors">
                                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-200">{log.evaluator_name}</td>
                                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                                        <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">
                                                            {log.trace_id.substring(0, 8)}...
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "px-2 py-0.5 rounded font-mono text-xs font-bold border",
                                                            isLowScore
                                                                ? "bg-amber-950/30 text-amber-500 border-amber-900/30"
                                                                : "bg-emerald-950/30 text-emerald-500 border-emerald-900/30"
                                                        )}>
                                                            {scoreVal.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{log.duration_ms}ms</td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "px-2 py-0.5 rounded-full text-xs font-medium border",
                                                            log.status === 'Completed' || log.status === 'Success'
                                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                        )}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Evaluators;
