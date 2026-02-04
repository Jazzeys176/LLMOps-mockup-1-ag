import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Bot, Clock, DollarSign, Calculator } from 'lucide-react';
import clsx from 'clsx';
import { apiClient, type Session, type TraceBubble } from '../api/client';

const SessionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<TraceBubble[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Parallel fetch:
                // 1. Get Session Metadata (by searching for the ID)
                // 2. Get Trace Bubbles
                const [sessionsList, bubbles] = await Promise.all([
                    apiClient.getSessions(1, 1, id),
                    apiClient.getSessionTraces(id)
                ]);

                if (sessionsList && sessionsList.length > 0) {
                    setSession(sessionsList[0]);
                }
                setMessages(bubbles);

            } catch (err) {
                console.error("Failed to load session details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading Session...</div>;
    }

    if (!session && !loading) {
        // Fallback if session metadata not found but we have ID
        return (
            <div className="p-8 text-center text-slate-400">
                <p>Session Metadata not found.</p>
                <button onClick={() => navigate('/sessions')} className="text-teal-400 mt-4">Back to Sessions</button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6 shrink-0">
                <button
                    onClick={() => navigate('/sessions')}
                    className="p-2 hover:bg-[#1C2028] text-slate-400 hover:text-slate-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Session {session?.id || id}</h1>
                    <p className="text-sm text-slate-500 flex items-center gap-4 mt-1">
                        <span className="flex items-center"><User size={14} className="mr-1" /> {session?.user || 'Unknown'}</span>
                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {session?.created || '-'}</span>
                    </p>
                </div>
                <div className="ml-auto flex gap-4">
                    <div className="bg-[#181D25] border border-slate-800 rounded-lg px-4 py-2 flex items-center shadow-sm">
                        <Calculator size={16} className="text-purple-500 mr-2" />
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tokens</p>
                            <p className="font-mono font-medium text-slate-200">{session?.totalTokens || '0'}</p>
                        </div>
                    </div>
                    <div className="bg-[#181D25] border border-slate-800 rounded-lg px-4 py-2 flex items-center shadow-sm">
                        <DollarSign size={16} className="text-green-500 mr-2" />
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cost</p>
                            <p className="font-mono font-medium text-slate-200">{session?.totalCost || '$0.00'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-[#181D25] rounded-xl border border-slate-800 p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">No interactions found for this session.</div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={`${msg.trace_id}-${idx}`}
                            className={clsx(
                                "flex max-w-3xl",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            {/* Avatar */}
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                msg.role === 'user' ? "bg-indigo-900/30 text-indigo-400 ml-4 border border-indigo-500/20" : "bg-emerald-900/30 text-emerald-400 mr-4 border border-emerald-500/20"
                            )}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            {/* Bubble */}
                            <div className={clsx(
                                "rounded-2xl p-4 shadow-sm text-sm whitespace-pre-wrap leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-indigo-600/20 text-indigo-100 rounded-tr-none border border-indigo-500/20"
                                    : "bg-slate-800/50 text-slate-200 border border-slate-700 rounded-tl-none"
                            )}>
                                {msg.content}

                                <div className={clsx(
                                    "mt-2 pt-2 border-t flex items-center justify-between text-xs font-mono",
                                    msg.role === 'user' ? "border-indigo-500/20 text-indigo-300/50" : "border-slate-700 text-slate-500"
                                )}>
                                    <span>{msg.timestamp}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SessionDetail;
