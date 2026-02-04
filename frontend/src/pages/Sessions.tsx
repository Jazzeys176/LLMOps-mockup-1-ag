import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { apiClient, type Session } from '../api/client';

const Sessions = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            try {
                const data = await apiClient.getSessions(currentPage, ITEMS_PER_PAGE, searchQuery);
                setSessions(data);
            } catch (err) {
                console.error("Failed to fetch sessions", err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchSessions, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchQuery]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Sessions</h1>
                    <p className="text-slate-500 mt-1">Page {currentPage}</p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="pl-10 pr-4 py-2 border border-slate-800 rounded-lg text-sm bg-[#181D25] text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-slate-600 w-64"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#181D25] rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-slate-100">All Sessions</h2>
                </div>
                {loading && sessions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Loading Sessions...</div>
                ) : (
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
                                {sessions.map((session) => (
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
                )}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between p-4 border-t border-slate-800">
                    <div className="text-sm text-slate-400">
                        {loading ? 'Loading...' : `Showing page ${currentPage}`}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={clsx(
                                "p-2 rounded-lg border border-slate-800 text-slate-300 transition-colors",
                                currentPage === 1
                                    ? "opacity-50 cursor-not-allowed bg-slate-900"
                                    : "hover:bg-[#1C2028] bg-[#181D25]"
                            )}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={sessions.length < ITEMS_PER_PAGE}
                            className={clsx(
                                "p-2 rounded-lg border border-slate-800 text-slate-300 transition-colors",
                                sessions.length < ITEMS_PER_PAGE
                                    ? "opacity-50 cursor-not-allowed bg-slate-900"
                                    : "hover:bg-[#1C2028] bg-[#181D25]"
                            )}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sessions;
