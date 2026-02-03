import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const Sessions = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data matching the screenshot style
    const sessions = [
        { id: 'session-0', user: 'user-20', traces: 0, totalTokens: 0, totalCost: '$0.000000', created: '28/01/2026, 13:32:35' },
        { id: 'session-18', user: 'user-11', traces: 4, totalTokens: '6,726', totalCost: '$0.001327', created: '25/01/2026, 07:47:13' },
        { id: 'session-48', user: 'user-7', traces: 7, totalTokens: '13,284', totalCost: '$0.030057', created: '24/01/2026, 03:30:06' },
        { id: 'session-45', user: 'user-9', traces: 8, totalTokens: '14,106', totalCost: '$0.031576', created: '23/01/2026, 08:25:38' },
        { id: 'session-35', user: 'user-2', traces: 7, totalTokens: '10,372', totalCost: '$0.018268', created: '23/01/2026, 01:58:23' },
        { id: 'session-6', user: 'user-18', traces: 12, totalTokens: '20,814', totalCost: '$0.038037', created: '23/01/2026, 01:22:33' },
        { id: 'session-13', user: 'user-20', traces: 7, totalTokens: '12,266', totalCost: '$0.049325', created: '23/01/2026, 00:59:29' },
        { id: 'session-22', user: 'user-18', traces: 8, totalTokens: '15,470', totalCost: '$0.010775', created: '23/01/2026, 00:22:31' },
        { id: 'session-42', user: 'user-16', traces: 8, totalTokens: '14,602', totalCost: '$0.002820', created: '22/01/2026, 23:16:54' },
        { id: 'session-33', user: 'user-5', traces: 15, totalTokens: '28,910', totalCost: '$0.051204', created: '22/01/2026, 19:45:11' },
    ];

    const filteredSessions = sessions.filter(s =>
        s.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Sessions</h1>
                    <p className="text-slate-500 mt-1">50 sessions</p>
                </div>

                {/* Search - Kept as requested */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="pl-10 pr-4 py-2 border border-slate-800 rounded-lg text-sm bg-[#181D25] text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-slate-600 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#181D25] rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-slate-100">All Sessions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Session ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4 text-center">Traces</th>
                                <th className="px-6 py-4 text-right">Total Tokens</th>
                                <th className="px-6 py-4 text-right">Total Cost</th>
                                <th className="px-6 py-4">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredSessions.map((session) => (
                                <tr
                                    key={session.id}
                                    onClick={() => navigate(`/sessions/${session.id}`)}
                                    className="hover:bg-[#1C2028] cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs font-mono font-medium border border-slate-700 group-hover:bg-slate-700 transition-colors">
                                            {session.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-300">{session.user}</td>
                                    <td className="px-6 py-4 text-center text-slate-300 font-mono">{session.traces}</td>
                                    <td className="px-6 py-4 text-right text-slate-300 font-mono">{session.totalTokens}</td>
                                    <td className="px-6 py-4 text-right text-slate-300 font-mono">{session.totalCost}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{session.created}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Sessions;
