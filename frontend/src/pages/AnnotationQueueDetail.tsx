import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Save, Trash2,
    MessageSquare, CheckCircle, HelpCircle, XCircle
} from 'lucide-react';
import clsx from 'clsx';

const AnnotationQueueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock Items
    const items = [
        {
            id: "item_1",
            traceId: "trace_xyz789",
            input: "What is the safety procedure for Machine X-500?",
            output: "For Machine X-500, follow these safety steps: 1. Verify LOTO...",
            metadata: { model: "gpt-4-turbo", retrieval_score: 0.85 },
            hallucination_score: 0.72
        },
        {
            id: "item_2",
            traceId: "trace_abc123",
            input: "How do I reset the pressure sensor?",
            output: "Press the red button.",
            metadata: { model: "gpt-3.5", retrieval_score: 0.92 },
            hallucination_score: 0.95
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const currentItem = items[currentIndex];

    // Annotation State
    const [correctness, setCorrectness] = useState('correct');
    const [quality, setQuality] = useState(5);
    const [notes, setNotes] = useState('');

    const handleNext = () => {
        if (currentIndex < items.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/annotation_queue')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Queue: {id}</h1>
                        <p className="text-sm text-gray-500">Item {currentIndex + 1} of {items.length}</p>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center"
                    >
                        <ChevronLeft size={16} className="mr-1" /> Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === items.length - 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center"
                    >
                        Next <ChevronRight size={16} className="ml-1" />
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">

                {/* Left: Content Display */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex border-b border-gray-100 bg-gray-50">
                        <div className="px-6 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 flex items-center">
                            <MessageSquare size={16} className="mr-2 text-indigo-500" /> Trace View
                        </div>
                        <div className="px-6 py-3 text-xs font-mono text-gray-500 flex items-center bg-white flex-1">
                            ID: {currentItem.traceId}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Input Query</h3>
                            <div className="bg-indigo-50 p-4 rounded-lg text-sm text-gray-800 whitespace-pre-wrap border border-indigo-100">
                                {currentItem.input}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Model Output</h3>
                            <div className="bg-white p-4 rounded-lg text-sm text-gray-800 whitespace-pre-wrap border border-gray-200 shadow-sm">
                                {currentItem.output}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Metadata</h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono text-gray-600 border border-gray-100">
                                <pre>{JSON.stringify(currentItem.metadata, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Labeling Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-y-auto">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Annotation</h2>

                    <div className="space-y-6 flex-1">
                        {/* Correctness */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Correctness</label>
                            <div className="space-y-2">
                                {['correct', 'partial', 'wrong'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setCorrectness(opt)}
                                        className={clsx(
                                            "w-full flex items-center px-4 py-3 border rounded-lg text-sm font-medium transition-all",
                                            correctness === opt
                                                ? (opt === 'correct' ? "border-green-500 bg-green-50 text-green-700" :
                                                    opt === 'partial' ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-red-500 bg-red-50 text-red-700")
                                                : "border-gray-200 hover:bg-gray-50 text-gray-600"
                                        )}
                                    >
                                        {opt === 'correct' && <CheckCircle size={18} className="mr-3" />}
                                        {opt === 'partial' && <HelpCircle size={18} className="mr-3" />}
                                        {opt === 'wrong' && <XCircle size={18} className="mr-3" />}
                                        <span className="capitalize">{opt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quality Score */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quality Score (1-10)</label>
                            <input
                                type="number"
                                min="1" max="10"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Add comments..."
                            />
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <button className="w-full flex justify-center items-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                            <Save size={18} className="mr-2" /> Save & Next
                        </button>
                        <button className="w-full flex justify-center items-center px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            <Trash2 size={18} className="mr-2" /> Discard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnotationQueueDetail;
