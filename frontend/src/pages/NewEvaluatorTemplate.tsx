import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';

const NewEvaluatorTemplate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [variables, setVariables] = useState<string[]>([]);

    // Fixed fields as per requirements
    const evalModel = "gpt-4o-mini";
    const outputType = "numeric (0-1)";

    // Variable Detection
    useEffect(() => {
        const regex = /\{([a-zA-Z0-9_]+)\}/g;
        const found = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            found.push(match[1].replace('{', '').replace('}', ''));
        }
        // Handle double braces if user types {{var}}
        const regexDouble = /\{\{([a-zA-Z0-9_]+)\}\}/g;
        while ((match = regexDouble.exec(content)) !== null) {
            found.push(match[1]);
        }

        // Simple distinct
        setVariables([...new Set(found)]);
    }, [content]);

    const handleSave = async () => {
        // Mock save for now as backend endpoint might not exist yet for templates specifically 
        // or we reuse prompts? User didn't specify backend. 
        // Assuming visual implementation first.
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate('/evaluators');
        }, 1000);
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col bg-[#181D25] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#181D25]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/evaluators')}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">Create Evaluator Template</h1>
                        <p className="text-sm text-slate-500">Define evaluation prompts with variable placeholders</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Form */}
                <div className="flex-1 overflow-y-auto p-8 border-r border-slate-800">
                    <div className="max-w-3xl space-y-8">

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-200">Template Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Template Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#0D1117] border border-slate-700 rounded-lg text-slate-200 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                    placeholder="e.g., Hallucination Detection"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#0D1117] border border-slate-700 rounded-lg text-slate-200 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                    placeholder="Brief description of what this template evaluates"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Evaluation Model</label>
                                    <input
                                        type="text"
                                        value={evalModel}
                                        disabled
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Output Type</label>
                                    <input
                                        type="text"
                                        value={outputType}
                                        disabled
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-slate-200">Evaluation Prompt</h2>
                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">Use {'{{variable}}'} syntax</span>
                            </div>

                            <div className="bg-[#0D1117] rounded-lg p-1 border border-slate-700">
                                <textarea
                                    className="w-full h-80 bg-transparent text-slate-300 font-mono text-sm p-4 focus:outline-none resize-none"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    spellCheck={false}
                                    placeholder={`Enter your evaluation prompt here.\n\nUse {{variable}} syntax to define placeholders that will be filled with trace data.\n\nExample:\nYou are evaluating an AI response.\n\nUser Input: {{input}}\nAI Response: {{output}}\nRetrieved Context: {{context}}\n\nEvaluate the response and provide a score from 0 to 1.`}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => navigate('/evaluators')}
                                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Creating...' : 'Create Template'}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-80 bg-[#181D25] border-l border-slate-800 p-6 overflow-y-auto hidden xl:block">
                    <div className="sticky top-0 space-y-8">

                        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                                <Terminal size={16} className="text-teal-500" />
                                Detected Variables
                            </h3>

                            <div className="space-y-2">
                                {variables.length > 0 ? (
                                    variables.map((v, i) => (
                                        <div key={i} className="bg-[#0D1117] px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between">
                                            <span className="font-mono text-teal-500 text-sm">{v}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-slate-500 italic text-center py-2">
                                        No variables detected. Use {'{{variable}}'} syntax in your prompt.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Tips</h4>
                            <ul className="text-sm text-slate-500 space-y-3">
                                <li className="flex gap-2">
                                    <span className="text-slate-600">•</span>
                                    <span>Be specific about scoring criteria</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-slate-600">•</span>
                                    <span>Include examples of edge cases</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-slate-600">•</span>
                                    <span>Define what each score range means</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-slate-600">•</span>
                                    <span>Test with diverse inputs before deploying</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewEvaluatorTemplate;
