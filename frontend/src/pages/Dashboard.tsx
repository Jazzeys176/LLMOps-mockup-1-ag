import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    Activity,
    DollarSign,
    Database,
    Clock,
    ThumbsUp,
    CheckCircle2,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    MessageSquare,
    ShieldAlert
} from 'lucide-react';

const KPICard = ({ title, value, subtext, icon: Icon, trend, colorClass = "text-indigo-400 bg-indigo-500/10" }: any) => (
    <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800 flex items-start justify-between backdrop-blur-sm">
        <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
            {trend !== undefined && !isNaN(trend) && (
                <div className={`flex items-center mt-2 text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span className="ml-1">{Math.abs(trend)}% vs last week</span>
                </div>
            )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    // Mock Data
    const dailyActiveUsers = [
        { name: 'Mon', users: 1200 },
        { name: 'Tue', users: 1350 },
        { name: 'Wed', users: 1280 },
        { name: 'Thu', users: 1420 },
        { name: 'Fri', users: 1500 },
        { name: 'Sat', users: 1100 },
        { name: 'Sun', users: 950 },
    ];

    const responseQuality = [
        { name: 'Excellent', value: 35, color: '#10b981' }, // emerald-500
        { name: 'Good', value: 40, color: '#3b82f6' },     // blue-500
        { name: 'Acceptable', value: 15, color: '#f59e0b' }, // amber-500
        { name: 'Poor', value: 10, color: '#ef4444' },      // red-500
    ];

    const tracesByName = [
        { name: 'multi-hop-reasoning', count: 450 },
        { name: 'tool-use-flow', count: 320 },
        { name: 'simple-qa', count: 280 },
    ];

    const costByModel = [
        { name: 'gpt-4', cost: 125.50 },
        { name: 'gpt-3.5', cost: 45.20 },
        { name: 'claude-2', cost: 80.00 },
        { name: 'llama-2', cost: 15.00 },
    ];

    const evaluationScores = [
        { name: 'Hallucination', count: 496, average: 0.139 },
        { name: 'Context Relevance', count: 496, average: 0.814 },
        { name: 'Conciseness', count: 496, average: 0.749 },
        { name: 'Correctness', count: 61, average: 0.467 },
    ];

    const modelUsage = [
        { name: 'text-embedding-ada-002', tokens: '8,759', cost: '$0.000876' },
        { name: 'gpt-4o-mini', tokens: '275,744', cost: '$0.062445' },
        { name: 'gemini-2.5-flash', tokens: '289,080', cost: '$0.043881' },
        { name: 'gpt-4o', tokens: '280,531', cost: '$1.890975' },
    ];

    // Chart Theme
    const chartAxisStyle = { stroke: '#94a3b8', fontSize: 12 };
    const chartGridStyle = { stroke: '#334155' }; // Slate 700

    return (
        <div className="space-y-6">
            {/* 1. Header & Context */}
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
                <p className="text-slate-400">LLM observability and monitoring</p>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Traces" value="496" subtext="Last 7 days" icon={Activity} colorClass="text-blue-400 bg-blue-500/10" />
                <KPICard title="Total Cost" value="$2.0062" subtext="API costs" icon={DollarSign} colorClass="text-emerald-400 bg-emerald-500/10" />
                <KPICard title="Total Tokens" value="854.1K" subtext="Input + Output" icon={Database} colorClass="text-purple-400 bg-purple-500/10" />
                <KPICard title="Avg Latency" value="3025ms" subtext="Per trace" icon={Clock} trend={3} colorClass="text-amber-400 bg-amber-500/10" />

                <KPICard title="User Satisfaction" value="4.2 / 5.0" subtext="0.3 from last week" icon={ThumbsUp} trend={3} colorClass="text-teal-400 bg-teal-500/10" />
                <KPICard title="Task Completion" value="87%" subtext="Users completing task" icon={CheckCircle2} trend={4} colorClass="text-indigo-400 bg-indigo-500/10" />
                <KPICard title="First Response Accuracy" value="91%" subtext="Correct on first attempt" icon={MessageSquare} trend={2} colorClass="text-cyan-400 bg-cyan-500/10" />
                <KPICard title="Escalation Rate" value="8%" subtext="Needed human assistance" icon={ShieldAlert} trend={-2} colorClass="text-rose-400 bg-rose-500/10" />
            </div>

            {/* 3. Drift Alert Panel */}
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-6">
                <div className="flex items-center mb-6">
                    <AlertTriangle className="text-amber-500 mr-3" />
                    <h3 className="text-lg font-bold text-amber-500">Drift Detection Alert</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm mb-6">
                    <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Context Relevance</p>
                        <div className="flex items-baseline space-x-2">
                            <h4 className="text-2xl font-bold text-slate-100">-12%</h4>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Degrading</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">vs. 7 days ago</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Hallucination Rate</p>
                        <div className="flex items-baseline space-x-2">
                            <h4 className="text-2xl font-bold text-slate-100">+8%</h4>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Rising</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">Above threshold</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Retrieval Overlap</p>
                        <div className="flex items-baseline space-x-2">
                            <h4 className="text-2xl font-bold text-slate-100">73%</h4>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Below baseline</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">Expected: 85%+</p>
                    </div>
                </div>
                <div className="text-sm text-slate-300 bg-amber-900/20 p-3 rounded-lg border border-amber-900/30">
                    <span className="font-bold text-amber-400">Recommendation:</span> Model performance has degraded by 12% over the past week. Consider retraining with recent high-quality examples from annotation queues or updating retrieval embeddings.
                </div>
            </div>

            {/* 4. Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Active Users */}
                <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center">
                        <Activity size={18} className="mr-2 text-slate-400" /> Daily Active Users
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyActiveUsers}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} {...chartGridStyle} />
                                <XAxis dataKey="name" {...chartAxisStyle} tickLine={false} axisLine={false} />
                                <YAxis {...chartAxisStyle} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Line type="monotone" dataKey="users" stroke="#2dd4bf" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Response Quality */}
                <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">Response Quality</h3>
                    <div className="h-64 flex flex-col items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={responseQuality}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {responseQuality.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {responseQuality.map((item) => (
                                <div key={item.name} className="flex items-center text-xs text-slate-400">
                                    <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Bar Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traces by Name */}
                <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">Traces by Name</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tracesByName}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} {...chartGridStyle} />
                                <XAxis dataKey="name" {...chartAxisStyle} tickLine={false} axisLine={false} />
                                <YAxis {...chartAxisStyle} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                />
                                <Bar dataKey="count" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cost by Model */}
                <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">Cost by Model</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costByModel}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} {...chartGridStyle} />
                                <XAxis dataKey="name" {...chartAxisStyle} tickLine={false} axisLine={false} />
                                <YAxis {...chartAxisStyle} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                />
                                <Bar dataKey="cost" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 5.5 User Feedback Summary */}
            <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 mb-6">User Feedback Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Positive Feedback */}
                    <div className="flex items-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <div className="p-3 bg-emerald-500/20 rounded-lg mr-4 text-emerald-500">
                            <ThumbsUp size={24} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-slate-100">1247</h4>
                            <p className="text-sm text-slate-500">Positive Feedback</p>
                        </div>
                    </div>

                    {/* Negative Feedback */}
                    <div className="flex items-center p-4 rounded-lg bg-rose-500/5 border border-rose-500/10">
                        <div className="p-3 bg-rose-500/20 rounded-lg mr-4 text-rose-500">
                            <div className="transform rotate-180">
                                <ThumbsUp size={24} />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-slate-100">156</h4>
                            <p className="text-sm text-slate-500">Negative Feedback</p>
                        </div>
                    </div>

                    {/* Common Issues */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Common Issues Reported</h4>
                        <ul className="space-y-2">
                            {['Incomplete equipment specifications', 'Outdated maintenance procedures', 'Missing safety warnings'].map((issue, i) => (
                                <li key={i} className="flex items-start text-sm text-slate-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2 shrink-0" />
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* 6. Evaluation Scores Table */}
            <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Evaluation Scores Summary</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Score Name</th>
                                <th className="px-6 py-3">Count</th>
                                <th className="px-6 py-3 rounded-r-lg">Average</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {evaluationScores.map((item) => (
                                <tr key={item.name} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{item.name}</td>
                                    <td className="px-6 py-4">{item.count}</td>
                                    <td className="px-6 py-4 font-mono text-slate-200">{item.average}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 7. Model Usage Details */}
            <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Model Usage Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Model</th>
                                <th className="px-6 py-3">Tokens</th>
                                <th className="px-6 py-3 rounded-r-lg">Cost (USD)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {modelUsage.map((item) => (
                                <tr key={item.name} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{item.name}</td>
                                    <td className="px-6 py-4 font-mono">{item.tokens}</td>
                                    <td className="px-6 py-4 font-mono text-slate-200">{item.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
