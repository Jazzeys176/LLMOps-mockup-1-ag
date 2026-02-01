import { useState } from 'react';
import {
    ShieldCheck, Search, Filter, Download, User
} from 'lucide-react';

const AuditLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Audit Logs
    const logs = Array.from({ length: 20 }, (_, i) => ({
        id: `audit_${i}`,
        timestamp: new Date(Date.now() - i * 1000 * 60 * 15).toLocaleString(),
        type: i % 4 === 0 ? 'Access' : i % 4 === 1 ? 'Mutation' : 'Config',
        action: i % 4 === 0 ? 'User Login' : i % 4 === 1 ? 'Prompt Updated' : 'Alert Resolved',
        user: `admin_${i % 3}`,
        details: i % 4 === 1 ? 'Updated Safety Prompt v3' : 'Logged in from 10.0.0.1',
        status: 'success'
    }));

    const filteredLogs = logs.filter(l =>
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                    <Download size={16} className="mr-2" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search actions or users..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700">
                    <Filter size={16} className="mr-2" /> Filter
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs">
                                            <User size={12} />
                                        </div>
                                        {log.user}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{log.type}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{log.action}</td>
                                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{log.details}</td>
                                    <td className="px-6 py-4 text-green-600 font-medium capitalize flex items-center gap-1">
                                        <ShieldCheck size={14} /> {log.status}
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

export default AuditLogs;
