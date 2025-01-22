import { withAuth } from '@/middleware/authMiddleware';
import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';

function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
                    Welcome back, {user?.name}!
                </h1>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-dark-100/50 backdrop-blur-sm border border-purple-500/10 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 p-6">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white">Your Progress</h3>
                        <p className="mt-2 text-gray-400">Track your fitness journey</p>
                    </div>
                    {/* Add more cards here */}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(Dashboard); 