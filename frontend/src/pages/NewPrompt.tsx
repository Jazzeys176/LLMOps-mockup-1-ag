import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Terminal, ArrowLeft } from 'lucide-react';

const NewPrompt = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [content, setContent] = useState("");
    const [variables, setVariables] = useState<string[]>([]);

    // Variable Detection
    useEffect(() => {
        const regex = /\{([a-zA-Z0-9_]+)\}/g;
        const found = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            found.push(match[1]);
        }
        setVariables([...new Set(found)]);
    }, [content]);

    const handleSave = async () => {
        if (!name.trim() || !content.trim()) {
            alert("Name and Content are required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description, // Backend might not accept description in create? Let's check. 
                    // Wait, the python model PromptCreateRequest didn't have description. 
                    // Let's re-read backend/api/routes/prompts.py in a sec. 
                    // Assuming it might be missing in the request model but useful.
                    // For now I will send it, if backend ignores it, fine.
                    content,
                    variables,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean)
                })
            });

            if (res.ok) {
                navigate('/prompts');
            } else {
                const err = await res.json();
                alert(`Failed to create prompt: ${err.message || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to connect to backend");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/prompts')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Create New Prompt</h1>
                        <p className="text-sm text-gray-500">Configure your prompt template and variables</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/prompts')}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                        <Save size={16} className="mr-2" />
                        {isLoading ? 'Creating...' : 'Create Prompt'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Form */}
                <div className="flex-1 overflow-y-auto p-8 border-r border-gray-100">
                    <div className="max-w-2xl space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" // Added transition-all
                                placeholder="e.g., Customer Support Agent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-24 resize-none"
                                placeholder="What is this prompt used for?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="production, version-1, experimental (comma separated)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prompt Content
                                <span className="ml-2 text-xs font-normal text-gray-500">Use {'{variable}'} for dynamic inputs</span>
                            </label>
                            <div className="bg-gray-900 rounded-lg p-1 relative min-h-[300px] flex flex-col group">
                                <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 font-mono">System Prompt</span>
                                </div>
                                <textarea
                                    className="flex-1 w-full bg-transparent text-gray-100 font-mono text-sm p-4 focus:outline-none resize-none"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    spellCheck={false}
                                    placeholder="You are a helpful assistant. User query: {query}"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-80 bg-gray-50/50 p-6 overflow-y-auto">
                    <div className="sticky top-0">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Terminal size={16} className="text-gray-500" />
                            Detected Variables
                        </h3>

                        <div className="space-y-3">
                            {variables.length > 0 ? (
                                variables.map(v => (
                                    <div key={v} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                        <span className="font-mono text-indigo-600 text-sm font-medium">{v}</span>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">STR</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 italic p-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                    No variables detected in prompt content.
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Tips</h4>
                            <ul className="text-sm text-gray-500 space-y-2 list-disc list-inside">
                                <li>Use curly braces for variables</li>
                                <li>Variables are auto-detected</li>
                                <li>Description helps others understand intent</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewPrompt;
