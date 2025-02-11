import { withAdminAuth } from "../../middleware/authMiddleware";

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Your admin dashboard content */}
    </div>
  );
}

export default withAdminAuth(AdminDashboard);
