import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Save, Terminal, Clock, Settings,
    ChevronRight, ArrowUpCircle, Edit3, FileText
} from 'lucide-react';
import clsx from 'clsx';

// Type definitions matching backend
interface Prompt {
    id: string;
    name: string;
    description: string;
    tags: string[];
}

interface PromptVersion {
    version: number;
    date: string;
    author: string;
    comment: string;
    environment: string;
}

const Prompts = () => {
    const navigate = useNavigate();
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'editor' | 'config' | 'history'>('editor');
    const [isLoading, setIsLoading] = useState(false);

    // Editor State
    const [content, setContent] = useState("");
    const [variables, setVariables] = useState<string[]>([]);

    // Config State (Mocking for UI as it wasnt in original state)
    const [config, setConfig] = useState({
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 500,
        topP: 0.95,
        freqPenalty: 0,
        presPenalty: 0
    });

    // History State
    const [history, setHistory] = useState<PromptVersion[]>([]);

    // Fetch Prompts on Load
    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/prompts');
            if (res.ok) {
                const data = await res.json();
                setPrompts(data);
                if (data.length > 0 && !selectedPromptId) {
                    setSelectedPromptId(data[0].id); // Select first by default
                }
            }
        } catch (e) {
            console.error("Failed to fetch prompts", e);
        }
    };

    // Fetch History and Content when prompt selected
    useEffect(() => {
        if (selectedPromptId) {
            const prompt = prompts.find(p => p.id === selectedPromptId);
            if (prompt) {
                fetchHistory(prompt.name);
                // Mock content load - in real app would fetch from backend
                // Setting a default value for demo purposes if empty
                if (!content) {
                    setContent(`You are an expert factory maintenance assistant. Your role is to provide accurate, safe, and actionable technical guidance to factory operators and maintenance staff.\n\n**Guidelines:**\n- Always prioritize safety in your recommendations\n- Reference specific documentation sections when available\n- Provide step-by-step instructions for complex procedures\n- Escalate to human supervisors for critical safety issues\n- Use clear, concise language suitable for technical staff\n\n**Context:**\nYou have access to maintenance manuals, safety procedures, and equipment specifications. Use the provided context to answer questions accurately.\n\n**Variables:**\n{{context}}  {{query}}  {{equipment_id}}`);
                }
            }
        }
    }, [selectedPromptId]);

    const fetchHistory = async (name: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/prompts/${name}/history`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (e) {
            console.error("Failed to fetch history", e);
            // Fallback mock history if backend fails/empty
            setHistory([
                { version: 3, date: '2026-02-04 14:20', author: 'Admin', comment: 'Updated safety guidelines', environment: 'prod' },
                { version: 2, date: '2026-02-03 09:15', author: 'Admin', comment: 'Initial prompt refinement', environment: 'dev' },
                { version: 1, date: '2026-02-01 10:00', author: 'System', comment: 'Created', environment: 'archived' },
            ]);
        }
    };

    const handleSave = async () => {
        if (!selectedPromptId) return;
        setIsLoading(true);
        // Simulate save
        setTimeout(() => {
            setIsLoading(false);
            alert("Changes saved locally (Demo)");
        }, 800);
    };

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

    // Regex to detect variables
    useEffect(() => {
        const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g; // Changed to double curly braces per screenshot hint/standard
        const found = [];
        let match;
        // Also support single brace for legacy compatibility if user types it
        const regexSingle = /\{([a-zA-Z0-9_]+)\}/g;

        let tempContent = content;
        while ((match = regex.exec(tempContent)) !== null) {
            found.push(match[1]);
        }
        while ((match = regexSingle.exec(tempContent)) !== null) {
            // Filter out if it was part of double brace (simplified check)
            if (!found.includes(match[1])) found.push(match[1]);
        }

        setVariables([...new Set(found)]);
    }, [content]);


    return (
        <div className="h-[calc(100vh-theme(spacing.20))] flex gap-6 text-slate-200">
            {/* Sidebar List */}
            <div className="w-80 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Prompts</h2>
                        <p className="text-xs text-slate-500">Manage prompt templates and versions</p>
                    </div>
                </div>

                <div className="bg-[#111827] rounded-xl border border-slate-800 flex flex-col overflow-hidden h-full shadow-lg">
                    <div className="p-4 border-b border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Prompt Library</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {prompts.map(p => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPromptId(p.id)}
                                className={clsx(
                                    "p-3 rounded-lg cursor-pointer border transition-all group relative",
                                    selectedPromptId === p.id
                                        ? "bg-slate-800/80 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                                        : "bg-[#0D1117] border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={clsx("font-medium text-sm truncate pr-6", selectedPromptId === p.id ? "text-teal-400" : "text-slate-300")}>
                                        {p.name}
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-500 absolute top-3 right-3">v3</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{p.description}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {p.tags.map(t => (
                                        <span key={t} className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[9px] text-slate-400 uppercase tracking-wide">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {prompts.length === 0 && (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No prompts found.
                            </div>
                        )}
                    </div>

                    {/* New Prompt Button in Sidebar footer or header? Keeping in header context usually, but user asked for "New Prompt" button. 
                        The screenshot shows it at top right of the whole page. I will place it there in main layout or header.
                        But I will also keep a create action accessible.
                    */}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Global Header Actions */}
                <div className="flex justify-end gap-3 h-10">
                    <button className="flex items-center px-3 py-1.5 bg-[#111827] border border-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-800 transition-colors">
                        <Terminal size={14} className="mr-2" />
                        New Experiment
                    </button>
                    <button
                        onClick={() => navigate('/prompts/new')}
                        className="flex items-center px-3 py-1.5 bg-teal-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-teal-400 transition-colors shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                        <Plus size={16} className="mr-2" />
                        New Prompt
                    </button>
                </div>

                {selectedPrompt ? (
                    <div className="flex-1 bg-[#111827] rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
                        {/* Prompt Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-[#111827]">
                            <div className="flex gap-4">
                                <div className="p-3 bg-slate-800 rounded-lg h-fit">
                                    <FileText size={20} className="text-slate-400" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-100 mb-1">{selectedPrompt.name}</h1>
                                    <p className="text-slate-500 text-sm">{selectedPrompt.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-500 mb-1">Version</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-slate-200">3</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">production</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-800 bg-[#0D1117] px-6">
                            <button
                                onClick={() => setActiveTab('editor')}
                                className={clsx("px-8 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'editor' ? "border-teal-500 text-teal-400" : "border-transparent text-slate-500 hover:text-slate-300")}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => setActiveTab('config')}
                                className={clsx("px-8 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'config' ? "border-teal-500 text-teal-400" : "border-transparent text-slate-500 hover:text-slate-300")}
                            >
                                Config
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={clsx("px-8 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'history' ? "border-teal-500 text-teal-400" : "border-transparent text-slate-500 hover:text-slate-300")}
                            >
                                History
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#0B0E14] relative">

                            {activeTab === 'editor' && (
                                <div className="h-full flex flex-col gap-4">
                                    {/* Editor Window */}
                                    <div className="flex-1 bg-[#151921] rounded-xl border border-slate-800 flex flex-col relative overflow-hidden group">
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#1A1F29]">
                                            <span className="text-xs font-semibold text-slate-400">Prompt Content</span>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">production</span>
                                        </div>

                                        <div className="relative flex-1">
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] uppercase font-bold rounded border border-slate-700">System</span>
                                            </div>
                                            <textarea
                                                className="w-full h-full bg-[#0D1117] text-slate-300 font-mono text-sm p-6 pt-12 focus:outline-none resize-none leading-relaxed"
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                spellCheck={false}
                                                placeholder="// Enter system prompt here..."
                                            />
                                        </div>
                                    </div>

                                    {/* Detected Variables Footer */}
                                    <div className="bg-[#151921] border border-slate-800 rounded-lg p-3">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Variables Detected</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {variables.length > 0 ? variables.map(v => (
                                                <div key={v} className="bg-[#0D1117] px-2 py-1 rounded border border-slate-700 flex items-center font-mono text-xs text-teal-400">
                                                    <span>{`{{${v}}}`}</span>
                                                </div>
                                            )) : (
                                                <span className="text-xs text-slate-600 italic">No variables detected</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'config' && (
                                <div className="max-w-4xl">
                                    <h3 className="text-sm font-bold text-slate-200 mb-6 border-b border-slate-800 pb-2">Model Configuration</h3>

                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        {/* Model */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400">Model</label>
                                            <div className="relative">
                                                <select
                                                    value={config.model}
                                                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                                    className="w-full bg-[#0D1117] border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none"
                                                >
                                                    <option value="gpt-4o">gpt-4o</option>
                                                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                                                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Temperature */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400">Temperature</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={config.temperature}
                                                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                                                className="w-full bg-[#0D1117] border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                            />
                                        </div>

                                        {/* Max Tokens */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400">Max Tokens</label>
                                            <input
                                                type="number"
                                                value={config.maxTokens}
                                                onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                                                className="w-full bg-[#0D1117] border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                            />
                                        </div>

                                        {/* Top P */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400">Top P</label>
                                            <input
                                                type="number"
                                                step="0.05"
                                                value={config.topP}
                                                onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                                                className="w-full bg-[#0D1117] border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                            />
                                        </div>

                                        {/* Frequency Penalty */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400">Frequency Penalty</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={config.freqPenalty}
                                                onChange={(e) => setConfig({ ...config, freqPenalty: parseFloat(e.target.value) })}
                                                className="w-full bg-[#0D1117] border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                            />
                                        </div>

                                        {/* Presence Penalty */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400">Presence Penalty</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={config.presPenalty}
                                                onChange={(e) => setConfig({ ...config, presPenalty: parseFloat(e.target.value) })}
                                                className="w-full bg-[#0D1117] border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4 max-w-4xl">
                                    {history.map((ver) => (
                                        <div key={ver.version} className="bg-[#151921] border border-slate-800 rounded-lg p-4 flex gap-4 items-center hover:bg-slate-800/50 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-400">
                                                v{ver.version}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-semibold text-slate-200 text-sm">{ver.comment}</h4>
                                                    <span className="text-xs text-slate-500 font-mono">{ver.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-500 flex items-center">
                                                        By {ver.author}
                                                    </span>
                                                    {ver.environment === 'prod' && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-wider">Production</span>}
                                                    {ver.environment === 'dev' && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase font-bold tracking-wider">Dev</span>}
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                                                <ArrowUpCircle size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#111827] rounded-xl border border-slate-800">
                        <Terminal size={48} className="mb-4 opacity-20" />
                        <p>Select a prompt to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Prompts;
