import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans">
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

            {/* Main Content Area */}
            <div
                className={clsx(
                    "flex-1 flex flex-col transition-all duration-300",
                    isSidebarOpen ? "ml-[240px]" : "ml-20"
                )}
            >
                {/* Top Header - Minimal Dark */}
                <header className="h-14 bg-slate-950/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-40 border-b border-slate-800/50">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-slate-800 mr-4 text-slate-400 transition-colors"
                    >
                        <Menu size={18} />
                    </button>

                    {/* Breadcrumbs or Title could go here, but Dashboard has its own title */}

                    <div className="ml-auto flex items-center gap-4">
                        {/* Search or Notifications could go here */}

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-slate-200">Admin User</p>
                                <p className="text-xs text-slate-500">Platform Admin</p>
                            </div>
                            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
