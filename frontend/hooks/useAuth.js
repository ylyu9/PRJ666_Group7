import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

export function useAuth(adminRequired = false) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        setIsAuthenticated(false);
        router.replace("/login");
        return;
      }

      if (adminRequired && user.role !== "admin") {
        setIsAuthenticated(false);
        router.replace("/dashboard");
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [adminRequired, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading };
}
