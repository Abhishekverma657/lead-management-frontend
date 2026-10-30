import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, X, LogOut, ChevronLeft, ChevronRight, ChevronDown, Search,
  LayoutDashboard, Flame, Users, ListTodo, Gift, 
  UserPlus, FileText, Star, FormInput, PlusCircle, Shield,
  Settings, Info, Share2, Sparkles, CheckSquare, Radio, ArrowRight, User
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function AdminLayout() {
  const [open, setOpen] = useState(window.innerWidth > 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        if (!open) setOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!open) setOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'].includes(user?.role);
  const isCaller = ['CALLER', 'AGENT', 'TELECALLER', 'COUNSELOR'].includes(user?.role);

  const adminNavItems = [
    { type: "header", label: "SALES OPERATIONS" },
    { label: "Dashboard", path: "/lead-management/dashboard", icon: LayoutDashboard },
    { label: "Focus Today", path: "/lead-management/focus-today", icon: Flame },
    { label: "Leads", path: "/lead-management/leads", icon: Users },
    { label: "Tasks", path: "/lead-management/tasks", icon: ListTodo },
    { label: "Offers", path: "/lead-management/offers", icon: Gift },

    { type: "header", label: "INSIGHTS & MANAGEMENT" },
    { label: "Live Wallboard", path: "/lead-management/wallboard", icon: Radio, badge: "LIVE" },
    { label: "Staff & Callers", path: "/lead-management/staff", icon: UserPlus },
    { label: "Reports", path: "/lead-management/staff-reports", icon: FileText },
    { label: "Rewards & Mobile", path: "/lead-management/rewards", icon: Star },
    
    { type: "header", label: "FORM BUILDER" },
    { label: "All Forms", path: "/forms", icon: FormInput },
    { label: "Create Form", path: "/forms/create", icon: PlusCircle },
  ];

  const callerNavItems = [
    { type: "header", label: "CALLER WORKSPACE" },
    { label: "My Dashboard", path: "/lead-management/dashboard", icon: LayoutDashboard },
    { label: "Focus Today", path: "/lead-management/focus-today", icon: Flame },
    { label: "My Assigned Leads", path: "/lead-management/leads", icon: Users },
    { label: "My Tasks", path: "/lead-management/tasks", icon: ListTodo },
    { label: "Active Offers", path: "/lead-management/offers", icon: Gift },
  ];

  if (isCaller && user?.permissions?.forms) {
    callerNavItems.push(
      { type: "header", label: "FORMS" },
      { label: "Assigned Forms", path: "/forms", icon: FormInput }
    );
  }

  const navItems = isAdmin ? adminNavItems : callerNavItems;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = sidebarSearch.trim();
    if (!query) return;

    // Check if query matches a nav item exactly
    const matchedNav = navItems.find(item => 
      item.type !== 'header' && item.label.toLowerCase().includes(query.toLowerCase())
    );

    if (matchedNav && query.toLowerCase() === matchedNav.label.toLowerCase()) {
      navigate(matchedNav.path);
      setSidebarSearch('');
      if (window.innerWidth < 1024) setMobileOpen(false);
      return;
    }

    // Otherwise search inside leads
    navigate(`/lead-management/leads?search=${encodeURIComponent(query)}`);
    if (window.innerWidth < 1024) setMobileOpen(false);
  };

  // Filtered Navigation Items
  const displayedNavItems = sidebarSearch.trim()
    ? navItems.filter(item => {
        if (item.type === "header") return false;
        return item.label.toLowerCase().includes(sidebarSearch.toLowerCase());
      })
    : navItems;

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const brandLogoUrl = user?.tenant?.branding?.logoUrl || "";
  const brandName = user?.tenant?.branding?.companyName || user?.tenant?.name || "Lead Connect";
  const brandSubdomain = user?.tenant?.branding?.customDomain || (user?.role === "SUPER_ADMIN" ? "Master Controller" : "CRM Workspace");
  const brandPrimaryColor = user?.tenant?.branding?.primaryColor || "#FF5B22";
  const brandAccentColor = user?.tenant?.branding?.accentColor || "#F59E0B";
  const brandInitials = (brandName || "LC").substring(0, 2).toUpperCase();

  const initials = (user?.name || user?.firstName || user?.email || "U").substring(0, 2).toUpperCase();

  // Dynamic CSS Variables Injection for Client Theme
  useEffect(() => {
    if (brandPrimaryColor) {
      document.documentElement.style.setProperty('--lc-primary', brandPrimaryColor);
      document.documentElement.style.setProperty('--lc-primary-hover', brandPrimaryColor);
      document.documentElement.style.setProperty('--lc-primary-light', `${brandPrimaryColor}15`);
    }
    if (brandAccentColor) {
      document.documentElement.style.setProperty('--lc-accent', brandAccentColor);
    }
  }, [brandPrimaryColor, brandAccentColor]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-gray-900 font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Modern Light Minimalist Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          bg-[#FAFAFA] border-r border-gray-200/80
          text-gray-800 shadow-sm
          transition-all duration-300
          flex flex-col
          ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${open ? "lg:w-64" : "lg:w-20"}
        `}
      >
        {/* Header / Brand Logo */}
        <div
          className={`flex items-center px-4 py-4 border-b border-gray-200/60 relative ${
            open ? "justify-between" : "justify-center"
          }`}
        >
          {open ? (
            <div className="flex items-center gap-3 min-w-0">
              {brandLogoUrl ? (
                <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-xs p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={brandLogoUrl} alt={brandName} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div 
                  className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-black text-xs shadow-xs tracking-tighter shrink-0"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {brandInitials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-900 tracking-tight leading-none truncate">
                  {brandName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">
                  {brandSubdomain}
                </span>
              </div>
            </div>
          ) : (
            brandLogoUrl ? (
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-xs p-0.5 flex items-center justify-center overflow-hidden">
                <img src={brandLogoUrl} alt={brandName} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div 
                className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-black text-xs shadow-xs"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                {brandInitials}
              </div>
            )
          )}

          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen(false);
              } else {
                setOpen(!open);
              }
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Sidebar Quick Search */}
        {open && (
          <div className="px-3 pt-3 pb-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <input
                ref={searchInputRef}
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search leads, pages..."
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-100/90 border border-transparent rounded-xl focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
                style={{
                  outlineColor: brandPrimaryColor
                }}
              />
              {sidebarSearch ? (
                <button
                  type="button"
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X size={12} />
                </button>
              ) : (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-gray-400 bg-white border border-gray-200 px-1 rounded shadow-2xs pointer-events-none">
                  /
                </span>
              )}
            </form>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {/* Quick Search Action Pill when typing */}
          {open && sidebarSearch.trim() && (
            <div 
              onClick={handleSearchSubmit}
              style={{
                backgroundColor: `${brandPrimaryColor}10`,
                borderColor: `${brandPrimaryColor}30`,
                color: brandPrimaryColor
              }}
              className="flex items-center justify-between p-2.5 mb-2 rounded-xl border text-xs font-bold cursor-pointer transition group"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Search size={13} className="shrink-0" />
                <span className="truncate">Search Leads for "{sidebarSearch}"</span>
              </span>
              <span 
                style={{ color: brandPrimaryColor, borderColor: `${brandPrimaryColor}30` }}
                className="text-[10px] bg-white px-1.5 py-0.5 rounded font-mono border shadow-2xs shrink-0 flex items-center gap-0.5"
              >
                ↵ Enter
              </span>
            </div>
          )}

          {displayedNavItems.length === 0 ? (
            <div className="text-center py-6 px-2 text-xs text-gray-400">
              No menu items match "{sidebarSearch}"
            </div>
          ) : (
            displayedNavItems.map((item, index) => {
              if (item.type === "header") {
                if (!open) return <div key={index} className="my-2 border-t border-gray-200/60" />;
                return (
                  <div key={index} className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-3 pt-4 pb-1">
                    {item.label}
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === "/forms" && location.pathname.startsWith("/forms") && item.path !== "/forms/create" && location.pathname !== "/forms/create");

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    setMobileOpen(false);
                    if (sidebarSearch) setSidebarSearch('');
                  }}
                  title={!open ? item.label : ""}
                  style={isActive ? {
                    backgroundColor: `${brandPrimaryColor}15`,
                    color: brandPrimaryColor,
                    borderLeft: `3px solid ${brandPrimaryColor}`,
                    fontWeight: "700"
                  } : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "shadow-xs border border-transparent"
                      : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      size={16} 
                      style={isActive ? { color: brandPrimaryColor } : undefined} 
                      className={isActive ? "" : item.badge ? "animate-pulse" : "text-gray-400"} 
                    />
                    {open && <span>{item.label}</span>}
                  </div>
                  {open && item.badge && (
                    <span 
                      className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-2xs animate-pulse"
                      style={{ backgroundColor: brandPrimaryColor }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      {item.badge}
                    </span>
                  )}
                  {open && item.count && (
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })
          )}

          {/* Super Admin Quick Link */}
          {user?.role === 'SUPER_ADMIN' && (
            <div className="pt-3">
              <Link
                to="/super-admin"
                title={!open ? "Super Admin" : ""}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
              >
                <Shield size={16} className="text-purple-600" />
                {open && <span>Super Admin Control</span>}
              </Link>
            </div>
          )}
        </nav>

        {/* Footer / User Profile Link (No Logout button here) */}
        <div className="p-3 border-t border-gray-200/60 bg-white">
          {open ? (
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition group cursor-pointer"
              title="View Account Profile"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div 
                  className="w-8 h-8 rounded-xl text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {initials}
                </div>
                <div className="truncate">
                  <div 
                    className="text-xs font-bold truncate text-gray-900 transition-colors"
                  >
                    {user?.name || user?.firstName || "User"}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-gray-500 font-medium truncate">
                      {user?.role === "CALLER" ? "Counselor" : user?.role || "Admin"}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={15} className="text-gray-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
            </Link>
          ) : (
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="w-full flex justify-center p-2 rounded-xl hover:bg-gray-50 text-gray-700 transition cursor-pointer"
              title="View Account Profile"
            >
              <div 
                className="w-8 h-8 rounded-xl text-white flex items-center justify-center text-xs font-black shadow-xs"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                {initials}
              </div>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${open ? "lg:ml-64" : "lg:ml-20"}`}>
        {/* Modern Clean Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 lg:px-8 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-gray-900 hidden sm:block">
                Leads <span className="text-gray-400 font-normal text-xs ml-1">Workspace</span>
              </h2>
              {isCaller && (
                <span 
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                  style={{
                    backgroundColor: `${brandPrimaryColor}15`,
                    color: brandPrimaryColor,
                    borderColor: `${brandPrimaryColor}30`
                  }}
                >
                  🎧 Telecaller Desk
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Telephony Status (Admin Only) */}
            {isAdmin && (
              <Link
                to="/lead-management/wallboard"
                title="View Live Telephony Wallboard"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-semibold transition shadow-2xs"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Telephony Live</span>
              </Link>
            )}

            {/* Profile Dropdown Menu & Logout in Navbar */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-2xl hover:bg-gray-100 transition border border-gray-200 bg-white cursor-pointer shadow-2xs"
                title="Account Menu"
              >
                <div 
                  className="w-7 h-7 rounded-xl text-white flex items-center justify-center font-black text-xs shadow-xs"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">
                    {user?.name || user?.firstName || "Account"}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">
                    {user?.role === "CALLER" ? "Counselor" : user?.role || "Admin"}
                  </span>
                </div>
                <ChevronDown size={13} className={`text-gray-400 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl border border-gray-200 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Header info */}
                  <div 
                    className="p-3 rounded-2xl border mb-1.5"
                    style={{
                      backgroundColor: `${brandPrimaryColor}0D`,
                      borderColor: `${brandPrimaryColor}25`
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0"
                        style={{ backgroundColor: brandPrimaryColor }}
                      >
                        {initials}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-black text-gray-900 truncate">
                          {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Team Member'}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">{user?.email || 'No email'}</div>
                        <span 
                          className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                          style={{
                            backgroundColor: `${brandPrimaryColor}18`,
                            color: brandPrimaryColor
                          }}
                        >
                          {user?.role === "CALLER" ? "Counselor" : user?.role || "Admin"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <User size={15} style={{ color: brandPrimaryColor }} />
                      <span>My Profile & Details</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/lead-management/wallboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                      >
                        <Radio size={15} className="text-emerald-600" />
                        <span>Live Telephony Wallboard</span>
                      </Link>
                    )}

                    {user?.role === 'SUPER_ADMIN' && (
                      <Link
                        to="/super-admin"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition cursor-pointer"
                      >
                        <Shield size={15} className="text-purple-600" />
                        <span>Super Admin Portal</span>
                      </Link>
                    )}
                  </div>

                  {/* Divider & Logout */}
                  <div className="pt-1.5 mt-1.5 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
