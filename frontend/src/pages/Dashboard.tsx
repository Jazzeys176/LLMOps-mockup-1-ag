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
    ArrowDownRight
} from 'lucide-react';

const KPICard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            {trend && (
                <div className={`flex items-center mt-2 text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span className="ml-1">{Math.abs(trend)}% vs last week</span>
                </div>
            )}
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
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
        { name: 'Good', value: 75, color: '#22c55e' }, // green-500
        { name: 'Bad', value: 10, color: '#ef4444' }, // red-500
        { name: 'Neutral', value: 15, color: '#3b82f6' }, // blue-500
    ];

    const tracesByName = [
        { name: 'Machine Safety', count: 450 },
        { name: 'Maintenance', count: 320 },
        { name: 'Quality Check', count: 280 },
        { name: 'Inventory', count: 150 },
        { name: 'Scheduling', count: 120 },
    ];

    const costByModel = [
        { name: 'GPT-4', cost: 125.50 },
        { name: 'GPT-3.5', cost: 45.20 },
        { name: 'Claude 2', cost: 80.00 },
        { name: 'Llama 2', cost: 15.00 },
    ];

    const evaluationScores = [
        { name: 'Hallucination', cost: 0.05, average: 0.98 },
        { name: 'Context Relevance', cost: 0.04, average: 0.92 },
        { name: 'Conciseness', cost: 0.02, average: 0.95 },
        { name: 'Toxicity', cost: 0.01, average: 0.99 },
    ];

    const modelUsage = [
        { name: 'gpt-4o', tokens: '1.2M', cost: '$120.45' },
        { name: 'gpt-3.5-turbo', tokens: '0.8M', cost: '$40.20' },
        { name: 'text-embedding-ada-002', tokens: '5.4M', cost: '$5.40' },
    ];

    return (
        <div className="space-y-6">
            {/* 1. KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard title="Total Traces" value="12,543" icon={Activity} trend={12} />
                <KPICard title="Total Cost" value="$342.50" icon={DollarSign} trend={-5} />
                <KPICard title="Total Tokens" value="4.5M" icon={Database} trend={8} />
                <KPICard title="Avg Latency" value="1.2s" icon={Clock} trend={-2} />
                <KPICard title="Satisfaction" value="NA" icon={ThumbsUp} trend={NaN} />
                <KPICard title="Task Completion" value="98.5%" icon={CheckCircle2} trend={1} />
            </div>

            {/* 2. Alert Panel */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <div className="flex items-center mb-4">
                    <AlertTriangle className="text-red-600 mr-2" />
                    <h3 className="text-lg font-bold text-red-900">Drift Detected: Context Relevance</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                    <div>
                        <p className="text-gray-500">Metric</p>
                        <p className="font-semibold text-gray-800">Relevance Score</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Current vs Baseline</p>
                        <p className="font-semibold text-red-600">NA <span className="text-gray-400">vs</span> NA</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Retrieval Overlap</p>
                        <p className="font-semibold text-gray-800">NA</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Recommendation</p>
                        <p className="font-semibold text-gray-800">NA</p>
                    </div>
                </div>
            </div>

            {/* 3. Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Active Users */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Active Users</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyActiveUsers}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Response Quality */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Response Quality</h3>
                    <div className="h-64 flex justify-between items-center">
                        <ResponsiveContainer width="60%" height="100%">
                            <PieChart>
                                <Pie
                                    data={responseQuality}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {responseQuality.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-40">
                            {responseQuality.map((item) => (
                                <div key={item.name} className="flex items-center mb-2">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">{item.name}</span>: {item.value}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Traces by Name */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Traces by Name</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tracesByName} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cost by Model */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Cost by Model</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costByModel}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evaluation Scores */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Evaluation Scores</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Score Name</th>
                                    <th className="px-4 py-3">Avg Score</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Avg Cost ($)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {evaluationScores.map((item) => (
                                    <tr key={item.name} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <span className={`font-bold ${item.average >= 0.9 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {item.average}
                                                </span>
                                                <div className="w-16 h-1.5 bg-gray-200 rounded-full ml-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.average >= 0.9 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                        style={{ width: `${item.average * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">${item.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Model Usage Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Model Usage Details</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Model Name</th>
                                    <th className="px-4 py-3">Total Tokens</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Total Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {modelUsage.map((item) => (
                                    <tr key={item.name} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">{item.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{item.tokens}</td>
                                        <td className="px-4 py-3 text-gray-600 font-medium">{item.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
