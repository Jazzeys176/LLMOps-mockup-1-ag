import { useState } from 'react';
import {
    Plus, Edit3, Settings, Save, Clock, Copy, Terminal,
    ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const Prompts = () => {
    const [selectedPromptId, setSelectedPromptId] = useState('prompt_1');
    const [activeTab, setActiveTab] = useState<'editor' | 'config' | 'history'>('editor');

    // Mock Prompts List
    const prompts = [
        {
            id: 'prompt_1',
            name: 'Safety Assistant Main',
            description: 'Main system prompt for the factory safety assistant bot.',
            tags: ['production', 'safety', 'v3']
        },
        {
            id: 'prompt_2',
            name: 'RCA Generator',
            description: 'Used by the RCA service to analyze drift.',
            tags: ['backend', 'analysis', 'v1']
        },
        {
            id: 'prompt_3',
            name: 'Maintenance Scheduler',
            description: 'Extracts maintenance dates from user queries.',
            tags: ['tools', 'extraction', 'beta']
        }
    ];

    // Mock Selected Prompt Data
    const selectedPrompt = {
        ...prompts.find(p => p.id === selectedPromptId),
        content: "You are a helper for factory floor workers.\nYour name is SafeBot.\n\nContext: {retrieved_context}\nUser Query: {user_query}\n\nAnswer the user query based ONLY on the context provided.\nIf the answer is not in the context, say \"I don't have that information in safety manuals.\"\nAlways reference the specific machine ID when possible.",
        config: {
            model: 'gpt-4-turbo',
            temperature: 0.3,
            max_tokens: 500,
            top_p: 0.9,
            stop: []
        },
        history: [
            { version: 'v3', date: '2026-02-01 10:00', author: 'admin', comment: 'Added strict context constraint' },
            { version: 'v2', date: '2026-01-28 14:30', author: 'alice', comment: 'Updated tone to be more formal' },
            { version: 'v1', date: '2026-01-15 09:00', author: 'admin', comment: 'Initial version' }
        ]
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex gap-6">

            {/* Sidebar List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-700">Prompts</h2>
                    <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                            <div className="flex flex-wrap gap-1">
                                {p.tags.map(t => (
                                    <span key={t} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-600 font-mono">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {selectedPrompt && (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedPrompt.name}</h1>
                                <p className="text-gray-500 text-sm">{selectedPrompt.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                                    <Copy size={16} className="mr-2" /> Duplicate
                                </button>
                                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                                    <Save size={16} className="mr-2" /> Save Version
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
                                            defaultValue={selectedPrompt.content}
                                            spellCheck={false}
                                        />
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                                        <Terminal size={18} className="text-blue-600 mt-1" />
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-800 mb-1">Detected Variables</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {['retrieved_context', 'user_query'].map(v => (
                                                    <span key={v} className="px-2 py-1 bg-white border border-blue-200 text-blue-600 text-xs font-mono rounded">
                                                        {`{${v}}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'config' && (
                                <div className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" defaultValue={selectedPrompt.config.model}>
                                            <option value="gpt-4-turbo">gpt-4-turbo</option>
                                            <option value="gpt-4o">gpt-4o</option>
                                            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                                            <input type="number" step="0.1" defaultValue={selectedPrompt.config.temperature} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Top P</label>
                                            <input type="number" step="0.1" defaultValue={selectedPrompt.config.top_p} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                                        <input type="number" defaultValue={selectedPrompt.config.max_tokens} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4 max-w-3xl mx-auto">
                                    {selectedPrompt.history.map((ver, idx) => (
                                        <div key={ver.version} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
                                            <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm", idx === 0 ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500")}>
                                                {ver.version}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-gray-900">{ver.comment}</h4>
                                                    <span className="text-xs text-gray-400">{ver.date}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{ver.author}</span>
                                                    {idx === 0 && <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded">Active</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
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
                )}
            </div>
        </div>
    );
};

export default Prompts;
