import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Clock, ArrowRight } from 'lucide-react';

const Sessions = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data
    const sessions = Array.from({ length: 15 }, (_, i) => ({
        id: `sess_${1000 + i}`,
        user: `user_${['alice', 'bob', 'charlie', 'daisy'][i % 4]}`,
        startTime: new Date(Date.now() - i * 1000 * 60 * 60).toLocaleString(),
        messageCount: Math.floor(Math.random() * 10) + 2,
        topic: i % 3 === 0 ? 'Machine Maintenance' : i % 3 === 1 ? 'Safety Procedures' : 'Inventory Check',
        cost: `$0.0${Math.floor(Math.random() * 8) + 1}`,
        lastMessage: 'Thank you, that helps.'
    }));

    const filteredSessions = sessions.filter(s =>
        s.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Sessions</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search user or topic..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredSessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => navigate(`/sessions/${session.id}`)}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{session.topic}</h3>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">{session.id}</span>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <span>{session.user}</span>
                                    <span>•</span>
                                    <Clock size={14} /> {session.startTime}
                                </p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-full group-hover:bg-indigo-50 transition-colors">
                                <ArrowRight size={20} className="text-gray-400 group-hover:text-indigo-600" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex gap-6 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <MessageSquare size={16} /> {session.messageCount} msgs
                                </span>
                                <span className="font-medium text-gray-900">
                                    Cost: {session.cost}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 italic max-w-md truncate">
                                Last: "{session.lastMessage}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sessions;
