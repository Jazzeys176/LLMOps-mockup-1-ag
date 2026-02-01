import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const Tracing = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('latency'); // latency, tokens, cost

    // Mock Traces
    const traces = Array.from({ length: 30 }, (_, i) => ({
        id: `trace_${i}`,
        timestamp: new Date(Date.now() - i * 1000 * 60).toISOString(),
        name: i % 3 === 0 ? 'Safety Query' : i % 3 === 1 ? 'Maintenance Schedule' : 'Parts Lookup',
        input: `User input sample for trace ${i}...`,
        latency: `${(Math.random() * 2).toFixed(2)}s`,
        tokens: Math.floor(Math.random() * 1000) + 100,
        cost: `$0.0${Math.floor(Math.random() * 9) + 1}`
    }));

    // Filtering Logic (Mock)
    const filteredTraces = traces.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Trace Explorer</h1>

                <div className="flex items-center space-x-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white">
                            <Filter size={16} className="text-gray-500 mr-2" />
                            <select
                                className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer"
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value)}
                            >
                                <option value="latency">Sort: Latency</option>
                                <option value="tokens">Sort: Tokens</option>
                                <option value="cost">Sort: Cost</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Trace Name</th>
                                <th className="px-6 py-4">Input Snippet</th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">
                                    <div className="flex items-center">
                                        Latency <ArrowUpDown size={14} className="ml-1 opacity-0 group-hover:opacity-50" />
                                    </div>
                                </th>
                                <th className="px-6 py-4">Tokens</th>
                                <th className="px-6 py-4">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTraces.map((trace) => (
                                <tr
                                    key={trace.id}
                                    onClick={() => navigate(`/tracing/${trace.id}`)}
                                    className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{trace.timestamp}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{trace.name}</td>
                                    <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{trace.input}</td>
                                    <td className="px-6 py-4 text-gray-600">{trace.latency}</td>
                                    <td className="px-6 py-4 text-gray-600">{trace.tokens}</td>
                                    <td className="px-6 py-4 text-gray-600">{trace.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <span className="text-sm text-gray-500">Showing 1-30 of 1,245 traces</span>
                    <div className="flex space-x-2">
                        <button className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tracing;
