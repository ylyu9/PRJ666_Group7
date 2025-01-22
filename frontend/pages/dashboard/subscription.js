import DashboardLayout from '@/components/DashboardLayout';
import { withAuth } from '@/middleware/authMiddleware';

function Subscription() {
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold">Subscription Plan</h1>
            {/* Subscription plan content */}
        </DashboardLayout>
    );
}

export default withAuth(Subscription); 