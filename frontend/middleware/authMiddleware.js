import { useRouter } from "next/router";
import { useEffect } from "react";

// Middleware to check if user is authenticated
export function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      // Check for token in localStorage
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        router.replace("/login"); // Redirect to login if no token/user
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
}

// Middleware to check if user is admin
export function withAdminAuth(WrappedComponent) {
  return function AdminAuthenticatedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      // Check for token and admin role
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        router.replace("/login");
        return;
      }

      // Check if user has admin role
      if (user.role !== "admin") {
        router.replace("/dashboard"); // Redirect non-admins to regular dashboard
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
}
