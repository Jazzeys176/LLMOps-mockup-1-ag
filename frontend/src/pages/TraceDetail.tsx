import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Clock, Database, DollarSign, Activity, CheckCircle2,
    FileText, List, MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

const MetricCard = ({ title, value, icon: Icon, color = "text-slate-400" }: any) => (
    <div className="bg-[#181D25] p-4 rounded-xl shadow-sm border border-slate-800 flex items-center space-x-4">
        <div className={clsx("p-3 rounded-lg bg-slate-900", color)}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <h3 className="text-xl font-bold text-slate-100">{value}</h3>
        </div>
    </div>
);

const ScoreCard = ({ title, score }: { title: string; score: number }) => (
    <div className="bg-[#181D25] p-4 rounded-xl shadow-sm border border-slate-800">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-400">{title}</span>
            <span className={clsx(
                "text-sm font-bold px-2 py-0.5 rounded-full",
                score >= 0.9 ? "bg-emerald-950/30 text-emerald-500 border border-emerald-900/30" :
                    score >= 0.7 ? "bg-amber-950/30 text-amber-500 border border-amber-900/30" : "bg-rose-950/30 text-rose-500 border border-rose-900/30"
            )}>
                {score}
            </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
                className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    score >= 0.9 ? "bg-emerald-500" : score >= 0.7 ? "bg-amber-500" : "bg-rose-500"
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
                    className="p-2 hover:bg-[#1C2028] text-slate-400 hover:text-slate-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">{trace.name}</h1>
                    <p className="text-sm text-slate-500 font-mono text-xs">{trace.id} • {trace.timestamp}</p>
                </div>
                <div className="ml-auto">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium rounded-full flex items-center">
                        <CheckCircle2 size={14} className="mr-1" /> Success
                    </span>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Latency" value={trace.latency} icon={Clock} color="text-blue-400" />
                <MetricCard title="Tokens" value={trace.tokens} icon={Database} color="text-purple-400" />
                <MetricCard title="Cost" value={trace.cost} icon={DollarSign} color="text-emerald-400" />
                <MetricCard title="Activity" value="Chat" icon={Activity} color="text-amber-400" />
            </div>

            {/* Evaluation Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreCard title="Hallucination Score" score={trace.scores.hallucination} />
                <ScoreCard title="Context Relevance" score={trace.scores.relevance} />
                <ScoreCard title="Conciseness" score={trace.scores.conciseness} />
            </div>

            {/* Tabbed Content */}
            <div className="bg-[#181D25] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
                <div className="flex border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('input')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'input' ? "border-teal-500 text-teal-400 bg-slate-900" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                        )}
                    >
                        <MessageSquare size={16} className="mr-2" /> Input
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'output' ? "border-teal-500 text-teal-400 bg-slate-900" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                        )}
                    >
                        <FileText size={16} className="mr-2" /> Output
                    </button>
                    <button
                        onClick={() => setActiveTab('metadata')}
                        className={clsx(
                            "px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2",
                            activeTab === 'metadata' ? "border-teal-500 text-teal-400 bg-slate-900" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                        )}
                    >
                        <List size={16} className="mr-2" /> Metadata
                    </button>
                </div>

                <div className="p-6 min-h-[300px] bg-slate-950/30">
                    {activeTab === 'input' && (
                        <div className="bg-[#13161c] p-4 rounded-lg border border-slate-800 font-mono text-sm whitespace-pre-wrap text-slate-300">
                            {trace.input}
                        </div>
                    )}
                    {activeTab === 'output' && (
                        <div className="bg-[#13161c] p-4 rounded-lg border border-slate-800 font-mono text-sm whitespace-pre-wrap text-slate-300">
                            {trace.output}
                        </div>
                    )}
                    {activeTab === 'metadata' && (
                        <div className="bg-[#13161c] p-4 rounded-lg border border-slate-800 font-mono text-sm text-slate-300">
                            <pre>{JSON.stringify(trace.metadata, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TraceDetail;
