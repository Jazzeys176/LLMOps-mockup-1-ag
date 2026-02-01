import { useNavigate } from 'react-router-dom';
import { Layers, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const AnnotationQueues = () => {
    const navigate = useNavigate();

    // Mock Queues
    const queues = [
        {
            id: 'queue_1',
            name: 'High-Risk Responses',
            description: 'Traces with hallucination score < 0.7 or negative user feedback.',
            completed: 145,
            pending: 42,
            total: 187,
            priority: 'high'
        },
        {
            id: 'queue_2',
            name: 'Drift Sampling',
            description: 'Random sampling of interactions during detected drift periods.',
            completed: 89,
            pending: 11,
            total: 100,
            priority: 'medium'
        },
        {
            id: 'queue_3',
            name: 'General Quality Audit',
            description: 'Weekly random audit of production traces.',
            completed: 320,
            pending: 180,
            total: 500,
            priority: 'low'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Annotation Queues</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {queues.map((queue) => {
                    const progress = Math.round((queue.completed / queue.total) * 100);

                    return (
                        <div
                            key={queue.id}
                            onClick={() => navigate(`/annotation_queue/${queue.id}`)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <Layers size={24} />
                                </div>
                                {queue.priority === 'high' && (
                                    <span className="flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100">
                                        <AlertTriangle size={12} className="mr-1" /> High Priority
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{queue.name}</h3>
                            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{queue.description}</p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center"><CheckCircle2 size={14} className="mr-1" /> {queue.completed} Done</span>
                                    <span className="text-gray-900 font-medium flex items-center"><Clock size={14} className="mr-1" /> {queue.pending} Pending</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs text-gray-400 font-medium">
                                    {progress}% Complete
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnnotationQueues;
