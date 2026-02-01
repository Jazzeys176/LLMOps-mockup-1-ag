import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

            {/* Main Content Area */}
            <div
                className={clsx(
                    "flex-1 flex flex-col transition-all duration-300",
                    isSidebarOpen ? "ml-[205px]" : "ml-16"
                )}
            >
                {/* Top Header */}
                <header className="h-16 bg-white border-b flex items-center px-6 sticky top-0 z-40 shadow-sm">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-100 mr-4 text-gray-600"
                    >
                        <Menu size={20} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">
                        {/* Could be dynamic based on route */}
                        Smart Factory LLMOps
                    </h2>
                    <div className="ml-auto flex items-center gap-4">
                        <span className="text-sm text-gray-500">Admin User</span>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
