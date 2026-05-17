import { createFileRoute, Outlet, Link, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  FolderOpen,
  LogOut,
  Menu,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Glammee" }, { name: "robots", content: "noindex" }],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { admin: true } as any });
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) {
      throw redirect({ to: "/login", search: { admin: true } as any });
    }
  },
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/queue", label: "Queue", icon: ListOrdered },
  { to: "/admin/staff", label: "Staff", icon: Users },
  { to: "/admin/content", label: "Content", icon: Megaphone },
  { to: "/admin/records", label: "Records", icon: FolderOpen },
];

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <img src={logo} alt="Glammee" className="h-9 w-9" />
        <div>
          <div className="font-display text-xl font-bold text-foreground">Glammee</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-primary">Admin Suite</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-smooth",
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-foreground/70 hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="px-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Signed in
          </div>
          <div className="text-sm font-medium truncate">{email || "—"}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-foreground/80 hover:text-foreground hover:bg-white/5"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-surface-1 border-r border-white/5 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-surface-1 border-r border-white/5 animate-slide-in-right">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-30 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg text-foreground">Admin Suite</span>
          <span className="w-9" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
