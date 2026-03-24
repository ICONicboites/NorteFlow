import * as React from "react";
import { MobileSidebar } from "./MobileSidebar";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useTheme } from "../providers/ThemeProvider";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";

import {
  BarChart3,
  Building2,
  Moon,
  Sun,
  Wallet,
  ReceiptText,
  LogOut,
} from "lucide-react";

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}

export function AppLayout() {
  const { logout } = useAuth();
  const { toggle, theme } = useTheme();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const title = React.useMemo(() => {
    if (location.pathname.startsWith("/dashboard")) return "Dashboard";
    if (location.pathname.startsWith("/businesses")) return "Businesses";
    if (location.pathname.startsWith("/income")) return "Income";
    if (location.pathname.startsWith("/expenses")) return "Expenses";
    return "NorteFlow";
  }, [location.pathname]);

  return (
    <div className="app-bg min-h-screen">
      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        toggleTheme={toggle}
        loggingOut={loggingOut}
        logout={async () => {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
          }
        }}
      />
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 flex-col bg-white/10 dark:bg-slate-950/60 border-r border-glass shadow-glass-glow backdrop-blur-glass px-0 py-0 z-30 justify-between">
          <div>
            <div className="flex flex-col items-center gap-4 pt-8 pb-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/80 via-fuchsia-500/60 to-emerald-400/80 shadow-xl border-4 border-white/30 dark:border-slate-900/40 flex items-center justify-center overflow-hidden">
                  <img
                    src={"/logo.svg"}
                    alt="NorteFlow Logo"
                    className="h-12 w-12 select-none"
                    draggable="false"
                  />
                </div>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 via-fuchsia-500 to-emerald-400 text-xs font-semibold text-white shadow-lg border border-white/20 backdrop-blur-sm animate-fade-in">
                  Premium
                </span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white tracking-tight drop-shadow">
                  NorteFlow
                </div>
                <div className="text-xs text-slate-300/80 font-medium">
                  Multi-business tracker
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-1 px-6 pb-4">
              <NavItem to="/dashboard" label="Dashboard" icon={BarChart3} />
              <NavItem to="/businesses" label="Businesses" icon={Building2} />
              <NavItem to="/income" label="Income" icon={Wallet} />
              <NavItem to="/expenses" label="Expenses" icon={ReceiptText} />
            </nav>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full justify-center glassy-btn border-glass shadow-glass-glow text-slate-800 dark:text-white hover:bg-accent-blue/10 hover:text-accent-blue dark:hover:text-accent-blue focus-visible:ring-accent-blue"
              onClick={toggle}
              type="button"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="ml-2">Toggle theme</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center glassy-btn border-glass shadow-glass-glow text-slate-800 dark:text-white hover:bg-accent-blue/10 hover:text-accent-blue dark:hover:text-accent-blue focus-visible:ring-accent-blue"
              onClick={async () => {
                setLoggingOut(true);
                try {
                  await logout();
                } finally {
                  setLoggingOut(false);
                }
              }}
              type="button"
              disabled={loggingOut}
            >
              {loggingOut ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </aside>
        <main className="flex-1 w-full md:ml-72">
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 flex items-center justify-between relative">
            <button
              className="fixed left-2 top-2 z-50 p-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-lg md:hidden"
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-menu"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {location.pathname}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggle}
                type="button"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  setLoggingOut(true);
                  try {
                    await logout();
                  } finally {
                    setLoggingOut(false);
                  }
                }}
                type="button"
                aria-label="Logout"
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="p-2 sm:p-4 max-w-full md:max-w-7xl mx-auto">
            <Card className="p-0 overflow-hidden">
              <Outlet />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
