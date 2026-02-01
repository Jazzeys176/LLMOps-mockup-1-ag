import { useState } from 'react';
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
    ChevronRight,
    Menu
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
    // Strict requirement: Sidebar width 205px when open
    const SIDEBAR_WIDTH = isOpen ? 'w-[205px]' : 'w-16';

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Tracing', icon: Activity, path: '/tracing' },
        { label: 'Sessions', icon: Clock, path: '/sessions' },
        { label: 'Evaluators', icon: ClipboardCheck, path: '/evaluators' },
        { label: 'Annotation Queues', icon: ListTodo, path: '/annotation_queue' },
        { label: 'Prompts', icon: MessageSquare, path: '/prompts' },
        { label: 'Datasets', icon: Database, path: '/datasets' },
        { label: 'Alerts', icon: AlertTriangle, path: '/alerts' },
        { label: 'Audit Logs', icon: FileText, path: '/audit' },
    ];

    return (
        <div
            className={clsx(
                "h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col shadow-xl z-50 fixed left-0 top-0",
                SIDEBAR_WIDTH
            )}
        >
            {/* Header / Logo */}
            <div className="h-16 flex items-center px-4 border-b border-white/10">
                {isOpen ? (
                    <span className="font-bold text-xl tracking-wide">Acme Corp</span>
                ) : (
                    <span className="font-bold text-xl">A</span>
                )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center px-4 py-3 mb-1 transition-colors hover:bg-white/10",
                            isActive && "bg-primary text-white border-r-4 border-white"
                        )}
                    >
                        <item.icon size={20} className="min-w-[20px]" />
                        {isOpen && (
                            <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
                                {item.label}
                            </span>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Collapse Button */}
            {/* User requested "hidden using a button". Usually this means collapse/expand. */}
        </div>
    );
};

export default Sidebar;
