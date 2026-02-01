import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Bot, Clock, DollarSign, Calculator } from 'lucide-react';
import clsx from 'clsx';

const SessionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock Session Data
    const session = {
        id: id || 'sess_123',
        user_id: 'user_alice',
        start_time: '2026-02-01 10:00 AM',
        duration: '4m 32s',
        total_tokens: 1250,
        total_cost: '$0.045',
        messages: [
            {
                id: 'msg_1',
                role: 'user',
                content: 'How do I reset the pressure sensor on Unit 4?',
                timestamp: '10:00:05 AM',
                latency: null
            },
            {
                id: 'msg_2',
                role: 'assistant',
                content: 'To reset the pressure sensor on Unit 4, follow these steps:\n1. Locate the control panel on the north side.\n2. Press and hold the "Reset" button for 3 seconds.\n3. Wait for the LED to flash green.',
                timestamp: '10:00:08 AM',
                latency: '3.2s',
                score: 0.95
            },
            {
                id: 'msg_3',
                role: 'user',
                content: 'What if the LED turns red instead?',
                timestamp: '10:02:15 AM',
                latency: null
            },
            {
                id: 'msg_4',
                role: 'assistant',
                content: 'If the LED turns red, it indicates a calibration error. You should:\n1. Power cycle the unit.\n2. Check the sensor wiring.\n3. Call maintenance if the issue persists.',
                timestamp: '10:02:18 AM',
                latency: '2.8s',
                score: 0.88
            }
        ]
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6 shrink-0">
                <button
                    onClick={() => navigate('/sessions')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Session {session.id}</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                        <span className="flex items-center"><User size={14} className="mr-1" /> {session.user_id}</span>
                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {session.start_time}</span>
                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {session.duration}</span>
                    </p>
                </div>
                <div className="ml-auto flex gap-4">
                    <div className="bg-white border rounded-lg px-4 py-2 flex items-center shadow-sm">
                        <Calculator size={16} className="text-purple-500 mr-2" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Tokens</p>
                            <p className="font-mono font-medium">{session.total_tokens}</p>
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg px-4 py-2 flex items-center shadow-sm">
                        <DollarSign size={16} className="text-green-500 mr-2" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Cost</p>
                            <p className="font-mono font-medium">{session.total_cost}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl border border-gray-100 p-6 space-y-6">
                {session.messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex max-w-3xl",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        {/* Avatar */}
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                            msg.role === 'user' ? "bg-indigo-100 text-indigo-600 ml-4" : "bg-green-100 text-green-600 mr-4"
                        )}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        {/* Bubble */}
                        <div className={clsx(
                            "rounded-2xl p-4 shadow-sm text-sm whitespace-pre-wrap leading-relaxed",
                            msg.role === 'user'
                                ? "bg-indigo-600 text-white rounded-tr-none"
                                : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                        )}>
                            {msg.content}

                            {/* Metadata Footer for Assistant */}
                            {msg.role === 'assistant' && (
                                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400 font-mono">
                                    <span>Lat: {msg.latency}</span>
                                    <span className={clsx(
                                        "font-bold",
                                        (msg.score || 0) > 0.9 ? "text-green-600" : "text-yellow-600"
                                    )}>
                                        Score: {msg.score}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SessionDetail;
