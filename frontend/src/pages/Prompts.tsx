import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Edit3, Settings, Save, Clock, Copy, Terminal,
    ChevronRight, ArrowUpCircle, CheckCircle
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
                    // Select first by default logic could go here
                }
            }
        } catch (e) {
            console.error("Failed to fetch prompts", e);
        }
    };

    // Fetch History when prompt selected
    useEffect(() => {
        if (selectedPromptId) {
            const prompt = prompts.find(p => p.id === selectedPromptId);
            if (prompt) {
                fetchHistory(prompt.name);
                // In a real app we'd fetch the content of the latest version here too
                // For demo, we are clearing content to simulate a fresh load or "Latest"
                setContent(`// Loading latest version for ${prompt.name}...`);
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
        }
    };

    const handleSave = async () => {
        if (!selectedPromptId) return;
        const prompt = prompts.find(p => p.id === selectedPromptId);
        if (!prompt) return;

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: prompt.name,
                    content: content,
                    variables: variables,
                    tags: prompt.tags
                })
            });
            if (res.ok) {
                await fetchHistory(prompt.name);
                alert("Version saved successfully!");
            }
        } catch (e) {
            alert("Failed to save version");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromote = async (version: number) => {
        if (!selectedPromptId) return;
        const prompt = prompts.find(p => p.id === selectedPromptId);
        if (!prompt) return;

        try {
            const res = await fetch(`http://localhost:8000/api/v1/prompts/${prompt.name}/promote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    version: version,
                    environment: 'prod'
                })
            });
            if (res.ok) {
                await fetchHistory(prompt.name); // Refresh to see tag update
            }
        } catch (e) {
            console.error("Promotion failed", e);
        }
    };

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

    // Regex to detect variables
    useEffect(() => {
        const regex = /\{([a-zA-Z0-9_]+)\}/g;
        const found = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            found.push(match[1]);
        }
        // Unique
        setVariables([...new Set(found)]);
    }, [content]);


    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex gap-6">

            {/* Sidebar List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-700">Prompts</h2>
                    <button
                        onClick={() => navigate('/prompts/new')}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {prompts.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setSelectedPromptId(p.id)}
                            className={clsx(
                                "p-4 rounded-lg cursor-pointer border transition-all",
                                selectedPromptId === p.id
                                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                    : "bg-white border-transparent hover:bg-gray-50 border-gray-100"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={clsx("font-bold", selectedPromptId === p.id ? "text-indigo-700" : "text-gray-900")}>
                                    {p.name}
                                </h3>
                                {selectedPromptId === p.id && <ChevronRight size={16} className="text-indigo-400" />}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {p.tags.map(t => (
                                    <span key={t} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-600 font-mono">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {prompts.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No prompts found. <br /> Check backend connection.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {selectedPrompt ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedPrompt.name}</h1>
                                <p className="text-gray-500 text-sm">{selectedPrompt.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                                >
                                    <Save size={16} className="mr-2" />
                                    {isLoading ? 'Saving...' : 'Save Version'}
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setActiveTab('editor')}
                                className={clsx("px-6 py-3 text-sm font-medium flex items-center border-b-2 transition-colors", activeTab === 'editor' ? "border-indigo-500 text-indigo-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
                            >
                                <Edit3 size={16} className="mr-2" /> Editor
                            </button>
                            <button
                                onClick={() => setActiveTab('config')}
                                className={clsx("px-6 py-3 text-sm font-medium flex items-center border-b-2 transition-colors key", activeTab === 'config' ? "border-indigo-500 text-indigo-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
                            >
                                <Settings size={16} className="mr-2" /> Config
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={clsx("px-6 py-3 text-sm font-medium flex items-center border-b-2 transition-colors", activeTab === 'history' ? "border-indigo-500 text-indigo-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
                            >
                                <Clock size={16} className="mr-2" /> History
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">

                            {activeTab === 'editor' && (
                                <div className="h-full flex flex-col gap-4">
                                    <div className="flex-1 bg-gray-900 rounded-lg p-1 relative group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 font-mono">System Prompt</span>
                                        </div>
                                        <textarea
                                            className="w-full h-full bg-transparent text-gray-100 font-mono text-sm p-4 focus:outline-none resize-none"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            spellCheck={false}
                                            placeholder="Enter prompt content here..."
                                        />
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                                        <Terminal size={18} className="text-blue-600 mt-1" />
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-800 mb-1">Detected Variables</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {variables.map(v => (
                                                    <span key={v} className="px-2 py-1 bg-white border border-blue-200 text-blue-600 text-xs font-mono rounded">
                                                        {`{${v}}`}
                                                    </span>
                                                ))}
                                                {variables.length === 0 && <span className="text-xs text-gray-400 italic">No variables detected (use {'{var}'} syntax)</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'config' && (
                                <div className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-sm text-gray-500 text-center italic">Configuration mocking disabled for current demo phase.</p>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4 max-w-3xl mx-auto">
                                    {history.map((ver, idx) => (
                                        <div key={ver.version} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
                                            <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm", ver.environment === 'prod' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                                                {ver.version}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-gray-900">{ver.comment}</h4>
                                                    <span className="text-xs text-gray-400">{ver.date}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{ver.author}</span>
                                                    {ver.environment === 'prod' && <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200">Production</span>}
                                                    {ver.environment === 'archived' && <span className="text-gray-400 text-xs font-semibold bg-gray-50 px-2 py-0.5 rounded border border-gray-200">Archived</span>}
                                                    {ver.environment === 'dev' && <span className="text-blue-500 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Draft</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {ver.environment !== 'prod' && (
                                                    <button
                                                        onClick={() => handlePromote(ver.version)}
                                                        className="flex items-center px-3 py-1.5 border border-green-200 text-green-700 rounded text-xs font-medium hover:bg-green-50"
                                                    >
                                                        <ArrowUpCircle size={12} className="mr-1" /> Promote
                                                    </button>
                                                )}
                                                <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium hover:bg-gray-50">
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select a prompt to view details
                    </div>
                )}
            </div>
        </div>
    );
};

export default Prompts;
