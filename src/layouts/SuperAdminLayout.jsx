import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Users, Layers, LogOut, ChevronLeft, ChevronRight, Menu, 
  ArrowLeft, Shield, CheckCircle2, BarChart3, Palette, Server, LayoutDashboard
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function SuperAdminLayout() {
  const [open, setOpen] = useState(window.innerWidth > 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppContext();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Overview & Analytics", path: "/super-admin", icon: BarChart3, exact: true },
    { label: "Client Tenants", path: "/super-admin/tenants", icon: Users },
    { label: "Theme & Branding Studio", path: "/super-admin/branding", icon: Palette },
    { label: "Platform Master APIs", path: "/super-admin/platform-apis", icon: Server },
  ];

  return (
    <div className="flex min-h-screen bg-[#FBFBFB] text-zinc-900 font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Super Admin Minimalist Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          bg-white border-r border-zinc-200/80
          transition-all duration-200
          flex flex-col
          ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${open ? "lg:w-64" : "lg:w-18"}
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center px-4 py-4 border-b border-zinc-100 ${
            open ? "justify-between" : "justify-center"
          }`}
        >
          {open && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5B22] to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-orange-500/20">
                LC
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-zinc-900 block leading-tight">
                  Super Admin
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Master Controller</span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(false);
              else setOpen(!open);
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {open && (
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 pt-2 pb-1.5">
              Platform Control
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                title={!open ? item.label : ""}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm font-bold"
                    : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-[#FF5B22]" : "text-zinc-400"} />
                  {open && <span>{item.label}</span>}
                </div>
                {open && item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                    isActive ? "bg-[#FF5B22] text-white" : "bg-orange-100 text-[#FF5B22]"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-zinc-100">
          {open ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[11px] font-semibold text-zinc-700">
                  SA
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-zinc-900 truncate">Super Admin</div>
                  <div className="text-[10px] text-zinc-400 truncate">{user?.email || "admin@leadconnect.com"}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-zinc-400 hover:text-rose-600 transition"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-1.5 text-zinc-400 hover:text-rose-600 transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${open ? "lg:ml-60" : "lg:ml-18"}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-zinc-900">
                Super Admin Access Control
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                Multi-Tenant
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
