import { useState } from 'react';
import {
    Database, Play, ChevronRight, BarChart2,
    List, CheckCircle, Clock
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import clsx from 'clsx';

const Datasets = () => {
    const [selectedDatasetId, setSelectedDatasetId] = useState('ds_1');
    const [activeTab, setActiveTab] = useState<'items' | 'runs' | 'trends'>('items');

    // Mock Datasets
    const datasets = [
        {
            id: 'ds_1',
            name: 'Safety Golden Set',
            description: 'Curated list of 500+ safety Q&A pairs for evaluation.',
            items_count: 512,
            last_run: '2026-02-01 10:00'
        },
        {
            id: 'ds_2',
            name: 'Maintenance Logs',
            description: 'Real-world queries extracted from maintenance shift logs.',
            items_count: 1240,
            last_run: '2026-01-30 14:00'
        },
        {
            id: 'ds_3',
            name: 'Adversarial Attacks',
            description: 'Red-teaming dataset for safety testing.',
            items_count: 50,
            last_run: '2026-01-25 09:00'
        }
    ];

    // Mock Items
    const items = Array.from({ length: 15 }, (_, i) => ({
        id: `item_${i}`,
        input: `Safety Query Example ${i + 1}`,
        expected: `Expected safe response for query ${i + 1}...`,
        tags: i % 2 === 0 ? ['safety', 'procedure'] : ['general']
    }));

    // Mock Runs
    const runs = [
        { id: 'run_101', timestamp: '2026-02-01 10:00', model: 'gpt-4-turbo', score: 0.92, latency: '1.2s', pass_rate: '98%' },
        { id: 'run_102', timestamp: '2026-01-31 09:00', model: 'gpt-4-turbo', score: 0.89, latency: '1.4s', pass_rate: '94%' },
        { id: 'run_103', timestamp: '2026-01-30 14:00', model: 'gpt-3.5-turbo', score: 0.78, latency: '0.8s', pass_rate: '82%' }
    ];

    // Mock Trends
    const trendData = [
        { date: 'Jan 25', score: 0.75, latency: 900 },
        { date: 'Jan 26', score: 0.78, latency: 850 },
        { date: 'Jan 27', score: 0.82, latency: 880 },
        { date: 'Jan 28', score: 0.80, latency: 1200 },
        { date: 'Jan 29', score: 0.88, latency: 950 },
        { date: 'Jan 30', score: 0.89, latency: 920 },
        { date: 'Feb 01', score: 0.92, latency: 900 },
    ];

    const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex gap-6">

            {/* Sidebar List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-700">Datasets</h2>
                    <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded hover:bg-gray-50">
                        + New Dataset
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {datasets.map(ds => (
                        <div
                            key={ds.id}
                            onClick={() => setSelectedDatasetId(ds.id)}
                            className={clsx(
                                "p-4 rounded-lg cursor-pointer border transition-all",
                                selectedDatasetId === ds.id
                                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                    : "bg-white border-transparent hover:bg-gray-50 border-gray-100"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={clsx("font-bold", selectedDatasetId === ds.id ? "text-indigo-700" : "text-gray-900")}>
                                    {ds.name}
                                </h3>
                                {selectedDatasetId === ds.id && <ChevronRight size={16} className="text-indigo-400" />}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ds.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span className="flex items-center"><Database size={12} className="mr-1" /> {ds.items_count} items</span>
                                <span className="flex items-center"><Clock size={12} className="mr-1" /> {ds.last_run}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {selectedDataset && (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedDataset.name}</h1>
                                <p className="text-gray-500 text-sm">{selectedDataset.description}</p>
                            </div>
                            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm">
                                <Play size={16} className="mr-2" /> Run Evaluation
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setActiveTab('items')}
                                className={clsx("px-6 py-3 text-sm font-medium flex items-center border-b-2 transition-colors", activeTab === 'items' ? "border-indigo-500 text-indigo-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
                            >
                                <List size={16} className="mr-2" /> Items
                            </button>
                            <button
                                onClick={() => setActiveTab('runs')}
                                className={clsx("px-6 py-3 text-sm font-medium flex items-center border-b-2 transition-colors", activeTab === 'runs' ? "border-indigo-500 text-indigo-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
                            >
                                <CheckCircle size={16} className="mr-2" /> Runs
                            </button>
                            <button
                                onClick={() => setActiveTab('trends')}
                                className={clsx("px-6 py-3 text-sm font-medium flex items-center border-b-2 transition-colors", activeTab === 'trends' ? "border-indigo-500 text-indigo-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
                            >
                                <BarChart2 size={16} className="mr-2" /> Trends
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">

                            {/* 1. Items */}
                            {activeTab === 'items' && (
                                <div className="grid grid-cols-1 gap-4">
                                    {items.map(item => (
                                        <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs font-mono text-gray-400">{item.id}</span>
                                                <div className="flex gap-1">
                                                    {item.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600 uppercase">{t}</span>)}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Input</h4>
                                                    <p className="text-sm text-gray-800">{item.input}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Expected Output</h4>
                                                    <p className="text-sm text-gray-600">{item.expected}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 2. Runs */}
                            {activeTab === 'runs' && (
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="px-6 py-3">Run ID</th>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Model</th>
                                                <th className="px-6 py-3">Avg Score</th>
                                                <th className="px-6 py-3">Avg Latency</th>
                                                <th className="px-6 py-3">Pass Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {runs.map(run => (
                                                <tr key={run.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-mono text-indigo-600">{run.id}</td>
                                                    <td className="px-6 py-4 text-gray-500">{run.timestamp}</td>
                                                    <td className="px-6 py-4 text-gray-900">{run.model}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">{run.score}</td>
                                                    <td className="px-6 py-4 text-gray-600">{run.latency}</td>
                                                    <td className="px-6 py-4 text-green-600 font-medium">{run.pass_rate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* 3. Trends */}
                            {activeTab === 'trends' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-700 mb-6">Performance Trend (Avg Score)</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={trendData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0.5, 1]} />
                                                    <RechartsTooltip
                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-700 mb-6">Latency Trend (ms)</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={trendData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                    <RechartsTooltip
                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Line type="monotone" dataKey="latency" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Datasets;
