import {
    Bell, AlertTriangle, Info, Filter
} from 'lucide-react';
import clsx from 'clsx';

const Alerts = () => {
    // Mock Messages
    const alerts = [
        {
            id: 'alert_1',
            type: 'critical',
            title: 'Drift Detected in Safety Model',
            message: 'Safety model quality score dropped below 0.85 threshold in production.',
            metric: 'Quality Score',
            threshold: '0.85',
            current_value: '0.78',
            timestamp: '2026-02-01 14:30',
            status: 'active'
        },
        {
            id: 'alert_2',
            type: 'warning',
            title: 'High Latency on Parsing Service',
            message: 'Average latency exceeded 2s for last 5 minutes.',
            metric: 'Latency',
            threshold: '2000ms',
            current_value: '2450ms',
            timestamp: '2026-02-01 12:15',
            status: 'active'
        },
        {
            id: 'alert_3',
            type: 'info',
            title: 'New Model Version Deployed',
            message: 'Model v2.1.0 successfully deployed to staging.',
            metric: 'Deployment',
            threshold: '-',
            current_value: 'Success',
            timestamp: '2026-02-01 10:00',
            status: 'resolved'
        },
        {
            id: 'alert_4',
            type: 'critical',
            title: 'Cost Spikes Detected',
            message: 'Hourly cost exceeded budget by 150%.',
            metric: 'Cost',
            threshold: '$10/hr',
            current_value: '$25/hr',
            timestamp: '2026-01-31 23:00',
            status: 'resolved'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
                <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium">
                    <Filter size={16} className="mr-2" /> Filter Alerts
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Critical Alerts</p>
                        <h3 className="text-2xl font-bold text-gray-900">2</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                        <Bell size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Warnings</p>
                        <h3 className="text-2xl font-bold text-gray-900">5</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Info size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Infos (Last 24h)</p>
                        <h3 className="text-2xl font-bold text-gray-900">12</h3>
                    </div>
                </div>
            </div>

            {/* Alerts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-6 py-4">Severity</th>
                            <th className="px-6 py-4">Alert</th>
                            <th className="px-6 py-4">Metric</th>
                            <th className="px-6 py-4">Threshold</th>
                            <th className="px-6 py-4">Value</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {alerts.map(alert => (
                            <tr key={alert.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    {alert.type === 'critical' && <span className="flex items-center text-red-600 font-bold"><AlertTriangle size={16} className="mr-2" /> Critical</span>}
                                    {alert.type === 'warning' && <span className="flex items-center text-yellow-600 font-bold"><Bell size={16} className="mr-2" /> Warning</span>}
                                    {alert.type === 'info' && <span className="flex items-center text-blue-600 font-bold"><Info size={16} className="mr-2" /> Info</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{alert.title}</div>
                                    <div className="text-xs text-gray-500">{alert.message}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{alert.metric}</td>
                                <td className="px-6 py-4 font-mono text-gray-500">{alert.threshold}</td>
                                <td className="px-6 py-4 font-mono font-bold text-gray-800">{alert.current_value}</td>
                                <td className="px-6 py-4 text-gray-500">{alert.timestamp}</td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "px-2 py-1 rounded-full text-xs font-semibold capitalize",
                                        alert.status === 'active' ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
                                    )}>
                                        {alert.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Alerts;
