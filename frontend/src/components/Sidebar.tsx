
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    Clock,
    ClipboardCheck,
    ListTodo,
    MessageSquare,
    Database,
    AlertTriangle,
    FileText,
    ChevronLeft,
    Menu
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isOpen }: { isOpen: boolean; toggle: () => void }) => {
    // Strict requirement: Sidebar width 240px (wider for branding) when open
    const SIDEBAR_WIDTH = isOpen ? 'w-[240px]' : 'w-20';

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Tracing', icon: Activity, path: '/tracing' },
        { label: 'Sessions', icon: Clock, path: '/sessions' },
        { label: 'Evaluators', icon: ClipboardCheck, path: '/evaluators' },
        { label: 'Annotation Queues', icon: ListTodo, path: '/annotation_queue' },
        { label: 'Prompts', icon: MessageSquare, path: '/prompts' },
        { label: 'Datasets', icon: Database, path: '/datasets' },
        { label: 'Alerts', icon: AlertTriangle, path: '/alerts' },
        { label: 'Audit', icon: FileText, path: '/audit' }
    ];

    return (
        <div
            className={clsx(
                "h-screen bg-[#181D25] border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col shadow-2xl z-50 fixed left-0 top-0",
                SIDEBAR_WIDTH
            )}
        >
            {/* Header / Logo */}
            <div className="h-24 flex flex-col justify-center px-6 border-b border-slate-800/50 mb-4">
                {isOpen ? (
                    <>
                        <div className="flex items-center space-x-2 mb-1">
                            <ChevronLeft size={14} className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-500">All Use Cases</span>
                        </div>
                        <h1 className="font-bold text-xl tracking-tight text-teal-400">
                            Smart Factory AI
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">LLMOps Platform</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">PROD</span>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center font-bold text-slate-950">
                            S
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group",
                            isActive
                                ? "bg-teal-500 text-slate-950 font-semibold shadow-lg shadow-teal-500/20"
                                : "hover:bg-[#1C2028] text-slate-400 hover:text-slate-200"
                        )}
                    >
                        <item.icon size={18} className={clsx(
                            "min-w-[18px] transition-colors",
                            // isActive ? "text-slate-950" : "text-slate-500 group-hover:text-slate-300" 
                            // Icon color inherits from parent text color for simplicity and better contrast on active
                        )} />
                        {isOpen && (
                            <span className="ml-3 text-sm whitespace-nowrap overflow-hidden">
                                {item.label}
                            </span>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Footer / Settings */}
            {/* <div className="p-4 border-t border-slate-800/50">
                <button className={clsx(
                    "flex items-center px-3 py-2.5 rounded-lg w-full text-left transition-colors hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                )}>
                    <Menu size={18} className="min-w-[18px]" />
                    {isOpen && <span className="ml-3 text-sm font-medium">Settings</span>}
                </button>
            </div> */}
        </div>
    );
};

export default Sidebar;
