import DashboardLayout from '@/components/DashboardLayout';
import { withAuth } from '@/middleware/authMiddleware';

function Progress() {
    return (
        <DashboardLayout>
            <div className="bg-[#13111C] rounded-2xl p-6 shadow-lg border border-purple-900/20">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Progress Tracking
                </h1>
                {/* Progress tracking content */}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(Progress); 