import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus } from 'lucide-react';
import clsx from 'clsx';
import { apiClient, type EvaluationLog, type Evaluator, type Template } from '../api/client';

const Evaluators = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'evaluators' | 'templates' | 'logs'>('evaluators');

    // State for DB data
    const [activeEvaluators, setActiveEvaluators] = useState<Evaluator[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [evalLogs, setEvalLogs] = useState<EvaluationLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Fetch data based on tab
    useEffect(() => {
        if (activeTab === 'evaluators') {
            apiClient.getEvaluators().then(setActiveEvaluators).catch(console.error);
        } else if (activeTab === 'templates') {
            apiClient.getTemplates().then(setTemplates).catch(console.error);
        } else if (activeTab === 'logs') {
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
                                                <button
                                                    onClick={() => {
                                                        const newStatus = ev.status === 'Active' ? 'Inactive' : 'Active';
                                                        setActiveEvaluators(prev => prev.map(e => e.id === ev.id ? { ...e, status: newStatus } : e));
                                                        apiClient.updateEvaluatorStatus(ev.id, newStatus).catch(err => {
                                                            console.error("Failed to update status", err);
                                                            setActiveEvaluators(prev => prev.map(e => e.id === ev.id ? { ...e, status: ev.status } : e));
                                                        });
                                                    }}
                                                    className={clsx(
                                                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                        ev.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-600'
                                                    )}
                                                    title={`Toggle status to ${ev.status === 'Active' ? 'Inactive' : 'Active'}`}
                                                >
                                                    <span className="sr-only">Toggle Status</span>
                                                    <span
                                                        aria-hidden="true"
                                                        className={clsx(
                                                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                            ev.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                                                        )}
                                                    />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 text-xs font-mono">
                                                    {ev.template_id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-400 text-xs">{ev.score_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 border border-slate-700 rounded text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                                                    {ev.target}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{ev.execution?.sampling_rate ? (ev.execution.sampling_rate * 100) + '%' : '100%'}</td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">Today</td>
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
                                        {tmpl.inputs && tmpl.inputs.map((ex: string, i: number) => (
                                            <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700 font-mono">
                                                {`{{${ex}}}`}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-600">Model: {tmpl.model}</p>
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
