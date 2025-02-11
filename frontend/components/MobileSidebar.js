"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HomeIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function MobileSidebar({ isOpen, onClose }) {
  const router = useRouter();

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

  const isActiveRoute = (href) => {
    if (href === "/dashboard") {
      return router.pathname === href;
    }
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
                fixed inset-y-0 left-0 w-64 bg-[#0A0A0F]/95 backdrop-blur-sm border-r border-purple-900/20 
                transform transition-transform duration-300 ease-in-out z-50 md:hidden
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-purple-900/20">
            <Link
              href="/dashboard"
              className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 
                                bg-clip-text text-transparent"
            >
              CoreHealth AI
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-purple-400 hover:bg-[#13111C] transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
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

          {/* Logout Button */}
          <div className="px-4 py-4">
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
    </>
  );
}
