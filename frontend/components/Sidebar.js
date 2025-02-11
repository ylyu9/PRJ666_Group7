"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: HomeIcon,
      href: "/dashboard",
    },
    {
      name: "Profile",
      icon: UserIcon,
      href: "/dashboard/profile",
    },
    {
      name: "Subscription Plan",
      icon: CreditCardIcon,
      href: "/dashboard/subscription",
    },
    {
      name: "Diet Plan",
      icon: ClipboardDocumentListIcon,
      href: "/dashboard/diet",
    },
    {
      name: "Workout Plan",
      icon: HeartIcon,
      href: "/dashboard/workout",
    },
    {
      name: "Progress Tracking",
      icon: ChartBarIcon,
      href: "/dashboard/progress",
    },
    {
      name: "Settings",
      icon: Cog6ToothIcon,
      href: "/dashboard/settings",
    },
  ];

  if (!mounted) {
    return null;
  }

  const isActiveRoute = (path) => router.pathname === path;

  return (
    <div className="hidden md:flex md:flex-col md:w-64 bg-[#0A0A0F]/95 backdrop-blur-sm border-r border-purple-900/20">
      <div className="flex items-center justify-center h-16 border-b border-purple-900/20">
        <Link
          href="/dashboard"
          className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 
                        bg-clip-text text-transparent hover:from-purple-400 hover:via-violet-500 hover:to-fuchsia-500 
                        transition-all duration-300"
        >
          CoreHealth AI
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                                    ${
                                      isActive
                                        ? "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                                        : "text-gray-400 hover:bg-[#13111C] hover:text-purple-400"
                                    }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-purple-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 mt-auto">
          <div className="border-t border-purple-900/20 pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-[#13111C] hover:text-purple-400 rounded-xl transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-purple-400" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
