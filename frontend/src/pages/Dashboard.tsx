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
import { useState, useEffect } from 'react';
import { apiClient, type LiveDashboardStats } from '../api/client'; // Import API Client

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
    // State for Real Data
    const [stats, setStats] = useState<any>(null);
    const [liveStats, setLiveStats] = useState<LiveDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Stats on Mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch both regular stats and live stats in parallel
                const [regularData, liveData] = await Promise.all([
                    apiClient.getStats(),
                    apiClient.getLiveStats()
                ]);
                setStats(regularData);
                setLiveStats(liveData);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Poll every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // Daily Active Users - from live stats (JSONL)
    // Transform date format for better display
    const dailyActiveUsers = (liveStats?.daily_active_users || []).map(item => ({
        name: item.date.slice(5), // Show MM-DD format
        users: item.users
    }));

    // Model Usage from live stats (JSONL)
    const liveModelUsage = liveStats?.model_usage || [];

    const responseQuality = [
        { name: 'Excellent', value: 35, color: '#10b981' }, // emerald-500
        { name: 'Good', value: 40, color: '#3b82f6' },     // blue-500
        { name: 'Acceptable', value: 15, color: '#f59e0b' }, // amber-500
        { name: 'Poor', value: 10, color: '#ef4444' },      // red-500
    ];

    // Traces by Name and Cost by Model - from live stats (JSONL)
    const tracesByName = liveStats?.traces_by_name || [];
    const costByModel = liveStats?.cost_by_model || [];

    // ... (rest of mock chart data)

    // ... (rest of mock chart data)

    // Use real tables data
    const evaluationScores = stats?.evaluation_summary || [];
    const modelUsage = stats?.model_usage_details || [];

    const chartAxisStyle = { stroke: '#94a3b8', fontSize: 12 };
    const chartGridStyle = { stroke: '#334155' }; // Slate 700

    if (loading) {
        return <div className="p-8 text-slate-400">Loading Dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* 1. Header & Context */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
                    <p className="text-slate-400">LLM observability and monitoring</p>
                </div>
                {liveStats?.computed_at && (
                    <div className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                        Last updated: {new Date(liveStats.computed_at).toLocaleString()}
                    </div>
                )}
            </div>

            {/* 2. KPI Cards Row - Using Live Data from JSONL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Traces" value={(liveStats?.total_traces || 0).toLocaleString()} subtext="All time" icon={Activity} colorClass="text-blue-400 bg-blue-500/10" />
                <KPICard title="Total Cost" value={`$${(liveStats?.total_cost || 0).toFixed(6)}`} subtext="API costs" icon={DollarSign} colorClass="text-emerald-400 bg-emerald-500/10" />
                <KPICard title="Total Tokens" value={(liveStats?.total_tokens || 0).toLocaleString()} subtext="Input + Output" icon={Database} colorClass="text-purple-400 bg-purple-500/10" />
                <KPICard title="Avg Latency" value={`${(liveStats?.avg_latency || 0).toFixed(1)}ms`} subtext="Per trace" icon={Clock} colorClass="text-amber-400 bg-amber-500/10" />

                <KPICard title="User Satisfaction" value="NA" subtext="Stable" icon={ThumbsUp} trend={3} colorClass="text-teal-400 bg-teal-500/10" />
                <KPICard title="Task Completion" value="NA" subtext="Users completing task" icon={CheckCircle2} trend={NaN} colorClass="text-indigo-400 bg-indigo-500/10" />
                <KPICard title="First Response Accuracy" value={`${stats?.first_response_accuracy || 0}%`} subtext="Correct on first attempt" icon={MessageSquare} trend={2} colorClass="text-cyan-400 bg-cyan-500/10" />
                <KPICard title="Escalation Rate" value={`${stats?.escalation_rate || 0}%`} subtext="Needed human assistance" icon={ShieldAlert} trend={-2} colorClass="text-rose-400 bg-rose-500/10" />
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
                            <h4 className="text-2xl font-bold text-slate-100">NA</h4>
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
                            <h4 className="text-2xl font-bold text-slate-100">NA</h4>
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
                            {evaluationScores.map((item: any) => (
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

            {/* 7. Model Usage Details - Live Data from JSONL */}
            <div className="bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Model Usage Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Model</th>
                                <th className="px-6 py-3">Traces</th>
                                <th className="px-6 py-3">Tokens</th>
                                <th className="px-6 py-3">Cost (USD)</th>
                                <th className="px-6 py-3 rounded-r-lg">Avg Latency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {liveModelUsage.map((item: any) => (
                                <tr key={item.model} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{item.model}</td>
                                    <td className="px-6 py-4 font-mono">{Number(item.count).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono">{Number(item.tokens).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono text-slate-200">${item.cost.toFixed(6)}</td>
                                    <td className="px-6 py-4 font-mono">{item.avg_latency.toFixed(1)}ms</td>
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
