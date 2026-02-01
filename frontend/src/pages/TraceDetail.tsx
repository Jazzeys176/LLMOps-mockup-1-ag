import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Clock, Database, DollarSign, Activity, CheckCircle2,
    FileText, List, MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

const MetricCard = ({ title, value, icon: Icon, color = "text-gray-600" }: any) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={clsx("p-3 rounded-lg bg-gray-50", color)}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const ScoreCard = ({ title, score }: { title: string; score: number }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">{title}</span>
            <span className={clsx(
                "text-sm font-bold px-2 py-0.5 rounded-full",
                score >= 0.9 ? "bg-green-100 text-green-700" :
                    score >= 0.7 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
            )}>
                {score}
            </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
                className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    score >= 0.9 ? "bg-green-500" : score >= 0.7 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${score * 100}%` }}
            />
        </div>
    </div>
);

const TraceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'input' | 'output' | 'metadata'>('input');

    // Mock Data
    const trace = {
        id: id || 'trace_xyz789',
        name: 'Safety Protocol Query',
        timestamp: '2026-02-01T10:30:45Z',
        latency: '1.24s',
        tokens: 552,
        cost: '$0.008',
        status: 'success',
        scores: {
            hallucination: 0.95,
            relevance: 0.88,
            conciseness: 0.92
        },
        input: "What is the safety procedure for Machine X-500? specifically regarding LOTO.",
        output: "For Machine X-500, follow these safety steps:\n1. Verify LOTO (Lock-Out Tag-Out) is engaged.\n2. Wear required PPE: safety glasses, gloves, steel-toe boots.\n3. Check emergency stop accessibility.\n4. Perform visual inspection for damage.",
        metadata: {
            model: "gpt-4-turbo",
            user_id: "user_12345",
            temperature: 0.3,
            top_k: 5,
            retrieved_docs: [
                "doc_x500_safety_v2.pdf",
                "doc_loto_procedures.pdf"
            ]
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/tracing')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{trace.name}</h1>
                    <p className="text-sm text-gray-500 font-mono text-xs">{trace.id} • {trace.timestamp}</p>
                </div>
                <div className="ml-auto">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center">
                        <CheckCircle2 size={14} className="mr-1" /> Success
                    </span>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Latency" value={trace.latency} icon={Clock} color="text-blue-600" />
                <MetricCard title="Tokens" value={trace.tokens} icon={Database} color="text-purple-600" />
                <MetricCard title="Cost" value={trace.cost} icon={DollarSign} color="text-green-600" />
                <MetricCard title="Activity" value="Chat" icon={Activity} color="text-orange-600" />
            </div>

            {/* Evaluation Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreCard title="Hallucination Score" score={trace.scores.hallucination} />
                <ScoreCard title="Context Relevance" score={trace.scores.relevance} />
                <ScoreCard title="Conciseness" score={trace.scores.conciseness} />
            </div>

            {/* Tabbed Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('input')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'input' ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <MessageSquare size={16} className="mr-2" /> Input
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'output' ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <FileText size={16} className="mr-2" /> Output
                    </button>
                    <button
                        onClick={() => setActiveTab('metadata')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'metadata' ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <List size={16} className="mr-2" /> Metadata
                    </button>
                </div>

                <div className="p-6 min-h-[300px] bg-gray-50/50">
                    {activeTab === 'input' && (
                        <div className="bg-white p-4 rounded-lg border border-gray-100 font-mono text-sm whitespace-pre-wrap text-gray-800">
                            {trace.input}
                        </div>
                    )}
                    {activeTab === 'output' && (
                        <div className="bg-white p-4 rounded-lg border border-gray-100 font-mono text-sm whitespace-pre-wrap text-gray-800">
                            {trace.output}
                        </div>
                    )}
                    {activeTab === 'metadata' && (
                        <div className="bg-white p-4 rounded-lg border border-gray-100 font-mono text-sm text-gray-800">
                            <pre>{JSON.stringify(trace.metadata, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TraceDetail;
