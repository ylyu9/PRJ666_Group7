'use client';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { useState, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        setMounted(true);
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-screen bg-[#0A0A0F] items-center justify-center">
                <div className="text-purple-400 animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0A0A0F] bg-gradient-to-br from-[#0A0A0F] via-[#13111C] to-[#170F23]">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar */}
            <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <div className="bg-[#0A0A0F]/80 backdrop-blur-sm border-b border-purple-900/20 z-10">
                    <div className="flex items-center justify-between h-16 px-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-xl text-gray-400 hover:text-purple-400 hover:bg-[#13111C] transition-all duration-200"
                            >
                                <Bars3Icon className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                Welcome back, {user?.name || 'User'}!
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 rounded-full text-gray-400 hover:text-purple-400 hover:bg-[#13111C] transition-all duration-200">
                                <span className="sr-only">View notifications</span>
                                {/* Notification icon */}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-[#0A0A0F] via-[#13111C] to-[#170F23]">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
