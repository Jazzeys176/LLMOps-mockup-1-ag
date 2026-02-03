import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
const Tracing = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('latency'); // latency, tokens, cost

    // Mock Traces matching the screenshot
    const traces = [
        { id: 't1', timestamp: '2/3/2026, 4:52:50 PM', name: 'multi-hop-reasoning', input: '{"query":"Compare current production effic...', latency: '3299ms', tokens: '2,897', cost: '$0.000401', scores: { hallucination: 0.17, context_relevance: 0.92, conciseness: 0.72 } },
        { id: 't2', timestamp: '2/3/2026, 4:36:10 PM', name: 'multi-hop-reasoning', input: '{"query":"Compare current production effic...', latency: '3704ms', tokens: '3,103', cost: '$0.021207', scores: { hallucination: 0.09, context_relevance: 0.89, conciseness: 0.94 } },
        { id: 't3', timestamp: '2/3/2026, 4:32:05 PM', name: 'tool-use-flow', input: '{"query":"Schedule preventive maintenance...', latency: '2577ms', tokens: '1,940', cost: '$0.008470', scores: { hallucination: 0.05, context_relevance: 0.95, conciseness: 0.78 } },
        { id: 't4', timestamp: '2/3/2026, 4:31:03 PM', name: 'tool-use-flow', input: '{"query":"Schedule preventive maintenance...', latency: '2718ms', tokens: '1,646', cost: '$0.011977', scores: { hallucination: 0.21, context_relevance: 0.99, conciseness: 0.76 } },
        { id: 't5', timestamp: '2/3/2026, 4:25:38 PM', name: 'simple-qa', input: '{"query":"What does alarm code E047 mea...', latency: '2105ms', tokens: '1,239', cost: '$0.000193', scores: { hallucination: 0.18, context_relevance: 0.87, conciseness: 0.84 } },
        { id: 't6', timestamp: '2/3/2026, 4:23:30 PM', name: 'simple-qa', input: '{"query":"What should I check if Line A sho...', latency: '3786ms', tokens: '1,994', cost: '$0.000305', scores: { hallucination: 0.20, context_relevance: 0.79, conciseness: 0.71 } },
        { id: 't7', timestamp: '2/3/2026, 4:09:36 PM', name: 'tool-use-flow', input: '{"query":"Calculate ROI for upgrading Linc ...', latency: '3691ms', tokens: '1,034', cost: '$0.000177', scores: { hallucination: 0.19, context_relevance: 0.76, conciseness: 0.92 } },
        { id: 't8', timestamp: '2/3/2026, 3:58:45 PM', name: 'tool-use-flow', input: '{"query":"Generate a safety report for the l...', latency: '3490ms', tokens: '1,329', cost: '$0.008852', scores: { hallucination: 0.01, context_relevance: 0.96, conciseness: 0.66 } },
        { id: 't9', timestamp: '2/3/2026, 3:07:20 PM', name: 'simple-qa', input: '{"query":"What should I check if Line A sho...', latency: '3795ms', tokens: '887', cost: '$0.005828', scores: { hallucination: 0.06, context_relevance: 0.94, conciseness: 0.83 } },
        { id: 't10', timestamp: '2/3/2026, 2:45:09 PM', name: 'simple-qa', input: '{"query":"How do I reset the safety interloc...', latency: '3429ms', tokens: '1,281', cost: '$0.008196', scores: { hallucination: 0.22, context_relevance: 0.84, conciseness: 0.79 } },
        { id: 't11', timestamp: '2/3/2026, 2:22:14 PM', name: 'multi-hop-reasoning', input: '{"query":"What maintenance tasks are over...', latency: '1926ms', tokens: '1,971', cost: '$0.000485', scores: { hallucination: 0.12, context_relevance: 0.84, conciseness: 0.70 } },
        { id: 't12', timestamp: '2/3/2026, 2:18:35 PM', name: 'multi-hop-reasoning', input: '{"query":"Compare current production effic...', latency: '2359ms', tokens: '2,307', cost: '$0.017187', scores: { hallucination: 0.14, context_relevance: 1.00, conciseness: 0.90 } },
        { id: 't13', timestamp: '2/3/2026, 1:21:53 PM', name: 'multi-hop-reasoning', input: '{"query":"Compare current production effic...', latency: '2866ms', tokens: '2,263', cost: '$0.014647', scores: { hallucination: 0.11, context_relevance: 0.90, conciseness: 0.80 } },

    ];

    const filteredTraces = traces.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Traces</h1>
                    <p className="text-slate-500 text-sm mt-1">500 traces</p>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search Traces..."
                            className="pl-10 pr-4 py-2 border border-slate-800 rounded-lg text-sm bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-slate-600 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#181D25] rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-100">All Traces</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#181D25] text-slate-400 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Input</th>
                                <th className="px-6 py-4">Latency</th>
                                <th className="px-6 py-4">Tokens</th>
                                <th className="px-6 py-4">Cost</th>
                                <th className="px-6 py-4">Scores</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredTraces.map((trace) => (
                                <tr
                                    key={trace.id}
                                    onClick={() => navigate(`/tracing/${trace.id}`)}
                                    className="hover:bg-[#1C2028] cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4 text-slate-400 text-xs font-mono whitespace-nowrap">{trace.timestamp}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700">
                                            {trace.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 font-mono text-xs max-w-xs truncate opacity-80 group-hover:opacity-100">
                                        {trace.input}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{trace.latency}</td>
                                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{trace.tokens}</td>
                                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{trace.cost}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <span className="px-1.5 py-0.5 rounded bg-amber-950/30 text-amber-500 border border-amber-900/30 text-[10px] font-medium font-mono">
                                                hallucination: {trace.scores.hallucination}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/30 text-emerald-500 border border-emerald-900/30 text-[10px] font-medium font-mono">
                                                context_relevance: {trace.scores.context_relevance}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/30 text-emerald-500 border border-emerald-900/30 text-[10px] font-medium font-mono">
                                                conciseness: {trace.scores.conciseness}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tracing;
